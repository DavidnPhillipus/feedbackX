import { io } from "socket.io-client";
import { apiUrl, getStoredUser } from "./api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}

const USER_KEY = "fx-chat-user";

export function toChatUserId(authUserId) {
  if (authUserId == null || authUserId === "") return "u-guest";
  const raw = String(authUserId);
  return raw.startsWith("u-") ? raw : `u-${raw}`;
}

export function isSameChatUser(a, b) {
  if (!a || !b) return false;
  return toChatUserId(a) === toChatUserId(b);
}

export function syncChatUserFromAuth() {
  const authUser = getStoredUser();
  if (!authUser) {
    return getChatUser();
  }

  const chatUser = {
    id: toChatUserId(authUser.id),
    name: authUser.name || authUser.username,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(chatUser));
  return chatUser;
}

export function getChatUser() {
  const authUser = getStoredUser();
  if (authUser) {
    const chatUser = {
      id: toChatUserId(authUser.id),
      name: authUser.name || authUser.username,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(chatUser));
    return chatUser;
  }

  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* fall through */
    }
  }
  const user = {
    id: `u-${Math.random().toString(36).slice(2, 10)}`,
    name: "You",
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function setChatUserName(name) {
  const user = getChatUser();
  user.name = name.trim() || "You";
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearChatUser() {
  localStorage.removeItem(USER_KEY);
}

export async function fetchRooms() {
  const res = await fetch(apiUrl("/rooms"));
  if (!res.ok) throw new Error("Failed to load rooms");
  const data = await res.json();
  return data.rooms ?? [];
}

export async function fetchRoomMessages(roomId) {
  const res = await fetch(apiUrl(`/rooms/${encodeURIComponent(roomId)}/messages`));
  if (!res.ok) throw new Error("Failed to load messages");
  const data = await res.json();
  return data.messages ?? [];
}
