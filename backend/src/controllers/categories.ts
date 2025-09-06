import type { RequestHandler } from "express";
import prisma from "../prisma";

const getCategories: RequestHandler = async (req, res) => {
  const categories = await prisma.categories.findMany();
  res.json({ categories });
};

export const getCategory: RequestHandler = async (req, res, next) => {
  const id = Number.parseInt(req.params.id!);
  const category = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!category) {
    return next(new Error("404"));
  }

  res.send({ category });
};

export const createCategory: RequestHandler = async (req, res) => {
  const body = req.body;
  const id = req.body.id;
  const post = await prisma.categories.create({
    data: { ...body },
  });
  res.status(201).json(post);
};

export const updateCategoty: RequestHandler = async (req, res, next) => {
  const id = parseInt(req.params.id!);
  const category = req.body;
  const newCategory = await prisma.categories.update({
    where: { id: id },
    data: category,
  });
  if (!newCategory) {
    return next(new Error("404"));
  }
  res.send({ newCategory });
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
  const id = parseInt(req.params.id!);
  const result = await prisma.categories.delete({
    where: { id: id },
  });
  if (!result) {
    return next(new Error("404"));
  }
  res.sendStatus(200);
};
