import { nanoid } from "nanoid";
import { loadRoomMessages, saveChatMessage } from "./persistence.js";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachmentUrl: string | undefined;
  attachmentName: string | undefined;
  attachmentType: string | undefined;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  postId?: number;
  ownerId?: string;
  members: string[];
  memberNames: Record<string, string>;
  messages: ChatMessage[];
  lastMessage: string;
  date: string;
  unread: Record<string, number>;
  createdAt: string;
}

export interface ChatRoomSummary {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  postId?: number;
  lastMessage: string;
  date: string;
  unread: number;
  memberCount: number;
  members: { id: string; name: string }[];
}

const rooms = new Map<string, ChatRoom>();
const postIdToRoomId = new Map<number, string>();

/** socketId -> { userId, userName, roomId } */
export const onlineUsers = new Map<
  string,
  { userId: string; userName: string; roomId: string | undefined }
>();

export function getAllRooms(): ChatRoomSummary[] {
  return Array.from(rooms.values())
    .map((room) => serializeRoom(room))
    .sort((a, b) => {
      const aPost = a.id.startsWith("post-") ? 0 : 1;
      const bPost = b.id.startsWith("post-") ? 0 : 1;
      if (aPost !== bPost) return aPost - bPost;
      return a.name.localeCompare(b.name);
    });
}

export function getRoom(roomId: string): ChatRoomSummary | undefined {
  const room = rooms.get(roomId);
  return room ? serializeRoom(room) : undefined;
}

export function getRoomMessages(roomId: string): ChatMessage[] {
  return rooms.get(roomId)?.messages ?? [];
}

export async function hydrateRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const room = rooms.get(roomId);
  if (!room) return [];

  try {
    const persisted = await loadRoomMessages(roomId);
    if (persisted.length > 0) {
      room.messages = persisted;
      const last = persisted[persisted.length - 1];
      if (last) {
        room.lastMessage = last.text || last.attachmentName || "Attachment";
        room.date = new Date(last.timestamp).toLocaleDateString("en-GB");
      }
    }
  } catch (err) {
    console.warn(`Could not load messages for room ${roomId}:`, err);
  }

  return room.messages;
}

function serializeRoom(room: ChatRoom): ChatRoomSummary {
  return {
    id: room.id,
    name: room.name,
    avatar: room.avatar,
    ...(room.description ? { description: room.description } : {}),
    ...(room.postId !== undefined ? { postId: room.postId } : {}),
    lastMessage: room.lastMessage,
    date: room.date,
    unread: Object.values(room.unread).reduce((a, b) => a + b, 0),
    memberCount: room.members.length,
    members: room.members.map((id) => ({
      id,
      name: room.memberNames[id] ?? "Member",
    })),
  };
}

export function getRoomByPostId(postId: number) {
  const roomId = postIdToRoomId.get(postId);
  if (!roomId) return undefined;
  const room = rooms.get(roomId);
  return room ? serializeRoom(room) : undefined;
}

export function createRoomForPost(
  postId: number,
  title: string,
  imageUrl: string | null,
  ownerUserId: number,
  ownerName: string
) {
  const existing = getRoomByPostId(postId);
  if (existing) return existing;

  const id = `post-${postId}`;
  const ownerChatId = `u-${ownerUserId}`;
  const now = new Date();
  const welcomeText = `Welcome to the feedback room for "${title}". Share your thoughts!`;

  const room: ChatRoom = {
    id,
    postId,
    ownerId: ownerChatId,
    name: title,
    avatar: imageUrl || "",
    description: `Feedback and discussion for this post`,
    members: [ownerChatId],
    memberNames: { [ownerChatId]: ownerName },
    messages: [
      {
        id: nanoid(12),
        roomId: id,
        senderId: "system",
        senderName: "System",
        text: welcomeText,
        attachmentUrl: undefined,
        attachmentName: undefined,
        attachmentType: undefined,
        timestamp: now.toISOString(),
      },
    ],
    lastMessage: welcomeText,
    date: now.toLocaleDateString("en-GB"),
    unread: {},
    createdAt: now.toISOString(),
  };

  rooms.set(id, room);
  postIdToRoomId.set(postId, id);

  void hydrateRoomMessages(id).catch(() => {});

  return serializeRoom(room);
}

export function getOrCreateRoomForPost(
  postId: number,
  title: string,
  imageUrl: string | null,
  ownerUserId: number,
  ownerName: string
) {
  return createRoomForPost(postId, title, imageUrl, ownerUserId, ownerName);
}

export function createRoom(name: string, userId: string, userName: string) {
  const id = `r-${nanoid(8)}`;
  const now = new Date();
  const room: ChatRoom = {
    id,
    name,
    avatar: "",
    description: "",
    members: [userId],
    memberNames: { [userId]: userName },
    messages: [],
    lastMessage: "Room created",
    date: now.toLocaleDateString("en-GB"),
    unread: {},
    createdAt: now.toISOString(),
  };
  rooms.set(id, room);
  return serializeRoom(room);
}

export function joinRoom(roomId: string, userId: string, userName: string) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (!room.members.includes(userId)) {
    room.members.push(userId);
    room.memberNames[userId] = userName;
  }
  return room;
}

export function leaveRoom(roomId: string, userId: string) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.members = room.members.filter((m) => m !== userId);
  delete room.memberNames[userId];
  return room;
}

export async function addMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  text: string,
  attachment?: {
    url?: string | undefined;
    name?: string | undefined;
    type?: string | undefined;
  }
): Promise<ChatMessage | null> {
  const room = rooms.get(roomId);
  if (!room) return null;

  const trimmed = text?.trim() ?? "";
  const hasAttachment = Boolean(attachment?.url);
  if (!trimmed && !hasAttachment) return null;

  const msg: ChatMessage = {
    id: nanoid(12),
    roomId,
    senderId,
    senderName,
    text: trimmed,
    attachmentUrl: attachment?.url,
    attachmentName: attachment?.name,
    attachmentType: attachment?.type,
    timestamp: new Date().toISOString(),
  };

  room.messages.push(msg);
  room.lastMessage = trimmed || attachment?.name || "Attachment";
  room.date = new Date().toLocaleDateString("en-GB");

  for (const memberId of room.members) {
    if (memberId !== senderId) {
      room.unread[memberId] = (room.unread[memberId] ?? 0) + 1;
    }
  }

  try {
    await saveChatMessage(msg);
  } catch (err) {
    console.error("Failed to persist chat message:", err);
  }

  return msg;
}

export function markRoomRead(roomId: string, userId: string) {
  const room = rooms.get(roomId);
  if (room) room.unread[userId] = 0;
}

export function getOnlineInRoom(roomId: string) {
  const names: { userId: string; userName: string }[] = [];
  for (const user of onlineUsers.values()) {
    if (user.roomId === roomId) {
      names.push({ userId: user.userId, userName: user.userName });
    }
  }
  return names;
}
