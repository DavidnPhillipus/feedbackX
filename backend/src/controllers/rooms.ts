import { Server, Socket } from "socket.io";
import prisma from "../prisma";

export default function chatSocket(io: Server, socket: Socket) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected");

    //create a chat room
    socket.on("createRoom", async ({ roomName, userId }) => {
      const room = await prisma.room.create({
        data: {
          name: roomName,
          createdById: userId,
          members: { connect: { id: userId } }, //Here you are just joining your own room of course
        },
      });

      socket.join(`room-${room.id}`); // use Id based channel
      io.emit("roomCreated", room);
    });

    //join a rooom if it's existing of course
    socket.on("joinRoom", async (roomId, userId) => {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!room) return;

      //  Add user to DB
      await prisma.room.update({
        where: { id: roomId },
        data: { members: { connect: { id: userId } } },
      });

      socket.join(`room-${roomId}`);
      io.to(`room-${roomId}`).emit("userJoined", { userId, roomId });
    });
    socket.on("chatMessage", async (message, userId, roomId) => {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!room) return;
      const msg = await prisma.messeage.create({
        data: {
          roomId,
          senderId: userId,
          content: message,
        },
      });
      io.to(`room-${roomId}`).emit("chatMessage", msg);
    });
  });
}
