import type { NextFunction, Request, RequestHandler, Response } from "express";
import prisma from "../prisma";
import { parseTags, stringifyTags } from "../utils/tags.js";
import {
  ALLOWED_REACTIONS,
  buildReactionCounts,
  isAllowedReaction,
  trendingScore,
} from "../utils/reactions.js";
import { getMediaKind } from "../utils/fileTypes.js";
import {
  createRoomForPost,
  getOrCreateRoomForPost,
  getRoomByPostId,
} from "../chat/store.js";

const postInclude = {
  author: true,
  likes: { select: { emoji: true, userId: true } },
  _count: { select: { likes: true, replies: true, followers: true } },
} as const;

type PostWithMeta = {
  id: number;
  title: string;
  body: string;
  imageUrl: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  userId: number;
  published: boolean;
  tags: string;
  createdAt: Date;
  author: { name: string; username: string; avatarUrl: string | null } | null;
  likes: { emoji: string; userId: number }[];
  _count: { likes: number; replies: number; followers: number };
};

function resolveMedia(post: PostWithMeta) {
  const url = post.attachmentUrl || post.imageUrl;
  const type = post.attachmentType || (post.imageUrl ? "image/jpeg" : null);
  const name = post.attachmentName || null;
  const mediaKind = type ? getMediaKind(type) : post.imageUrl ? "image" : null;
  return { url, type, name, mediaKind };
}

async function getReactionSummary(postId: number) {
  const likes = await prisma.postLike.findMany({
    where: { postId },
    select: { emoji: true },
  });
  return buildReactionCounts(likes);
}

function formatPost(
  post: PostWithMeta,
  viewerId?: number,
  followedAuthorIds?: Set<number>
) {
  const tags = parseTags(post.tags);
  const category = tags[0] || "General";
  const reactions = buildReactionCounts(post.likes);
  const userLike = viewerId
    ? post.likes.find((like) => like.userId === viewerId)
    : undefined;
  const media = resolveMedia(post);

  return {
    id: post.id,
    title: post.title,
    description: post.body,
    body: post.body,
    category,
    tags,
    post: media.url || null,
    imageUrl: post.imageUrl,
    attachmentUrl: media.url,
    attachmentType: media.type,
    attachmentName: media.name,
    mediaKind: media.mediaKind,
    username: post.author?.name || "Unknown",
    authorUsername: post.author?.username || null,
    profilePicture: post.author?.avatarUrl || null,
    reactions,
    userReaction: userLike?.emoji ?? null,
    likeCount: post._count.likes,
    replyCount: post._count.replies,
    trendingScore: trendingScore(post),
    published: post.published,
    userId: post.userId,
    authorIsFollowing: followedAuthorIds?.has(post.userId) ?? false,
    roomId: getRoomByPostId(post.id)?.id ?? null,
    createdAt: post.createdAt,
  };
}

export const getPosts: RequestHandler = async (req: Request, res: Response) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || "10"), 10)));
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const feed = String(req.query.feed || "all");
  const userId = req.query.userId
    ? Number.parseInt(String(req.query.userId), 10)
    : undefined;
  const viewerId = req.user?.id;

  const where: any = { published: true };
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
    ];
  }

  if (feed === "following" && viewerId) {
    const followedUsers = await prisma.userFollow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });
    const authorIds = followedUsers.map((f) => f.followingId);
    if (authorIds.length === 0) {
      return res.json({ posts: [], page, limit, total: 0, feed });
    }
    where.userId = { in: authorIds };
  } else if (feed === "liked" && viewerId) {
    const liked = await prisma.postLike.findMany({
      where: { userId: viewerId },
      select: { postId: true },
    });
    const postIds = liked.map((l) => l.postId);
    if (postIds.length === 0) {
      return res.json({ posts: [], page, limit, total: 0, feed });
    }
    where.id = { in: postIds };
  }

  const findOptions = {
    where,
    include: postInclude,
    ...(feed === "trending" ? {} : { orderBy: { createdAt: "desc" as const } }),
  } as const;

  const posts = (await prisma.post.findMany(findOptions)) as unknown as PostWithMeta[];

  let sorted: PostWithMeta[] = posts;
  if (feed === "trending") {
    sorted = [...posts].sort((a, b) => trendingScore(b) - trendingScore(a));
  }

  const authorIds = [...new Set(sorted.map((p) => p.userId))];
  const userFollows =
    viewerId && authorIds.length > 0
      ? await prisma.userFollow.findMany({
          where: { followerId: viewerId, followingId: { in: authorIds } },
          select: { followingId: true },
        })
      : [];
  const followedAuthorIds = new Set(userFollows.map((f) => f.followingId));

  let formatted = sorted.map((post) => formatPost(post, viewerId, followedAuthorIds));

  if (category && category !== "All") {
    formatted = formatted.filter((p) => p.category === category);
  }

  const total = formatted.length;
  const paginated = formatted.slice((page - 1) * limit, page * limit);

  res.json({ posts: paginated, page, limit, total, feed });
};

