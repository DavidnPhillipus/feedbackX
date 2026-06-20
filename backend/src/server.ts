import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app";
import chatSocket from "./controllers/rooms";

const port = Number(process.env.PORT) || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);
  chatSocket(io, socket);
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (HTTP + WebSocket)`);
});
