import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import env from "dotenv";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { parseRoles, stringifyRoles } from "../utils/roles.js";

env.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

function publicUser(user: {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string;
  avatarUrl?: string | null;
  bio?: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roles: parseRoles(user.roles),
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };
}

async function uniqueUsername(email: string): Promise<string> {
  const raw = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  let base = raw.length >= 5 ? raw.slice(0, 40) : `user_${raw}`;
  if (base.length < 5) {
    base = `user_${Date.now().toString(36).slice(-6)}`;
  }

  let username = base;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base.slice(0, 44)}${suffix}`;
    suffix += 1;
  }
  return username;
}

function issueToken(user: { id: number; username: string; roles: string }) {
  return jwt.sign(
    { id: user.id, username: user.username, roles: parseRoles(user.roles) },
    JWT_SECRET,
    { expiresIn: "6h" }
  );
}

export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    include: { password: true },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or email" });
  }

  if (!user.password?.hash) {
    return res.status(401).json({
      message: "This account uses Google sign-in. Continue with Google instead.",
    });
  }

  const passwordValid = await bcrypt.compare(password, user.password.hash);

  if (!passwordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = issueToken(user);
  res.json({ token, user: publicUser(user) });
};

export const register: RequestHandler = async (req, res) => {
  const { name, username, email, password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    return res.status(409).json({
      message:
        existing.username === username
          ? "Username already taken"
          : "Email already registered",
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      roles: stringifyRoles(["USER"]),
      password: {
        create: { hash: hashedPassword },
      },
    },
  });

  const token = issueToken(user);
  res.status(201).json({ token, user: publicUser(user) });
};

export const googleAuth: RequestHandler = async (req, res) => {
  const { credential } = req.body;

  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: "Google sign-in is not configured on the server" });
  }

  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Invalid or expired Google sign-in" });
  }

  if (!payload?.email || !payload.sub) {
    return res.status(400).json({ message: "Google account is missing required profile info" });
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];
  const avatarUrl = payload.picture || null;

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || googleId,
        verified: true,
        name: user.name || name,
        avatarUrl: user.avatarUrl || avatarUrl,
      },
    });
  } else {
    const username = await uniqueUsername(email);
    user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        googleId,
        avatarUrl,
        verified: true,
        roles: stringifyRoles(["USER"]),
      },
    });
  }

  const token = issueToken(user);
  res.json({ token, user: publicUser(user) });
};

export const me: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const postCount = await prisma.post.count({ where: { userId: user.id } });

  res.json({ user: { ...publicUser(user), postCount } });
};
