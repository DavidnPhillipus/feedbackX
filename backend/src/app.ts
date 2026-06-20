import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import repliesRouter from "./routes/replies.js";
import roomsRouter from "./routes/rooms.js";
import invitesRouter from "./routes/invites.js";
import uploadRouter from "./routes/upload.js";
import logging from "./middleware/logging.js";
import errors from "./middleware/errors.js";
import xss from "./middleware/xss.js";
import notFound from "./middleware/notFound.js";
import authRouter from "./routes/auth.js";
import authenticated from "./middleware/auth.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "15mb" }));
app.use(xss);
app.use(logging.logRequest);

app.get("/", (_req, res) => {
  res.json({ message: "feedbackX API" });
});

app.use("/v1/auth", authRouter);
app.use("/v1/rooms", roomsRouter);

app.use(authenticated);

app.use("/v1/users", usersRouter);
app.use("/v1/posts", postsRouter);
app.use("/v1/replies", repliesRouter);
app.use("/v1/invites", invitesRouter);
app.use("/v1/upload", uploadRouter);

app.use(errors.errorHandler);
app.use(notFound);

export default app;
