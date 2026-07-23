import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { hasRole } from "../utils/roles.js";

env.config();

const auth: RequestHandler = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("Missing JWT secret");
    }
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Please authenticate" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Please authenticate" });
  }
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (!hasRole(req?.user?.roles, "ADMIN")) {
    return res.status(403).json({ error: "You're not allowed to do this" });
  }
  next();
};

export default auth;
