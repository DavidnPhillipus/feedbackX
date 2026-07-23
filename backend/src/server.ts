import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app";
import chatSocket from "./controllers/rooms";
import prisma from "./prisma";
import { createRoomForPost, hydrateRoomMessages } from "./chat/store";

const port = Number(process.env.PORT) || 8080;
const clientOrigin = process.env.CLIENT_URL?.trim() || "*";

async function syncPostFeedbackRooms() {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    for (const post of posts) {
      createRoomForPost(
        post.id,
        post.title,
        post.imageUrl,
        post.userId,
        post.author?.name || "Author"
      );
      await hydrateRoomMessages(`post-${post.id}`);
    }
  } catch (err) {
    console.warn("Could not sync post feedback rooms:", err);
  }
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] },
});

io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);
  chatSocket(io, socket);
});

server.listen(port, async () => {
  await syncPostFeedbackRooms();
  console.log(`Server listening on http://localhost:${port} (HTTP + WebSocket)`);
});
