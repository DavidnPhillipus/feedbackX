import type { NextFunction, Request, RequestHandler, Response } from "express";
import prisma from "../prisma";
import * as bcrypt from "bcrypt";

export const getUsers: RequestHandler = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json({ users });
};

export const getUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!user) {
    return next(new Error("404"));
  }

  res.send({ user });
};

export const updateUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userId = req.user.id;
  delete req.body.roles;
  const user = await prisma.user.update({
    where: { id: userId },
    data: req.body,
  });

  res.json({ user });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const result = await prisma.user.delete({
    where: { id: userId },
  });

  res.sendStatus(200);
};

export const adminDeleteUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userId = parseInt(req.params.id!);
  const result = await prisma.user.delete({
    where: { id: userId },
  });

  res.sendStatus(200);
};

export const getUserPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      posts: true,
    },
  });

  if (!user) {
    return next(new Error("404"));
  }

  res.send({ posts: user.posts });
};

export const getUserLikedPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      postsLiked: true,
    },
  });

  if (!user) {
    return next(new Error("404"));
  }

  res.send({ posts: user.postsLiked });
};

export const getUserFollowedPosts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number.parseInt(req.params.id!);
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      postsFollowed: true,
    },
  });

  if (!user) {
    return next(new Error("404"));
  }

  res.send({ posts: user.postsFollowed });
};
