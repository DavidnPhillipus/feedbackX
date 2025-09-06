import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import prisma from "../prisma";
import { connect } from "http2";

export const getPosts: RequestHandler = async (req, res) => {
  const posts = await prisma.findMany();
  res.json({ posts });
};

export const createPost: RequestHandler = async (req, res) => {
  const body = req.body;
  const user_id = req.body.user_id;
  const post = await prisma.post.create({
    data: { ...body },
  });
  res.status(201).json(post);
};

export const getPost: RequestHandler = async (req, res, next) => {
  const post_id = Number.parseInt(req.params.id!);
  const post = await prisma.post.FindUnique({
    where: { id: post_id },
    include: {
      replies: true,
      _count: true,
    },
  });
  if (!post) {
    return next(new Error("404"));
  }
  res.json({ post });
};

export const updatePost: RequestHandler = async (req, res) => {
  const postId = Number.parseInt(req.params.id!);
  const post = await prisma.post.update({
    where: { id: postId },
    data: req.body,
  });
  res.json({ post });
};

export const deletePost: RequestHandler = async (req, res) => {
  const postId = parseInt(req.params.id!);
  const result = await prisma.post.delete({
    where: { id: postId },
  });
  res.sendStatus(200);
};

//Moving on to the likes section

export const createLike: RequestHandler = async (req, res) => {
  const postId = Number.parseInt(req.params.id!);
  const userId = req.user.id;

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      likes: {
        connect: {
          id: userId,
        },
      },
    },
  });
  res.status(201).json(post);
};
