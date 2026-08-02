import type { RequestHandler } from "express";
import prisma from "../prisma.js";
import { parseRoles, stringifyRoles } from "../utils/roles.js";

function adminUser(user: {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string;
  verified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  bannedAt: Date | null;
  banReason: string | null;
  createdAt: Date;
  _count?: { posts: number; reportsAgainst: number };
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roles: parseRoles(user.roles),
    verified: user.verified,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    bannedAt: user.bannedAt,
    banReason: user.banReason,
    createdAt: user.createdAt,
    postCount: user._count?.posts ?? 0,
    reportCount: user._count?.reportsAgainst ?? 0,
  };
}

export const getStats: RequestHandler = async (_req, res) => {
  const [
    users,
    bannedUsers,
    posts,
    unpublishedPosts,
    openReports,
    reviewedReports,
    messages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { bannedAt: { not: null } } }),
    prisma.post.count(),
    prisma.post.count({ where: { published: false } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.report.count({ where: { status: { in: ["resolved", "dismissed"] } } }),
    prisma.chatMessage.count(),
  ]);

  res.json({
    stats: {
      users,
      bannedUsers,
      posts,
      unpublishedPosts,
      openReports,
      reviewedReports,
      messages,
    },
  });
};

export const listUsers: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;
  const q = String(req.query.q || "").trim();
  const role = String(req.query.role || "").trim().toUpperCase();
  const banned = String(req.query.banned || "");

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { username: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (banned === "true") where.bannedAt = { not: null };
  if (banned === "false") where.bannedAt = null;
  if (role === "ADMIN") where.roles = { contains: "ADMIN" };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { posts: true, reportsAgainst: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users: users.map(adminUser),
    page,
    limit,
    total,
    hasMore: skip + users.length < total,
  });
};

export const updateUser: RequestHandler = async (req, res) => {
  const userId = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  if (userId === req.user?.id && req.body?.roles) {
    return res.status(400).json({ error: "Cannot change your own roles" });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return res.status(404).json({ error: "User not found" });
  }

  const data: Record<string, unknown> = {};

  if (Array.isArray(req.body?.roles)) {
    const roles = Array.from(
      new Set(
        req.body.roles
          .map((r: unknown) => String(r).toUpperCase())
          .filter((r: string) => r === "USER" || r === "ADMIN")
      )
    );
    if (!roles.includes("USER")) roles.push("USER");
    data.roles = stringifyRoles(roles);
  }

  if (typeof req.body?.verified === "boolean") {
    data.verified = req.body.verified;
  }

  if (req.body?.banned === true) {
    data.bannedAt = new Date();
    data.banReason = String(req.body.banReason || "Banned by admin").slice(0, 500);
  } else if (req.body?.banned === false) {
    data.bannedAt = null;
    data.banReason = null;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { _count: { select: { posts: true, reportsAgainst: true } } },
  });

  res.json({ user: adminUser(user) });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const userId = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  if (userId === req.user?.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  await prisma.$transaction([
    prisma.invite.deleteMany({
      where: { OR: [{ inviterId: userId }, { invitedId: userId }] },
    }),
    prisma.reply.deleteMany({ where: { userId } }),
    prisma.postLike.deleteMany({ where: { userId } }),
    prisma.postFollow.deleteMany({ where: { userId } }),
    prisma.userFollow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    }),
    prisma.post.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  res.sendStatus(200);
};

export const listPosts: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;
  const q = String(req.query.q || "").trim();
  const published = String(req.query.published || "");

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
      { author: { username: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, replies: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      published: p.published,
      imageUrl: p.imageUrl,
      attachmentUrl: p.attachmentUrl,
      attachmentType: p.attachmentType,
      attachmentName: p.attachmentName,
      userId: p.userId,
      author: p.author,
      likeCount: p._count.likes,
      replyCount: p._count.replies,
      createdAt: p.createdAt,
    })),
    page,
    limit,
    total,
    hasMore: skip + posts.length < total,
  });
};

export const updatePost: RequestHandler = async (req, res) => {
  const postId = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(postId)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const data: Record<string, unknown> = {};
  if (typeof req.body?.published === "boolean") {
    data.published = req.body.published;
  }
  if (typeof req.body?.title === "string" && req.body.title.trim().length >= 3) {
    data.title = req.body.title.trim().slice(0, 200);
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data,
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, replies: true } },
    },
  });

  res.json({
    post: {
      id: post.id,
      title: post.title,
      body: post.body,
      published: post.published,
      imageUrl: post.imageUrl,
      attachmentUrl: post.attachmentUrl,
      userId: post.userId,
      author: post.author,
      likeCount: post._count.likes,
      replyCount: post._count.replies,
      createdAt: post.createdAt,
    },
  });
};

export const deletePost: RequestHandler = async (req, res) => {
  const postId = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(postId)) {
    return res.status(400).json({ error: "Invalid post id" });
  }
  await prisma.post.delete({ where: { id: postId } });
  res.sendStatus(200);
};
