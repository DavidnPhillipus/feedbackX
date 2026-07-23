import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import env from "dotenv";
import * as bcrypt from "bcrypt";
import { parseRoles, stringifyRoles } from "../utils/roles.js";
import { buildResetUrl, createPasswordResetToken } from "../utils/passwordReset.js";
import { isEmailConfigured, sendPasswordResetEmail } from "../utils/mail.js";

env.config();

const JWT_SECRET = process.env.JWT_SECRET!;

function publicUser(user: {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string;
  verified?: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roles: parseRoles(user.roles),
    verified: user.verified ?? false,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };
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
    return res.status(401).json({ message: "Invalid username or email" });
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
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: normalizedEmail }] },
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
      email: normalizedEmail,
      verified: true,
      roles: stringifyRoles(["USER"]),
      password: {
        create: { hash: hashedPassword },
      },
    },
  });

  res.status(201).json({
    message: "Account created. Please log in.",
    email: user.email,
  });
};

const RESET_SUCCESS_MESSAGE =
  "If an account with that email exists, we've sent password reset instructions.";

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    include: { password: true },
  });

  if (!user?.password?.hash) {
    return res.json({ message: RESET_SUCCESS_MESSAGE });
  }

  const token = await createPasswordResetToken(user.id);
  const resetUrl = buildResetUrl(token);

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return res.status(500).json({ message: "Could not send reset email. Try again later." });
  }

  const payload: { message: string; resetUrl?: string } = { message: RESET_SUCCESS_MESSAGE };
  if (!isEmailConfigured()) {
    payload.resetUrl = resetUrl;
  }

  res.json(payload);
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, password } = req.body;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { include: { password: true } } },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    if (resetToken) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    }
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.password.upsert({
      where: { userId: resetToken.userId },
      create: { userId: resetToken.userId, hash: hashedPassword },
      update: { hash: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  res.json({ message: "Password updated. You can log in with your new password." });
};

export const me: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const postCount = await prisma.post.count({ where: { userId: user.id } });
  const [followerCount, followingCount] = await Promise.all([
    prisma.userFollow.count({ where: { followingId: user.id } }),
    prisma.userFollow.count({ where: { followerId: user.id } }),
  ]);

  res.json({
    user: { ...publicUser(user), postCount, followerCount, followingCount },
  });
};
