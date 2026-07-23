import type { RequestHandler } from "express";

const getCategories: RequestHandler = async (req, res) => {
  res.json({ categories: [] });
};

export const getCategory: RequestHandler = async (_req, res) => {
  res.status(404).json({ error: "Category endpoint is disabled" });
};

export const createCategory: RequestHandler = async (_req, res) => {
  res.status(404).json({ error: "Category endpoint is disabled" });
};

export const updateCategoty: RequestHandler = async (_req, res) => {
  res.status(404).json({ error: "Category endpoint is disabled" });
};

export const deleteCategory: RequestHandler = async (_req, res) => {
  res.status(404).json({ error: "Category endpoint is disabled" });
};