export const createPost: RequestHandler = async (req: Request, res: Response) => {
  const tags = req.body.tags || [];
  const attachmentUrl = req.body.attachmentUrl || req.body.imageUrl || null;
  const attachmentType = req.body.attachmentType || null;
  const attachmentName = req.body.attachmentName || null;
  const imageUrl =
    req.body.imageUrl ||
    (attachmentType && getMediaKind(attachmentType) === "image" ? attachmentUrl : null);

  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      body: req.body.body,
      imageUrl,
      attachmentUrl,
      attachmentType,
      attachmentName,
      userId: req.user?.id,
      published: req.body.published ?? true,
      tags: stringifyTags(tags),
    },
    include: postInclude,
  });

  createRoomForPost(
    post.id,
    post.title,
    post.imageUrl || post.attachmentUrl,
    post.userId,
    post.author?.name || "Author"
  );

  res.status(201).json({ post: formatPost(post, req.user?.id) });
};

export const getPost: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude,
  });

  if (!post) {
    return next(new Error("404"));
  }

  res.json({ post: formatPost(post, req.user?.id) });
};

export const updatePost: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const data: any = { ...req.body };
  if (data.tags) data.tags = stringifyTags(data.tags);

  const post = await prisma.post.update({
    where: { id: postId },
    data,
    include: postInclude,
  });

  res.json({ post: formatPost(post, req.user?.id) });
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  await prisma.post.delete({ where: { id: postId } });
  res.sendStatus(200);
};

export const getPostFeedbackRoom: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });

  if (!post) {
    return next(new Error("404"));
  }

  const room = getOrCreateRoomForPost(
    post.id,
    post.title,
    post.imageUrl,
    post.userId,
    post.author?.name || "Author"
  );

  res.json({ room });
};

export const createLike: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;
  const emoji = String(req.body?.emoji || "👍");

  if (!isAllowedReaction(emoji)) {
    return res.status(400).json({
      message: `Reaction must be one of: ${ALLOWED_REACTIONS.join(" ")}`,
    });
  }

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing?.emoji === emoji) {
    await prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
    const reactions = await getReactionSummary(postId);
    return res.json({ liked: false, userReaction: null, reactions });
  }

  await prisma.postLike.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId, emoji },
    update: { emoji },
  });

  const reactions = await getReactionSummary(postId);
  res.json({ liked: true, userReaction: emoji, reactions });
};

export const deleteLike: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;

  await prisma.postLike.deleteMany({ where: { userId, postId } });
  const reactions = await getReactionSummary(postId);
  res.json({ liked: false, userReaction: null, reactions });
};

export const createFollow: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;

  await prisma.postFollow.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId },
    update: {},
  });

  res.json({ followed: true });
};

export const deleteFollow: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;

  await prisma.postFollow.deleteMany({ where: { userId, postId } });
  res.json({ followed: false });
};

export const getReplies: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const replies = await prisma.reply.findMany({
    where: { postId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  res.json({ replies });
};

export const createReply: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const reply = await prisma.reply.create({
    data: {
      body: req.body.body,
      postId,
      userId: req.user?.id,
    },
    include: { author: true },
  });

  res.status(201).json(reply);
};
