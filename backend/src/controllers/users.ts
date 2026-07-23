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

async function attachIsFollowing(users: any[], viewerId?: number) {
  if (!viewerId || users.length === 0) {
    return users.map((user) => ({ ...publicUser(user), isFollowing: false }));
  }

  const ids = users.map((user) => user.id);
  const follows = await prisma.userFollow.findMany({
    where: { followerId: viewerId, followingId: { in: ids } },
    select: { followingId: true },
  });
  const followingSet = new Set(follows.map((row) => row.followingId));

  return users.map((user) => ({
    ...publicUser(user),
    isFollowing: followingSet.has(user.id),
  }));
}

export const getUsers: RequestHandler = async (req: Request, res: Response) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(30, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;
  const discover = req.query.discover === "true";

  const where =
    discover && req.user?.id
      ? { id: { not: req.user.id } }
      : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const userIds = users.map((u) => u.id);

  const [postCounts, followerCounts, followingCounts, myFollows] = await Promise.all([
    userIds.length
      ? prisma.post.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds }, published: true },
          _count: { _all: true },
        })
      : [],
    userIds.length
      ? prisma.userFollow.groupBy({
          by: ["followingId"],
          where: { followingId: { in: userIds } },
          _count: { _all: true },
        })
      : [],
    userIds.length
      ? prisma.userFollow.groupBy({
          by: ["followerId"],
          where: { followerId: { in: userIds } },
          _count: { _all: true },
        })
      : [],
    req.user?.id && userIds.length
      ? prisma.userFollow.findMany({
          where: { followerId: req.user.id, followingId: { in: userIds } },
          select: { followingId: true },
        })
      : [],
  ]);

  const postsByUser = new Map(postCounts.map((row) => [row.userId, row._count._all]));
  const followersByUser = new Map(followerCounts.map((row) => [row.followingId, row._count._all]));
  const followingByUser = new Map(followingCounts.map((row) => [row.followerId, row._count._all]));
  const followingSet = new Set(myFollows.map((row) => row.followingId));

  res.json({
    users: users.map((user) => ({
      ...publicUser(user),
      postCount: postsByUser.get(user.id) ?? 0,
      followerCount: followersByUser.get(user.id) ?? 0,
      followingCount: followingByUser.get(user.id) ?? 0,
      isFollowing: followingSet.has(user.id),
    })),
    page,
    limit,
    total,
    hasMore: skip + users.length < total,
  });
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

  const [postCount, followerCount, followingCount] = await Promise.all([
    prisma.post.count({
      where:
        req.user?.id === id
          ? { userId: id }
          : { userId: id, published: true },
    }),
    prisma.userFollow.count({ where: { followingId: id } }),
    prisma.userFollow.count({ where: { followerId: id } }),
  ]);

  let isFollowing = false;
  if (req.user?.id && req.user.id !== id) {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId: req.user.id, followingId: id },
      },
    });
    isFollowing = Boolean(follow);
  }

  res.json({
    user: { ...publicUser(user), postCount, followerCount, followingCount, isFollowing },
  });
};

export const followUser: RequestHandler = async (req: Request, res: Response) => {
  const followingId = Number.parseInt(req.params.id!, 10);
  const followerId = req.user.id;

  if (followingId === followerId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.userFollow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });

  res.json({ following: true });
};

export const unfollowUser: RequestHandler = async (req: Request, res: Response) => {
  const followingId = Number.parseInt(req.params.id!, 10);
  const followerId = req.user.id;

  await prisma.userFollow.deleteMany({ where: { followerId, followingId } });
  res.json({ following: false });
};

export const getUserFollowing: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!, 10);
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(30, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return next(new Error("404"));
  }

  const [rows, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: id },
      include: { following: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userFollow.count({ where: { followerId: id } }),
  ]);

  const users = await attachIsFollowing(
    rows.map((row) => row.following),
    req.user?.id
  );

  res.json({
    users,
    page,
    limit,
    total,
    hasMore: skip + rows.length < total,
  });
};

export const getUserFollowers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!, 10);
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(30, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return next(new Error("404"));
  }

  const [rows, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: id },
      include: { follower: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userFollow.count({ where: { followingId: id } }),
  ]);

  const users = await attachIsFollowing(
    rows.map((row) => row.follower),
    req.user?.id
  );

  res.json({
    users,
    page,
    limit,
    total,
    hasMore: skip + rows.length < total,
  });
};

export const updateUser: RequestHandler = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, email, bio, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      bio,
      avatarUrl: avatarUrl === "" || avatarUrl === null ? null : avatarUrl,
    },
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
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(30, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new Error("404"));
  }

  const isOwner = req.user?.id === id;
  const where = isOwner ? { userId: id } : { userId: id, published: true };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  res.json({
    posts,
    page,
    limit,
    total,
    hasMore: skip + posts.length < total,
  });
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
      avatar: inv.avatar || inv.inviter.avatarUrl || null,
      roomId: inv.roomId,
      status: inv.status,
    })),
  });
};
