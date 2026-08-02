import express from "express";
import path from "path";
import cors from "cors";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import repliesRouter from "./routes/replies.js";
import roomsRouter from "./routes/rooms.js";
import invitesRouter from "./routes/invites.js";
import uploadRouter from "./routes/upload.js";
import adminRouter from "./routes/admin.js";
import reportsRouter from "./routes/reports.js";
import logging from "./middleware/logging.js";
import errors from "./middleware/errors.js";
import xss from "./middleware/xss.js";
import notFound from "./middleware/notFound.js";
import authRouter from "./routes/auth.js";
import authenticated from "./middleware/auth.js";
import { resolveCorsOrigin } from "./config/env.js";
import prisma from "./prisma.js";

const app = express();

app.use(cors({ origin: resolveCorsOrigin() }));
app.use(express.json({ limit: "15mb" }));
app.use(xss);
app.use(logging.logRequest);
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "feedbackX API" });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({
      status: "degraded",
      db: "down",
      error:
        "Database is temporarily unreachable. Wake your Supabase project in the dashboard, wait a few seconds, then try again.",
    });
  }
});

app.use("/v1/auth", authRouter);
app.use("/v1/rooms", roomsRouter);

app.use(authenticated);

app.use("/v1/users", usersRouter);
app.use("/v1/posts", postsRouter);
app.use("/v1/replies", repliesRouter);
app.use("/v1/invites", invitesRouter);
app.use("/v1/upload", uploadRouter);
app.use("/v1/reports", reportsRouter);
app.use("/v1/admin", adminRouter);

app.use(errors.errorHandler);
app.use(notFound);

export default app;
