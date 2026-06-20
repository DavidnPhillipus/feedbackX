import { io } from "socket.io-client";
import { getStoredUser } from "./api";

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

export function getChatUser() {
  const authUser = getStoredUser();
  if (authUser) {
    const chatUser = {
      id: `u-${authUser.id}`,
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

export async function fetchRooms() {
  const res = await fetch("/v1/rooms");
  if (!res.ok) throw new Error("Failed to load rooms");
  const data = await res.json();
  return data.rooms ?? [];
}
