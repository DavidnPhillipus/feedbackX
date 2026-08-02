import { assertEnv, getPort, resolveCorsOrigin } from "./config/env";
import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app";
import chatSocket from "./controllers/rooms";
import prisma, { ensureDbReady } from "./prisma";
import { createRoomForPost } from "./chat/store";
import { setupSupabaseStorage } from "./setup-supabase-storage";

assertEnv();

async function syncPostFeedbackRooms() {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    for (const post of posts) {
      // Room metadata only — messages hydrate lazily when someone joins.
      createRoomForPost(
        post.id,
        post.title,
        post.imageUrl,
        post.userId,
        post.author?.name || "Author"
      );
    }
  } catch (err) {
    console.warn("Could not sync post feedback rooms:", err);
  }
}

async function main() {
  try {
    await ensureDbReady();
    // Ensures post-images bucket + RLS exist (safe to re-run).
    await setupSupabaseStorage();
  } catch (err) {
    console.error(
      "Could not reach the database. Wake your Supabase project and check DATABASE_URL.",
      err
    );
  }

  const port = getPort();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: resolveCorsOrigin(), methods: ["GET", "POST"] },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);
    chatSocket(io, socket);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => {
      server.off("error", reject);
      resolve();
    });
  });

  await syncPostFeedbackRooms();
  console.log(`feedbackX API listening on 0.0.0.0:${port} (HTTP + WebSocket)`);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
