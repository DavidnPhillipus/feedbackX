import { Server, Socket } from "socket.io";
import {
  addMessage,
  createRoom,
  getAllRooms,
  getOnlineInRoom,
  getRoomMessages,
  hydrateRoomMessages,
  joinRoom,
  leaveRoom,
  markRoomRead,
  onlineUsers,
} from "../chat/store";

export default function chatSocket(io: Server, socket: Socket) {
  socket.on("register", ({ userId, userName }: { userId: string; userName: string }) => {
    onlineUsers.set(socket.id, { userId, userName, roomId: undefined });
    socket.emit("registered", { userId, userName });
    socket.emit("roomsList", getAllRooms());
  });

  socket.on("getRooms", () => {
    socket.emit("roomsList", getAllRooms());
  });

  socket.on(
    "createRoom",
    ({ roomName, userId, userName }: { roomName: string; userId: string; userName: string }) => {
      const room = createRoom(roomName, userId, userName);
      io.emit("roomsList", getAllRooms());
      socket.emit("roomCreated", room);
    }
  );

  socket.on(
    "joinRoom",
    async (
      { roomId, userId, userName }: { roomId: string; userId: string; userName: string },
      callback?: (payload: unknown) => void
    ) => {
      const room = joinRoom(roomId, userId, userName);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        callback?.({ error: "Room not found" });
        return;
      }

      const prev = onlineUsers.get(socket.id);
      if (prev?.roomId) socket.leave(`room-${prev.roomId}`);

      onlineUsers.set(socket.id, { userId, userName, roomId });
      socket.join(`room-${roomId}`);
      markRoomRead(roomId, userId);

      await hydrateRoomMessages(roomId);

      const payload = {
        roomId,
        messages: getRoomMessages(roomId),
        members: room.members.map((id) => ({
          id,
          name: room.memberNames[id] ?? "Member",
        })),
        online: getOnlineInRoom(roomId),
      };

      socket.emit("roomJoined", payload);
      callback?.(payload);

      socket.to(`room-${roomId}`).emit("userJoined", {
        userId,
        userName,
        roomId,
        online: getOnlineInRoom(roomId),
      });

      io.emit("roomsList", getAllRooms());
    }
  );

  socket.on("leaveRoom", ({ roomId, userId }: { roomId: string; userId: string }) => {
    leaveRoom(roomId, userId);
    socket.leave(`room-${roomId}`);

    const user = onlineUsers.get(socket.id);
    if (user) user.roomId = undefined;

    socket.to(`room-${roomId}`).emit("userLeft", {
      userId,
      roomId,
      online: getOnlineInRoom(roomId),
    });

    io.emit("roomsList", getAllRooms());
  });

  socket.on(
    "chatMessage",
    async (
      {
        roomId,
        text,
        userId,
        userName,
        attachmentUrl,
        attachmentName,
        attachmentType,
      }: {
        roomId: string;
        text: string;
        userId: string;
        userName: string;
        attachmentUrl?: string;
        attachmentName?: string;
        attachmentType?: string;
      },
      callback?: (msg: unknown) => void
    ) => {
      const attachmentPayload = {
        ...(attachmentUrl ? { url: attachmentUrl } : {}),
        ...(attachmentName ? { name: attachmentName } : {}),
        ...(attachmentType ? { type: attachmentType } : {}),
      };
      const msg = await addMessage(roomId, userId, userName, text, attachmentPayload);
      if (!msg) return;

      io.to(`room-${roomId}`).emit("chatMessage", msg);
      io.emit("roomsList", getAllRooms());
      callback?.(msg);
    }
  );

  socket.on(
    "typing",
    ({
      roomId,
      userId,
      userName,
      isTyping,
    }: {
      roomId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      socket.to(`room-${roomId}`).emit("typing", { roomId, userId, userName, isTyping });
    }
  );

  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user?.roomId) {
      socket.to(`room-${user.roomId}`).emit("userLeft", {
        userId: user.userId,
        roomId: user.roomId,
        online: getOnlineInRoom(user.roomId).filter((u) => u.userId !== user.userId),
      });
    }
    onlineUsers.delete(socket.id);
  });
}
