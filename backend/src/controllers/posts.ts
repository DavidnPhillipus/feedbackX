import type { NextFunction, Request, RequestHandler, Response } from "express";
import prisma from "../prisma";
import { parseTags, stringifyTags } from "../utils/tags.js";

function formatPost(post: any) {
  const tags = parseTags(post.tags);
  const category = tags[0] || "General";
  return {
    id: post.id,
    title: post.title,
    description: post.body,
    body: post.body,
    category,
    tags,
    post: post.imageUrl || `https://picsum.photos/600/400?image=${post.id}`,
    imageUrl: post.imageUrl,
    username: post.author?.name || "Unknown",
    profilePicture:
      post.author?.avatarUrl ||
      `https://i.pravatar.cc/80?img=${(post.userId % 70) + 1}`,
    emojis: ["👍", "❤️"],
    published: post.published,
    userId: post.userId,
    createdAt: post.createdAt,
  };
}

export const getPosts: RequestHandler = async (req: Request, res: Response) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || "10"), 10)));
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const userId = req.query.userId
    ? Number.parseInt(String(req.query.userId), 10)
    : undefined;

  const where: any = { published: true };
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { body: { contains: search } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  let formatted = posts.map(formatPost);
  if (category && category !== "All") {
    formatted = formatted.filter((p) => p.category === category);
  }

  res.json({ posts: formatted, page, limit });
};

export const createPost: RequestHandler = async (req: Request, res: Response) => {
  const tags = req.body.tags || [];
  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      body: req.body.body,
      imageUrl: req.body.imageUrl || null,
      userId: req.user?.id,
      published: req.body.published ?? true,
      tags: stringifyTags(tags),
    },
    include: { author: true },
  });
  res.status(201).json({ post: formatPost(post) });
};

export const getPost: RequestHandler = async (
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

  res.json({ post: formatPost(post) });
};

export const updatePost: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const data: any = { ...req.body };
  if (data.tags) data.tags = stringifyTags(data.tags);

  const post = await prisma.post.update({
    where: { id: postId },
    data,
    include: { author: true },
  });

  res.json({ post: formatPost(post) });
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  await prisma.post.delete({ where: { id: postId } });
  res.sendStatus(200);
};

export const createLike: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;

  await prisma.postLike.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId },
    update: {},
  });

  res.json({ liked: true });
};

export const deleteLike: RequestHandler = async (req: Request, res: Response) => {
  const postId = Number.parseInt(req.params.id!, 10);
  const userId = req.user.id;

  await prisma.postLike.deleteMany({ where: { userId, postId } });
  res.json({ liked: false });
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
