import { nanoid } from "nanoid";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  members: string[];
  memberNames: Record<string, string>;
  messages: ChatMessage[];
  lastMessage: string;
  date: string;
  unread: Record<string, number>;
  createdAt: string;
}

const SEED_ROOMS: Omit<ChatRoom, "unread" | "memberNames">[] = [
  {
    id: "r1",
    name: "Landing Page Redesign",
    avatar: "https://i.pravatar.cc/40?img=5",
    description: "Feedback on hero section, spacing, and copy",
    members: [],
    messages: [
      {
        id: "m-r1-1",
        roomId: "r1",
        senderId: "u-alice",
        senderName: "Alice",
        text: "The hero spacing looks much better in the latest version!",
        timestamp: "2026-02-20T09:00:00Z",
      },
      {
        id: "m-r1-2",
        roomId: "r1",
        senderId: "u-bob",
        senderName: "Bob",
        text: "Agreed — I'd tighten the CTA margin slightly.",
        timestamp: "2026-02-20T09:05:00Z",
      },
    ],
    lastMessage: "Great improvements! The spacing looks much better",
    date: "18/02/26",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "r2",
    name: "Mobile Auth Flow",
    avatar: "https://i.pravatar.cc/40?img=6",
    description: "Signup validation and error states",
    members: [],
    messages: [
      {
        id: "m-r2-1",
        roomId: "r2",
        senderId: "u-carol",
        senderName: "Carol",
        text: "Need feedback on the signup validation messages.",
        timestamp: "2026-02-19T14:00:00Z",
      },
    ],
    lastMessage: "Need feedback on the signup validation",
    date: "17/02/26",
    createdAt: "2026-02-14T10:00:00Z",
  },
  {
    id: "r3",
    name: "Dashboard Analytics",
    avatar: "https://i.pravatar.cc/40?img=7",
    description: "Chart layouts and data visualization",
    members: [],
    messages: [
      {
        id: "m-r3-1",
        roomId: "r3",
        senderId: "u-dave",
        senderName: "Dave",
        text: "The charts look fantastic! Love the color palette.",
        timestamp: "2026-02-20T11:00:00Z",
      },
    ],
    lastMessage: "The charts look fantastic!",
    date: "19/02/26",
    createdAt: "2026-02-13T10:00:00Z",
  },
  {
    id: "r4",
    name: "Component Library",
    avatar: "https://i.pravatar.cc/40?img=8",
    description: "Button variants and design tokens",
    members: [],
    messages: [],
    lastMessage: "Let's discuss the button variants",
    date: "16/02/26",
    createdAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "r5",
    name: "API Documentation Review",
    avatar: "https://i.pravatar.cc/40?img=9",
    description: "OpenAPI specs and examples",
    members: [],
    messages: [],
    lastMessage: "Documentation looks comprehensive",
    date: "15/02/26",
    createdAt: "2026-02-11T10:00:00Z",
  },
];

function initRooms(): Map<string, ChatRoom> {
  const map = new Map<string, ChatRoom>();
  for (const seed of SEED_ROOMS) {
    map.set(seed.id, {
      ...seed,
      memberNames: {},
      unread: {},
    });
  }
  return map;
}

const rooms = initRooms();

/** socketId -> { userId, userName, roomId } */
export const onlineUsers = new Map<
  string,
  { userId: string; userName: string; roomId?: string }
>();

export function getAllRooms(): ChatRoom[] {
  return Array.from(rooms.values()).map((room) => serializeRoom(room));
}

export function getRoom(roomId: string): ChatRoom | undefined {
  const room = rooms.get(roomId);
  return room ? serializeRoom(room) : undefined;
}

export function getRoomMessages(roomId: string): ChatMessage[] {
  return rooms.get(roomId)?.messages ?? [];
}

function serializeRoom(room: ChatRoom) {
  return {
    id: room.id,
    name: room.name,
    avatar: room.avatar,
    description: room.description,
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

export function createRoom(name: string, userId: string, userName: string) {
  const id = `r-${nanoid(8)}`;
  const now = new Date();
  const room: ChatRoom = {
    id,
    name,
    avatar: `https://i.pravatar.cc/40?u=${id}`,
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

export function addMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  text: string
): ChatMessage | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const msg: ChatMessage = {
    id: nanoid(12),
    roomId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString(),
  };

  room.messages.push(msg);
  room.lastMessage = text;
  room.date = new Date().toLocaleDateString("en-GB");

  for (const memberId of room.members) {
    if (memberId !== senderId) {
      room.unread[memberId] = (room.unread[memberId] ?? 0) + 1;
    }
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
