import http from "http";
import app from "./app";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import chatSocket from "./controllers/rooms";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  chatSocket(io, socket);
});
