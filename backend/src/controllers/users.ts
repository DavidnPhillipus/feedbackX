import type { NextFunction, Request, RequestHandler, Response } from "express";
import prisma from "../prisma";
import { parseRoles } from "../utils/roles.js";

function publicUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roles: parseRoles(user.roles),
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

export const getUsers: RequestHandler = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ users: users.map(publicUser) });
};

export const getUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new Error("404"));
  }

  const postCount = await prisma.post.count({ where: { userId: id } });
  res.json({ user: { ...publicUser(user), postCount } });
};

export const updateUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, email, bio, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, bio, avatarUrl },
  });

  res.json({ user: publicUser(user) });
};

export const deleteUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.user.id;
  await prisma.user.delete({ where: { id: userId } });
  res.sendStatus(200);
};

export const adminDeleteUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = Number.parseInt(req.params.id!);
  if (userId === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }
  await prisma.user.delete({ where: { id: userId } });
  res.sendStatus(200);
};

export const getUserPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new Error("404"));
  }

  const posts = await prisma.post.findMany({
    where: { userId: id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({ posts });
};

export const getUserLikedPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new Error("404"));
  }

  const likes = await prisma.postLike.findMany({
    where: { userId: id },
    include: { post: { include: { author: true } } },
  });

  res.json({ posts: likes.map((l) => l.post) });
};

export const getUserFollowedPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new Error("404"));
  }

  const follows = await prisma.postFollow.findMany({
    where: { userId: id },
    include: { post: { include: { author: true } } },
  });

  res.json({ posts: follows.map((f) => f.post) });
};

export const getUserInvites: RequestHandler = async (req: Request, res: Response) => {
  const id = Number.parseInt(req.params.id!);
  const invites = await prisma.invite.findMany({
    where: {
      OR: [{ invitedId: id }, { invitedId: null }],
      status: "pending",
    },
    include: { inviter: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    invites: invites.map((inv) => ({
      id: inv.id,
      code: inv.code,
      title: inv.title || `${inv.inviter.name} invited you`,
      about: inv.about || "Join a feedback room",
      avatar:
        inv.avatar ||
        inv.inviter.avatarUrl ||
        `https://i.pravatar.cc/80?img=${(inv.inviterId % 70) + 1}`,
      roomId: inv.roomId,
      status: inv.status,
    })),
  });
};
