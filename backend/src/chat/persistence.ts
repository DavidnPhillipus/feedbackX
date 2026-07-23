import prisma from "../prisma.js";
import type { ChatMessage } from "./store.js";

function toChatMessage(row: {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  createdAt: Date;
}): ChatMessage {
  return {
    id: row.id,
    roomId: row.roomId,
    senderId: row.senderId,
    senderName: row.senderName,
    text: row.text,
    attachmentUrl: row.attachmentUrl ?? undefined,
    attachmentName: row.attachmentName ?? undefined,
    attachmentType: row.attachmentType ?? undefined,
    timestamp: row.createdAt.toISOString(),
  };
}

export async function loadRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toChatMessage);
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  await prisma.chatMessage.upsert({
    where: { id: msg.id },
    create: {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.text,
      attachmentUrl: msg.attachmentUrl ?? null,
      attachmentName: msg.attachmentName ?? null,
      attachmentType: msg.attachmentType ?? null,
      createdAt: new Date(msg.timestamp),
    },
    update: {
      text: msg.text,
      attachmentUrl: msg.attachmentUrl ?? null,
      attachmentName: msg.attachmentName ?? null,
      attachmentType: msg.attachmentType ?? null,
    },
  });
}
