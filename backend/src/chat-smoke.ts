/**
 * Realtime chat smoke test (two Socket.IO clients).
 * Run with API up: npm run test:chat
 * Prints pass/fail only — no tokens or secrets.
 */

import { io, Socket } from "socket.io-client";

const API = (process.env.API_URL || "http://localhost:8081/v1").replace(/\/$/, "");
const ORIGIN = API.replace(/\/v1$/, "");
const runId = Date.now().toString(36);

let passed = 0;
let failed = 0;

function ok(label: string) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label: string, err: unknown) {
  failed += 1;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`  ✗ ${label}: ${msg}`);
}

async function api(route: string, options: RequestInit & { token?: string } = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API}${route}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `HTTP ${res.status}`);
  }
  return data as Record<string, any>;
}

function connectClient(userId: string, userName: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(ORIGIN, { transports: ["websocket", "polling"], autoConnect: true });
    const timer = setTimeout(() => reject(new Error("Socket connect timeout")), 10000);
    socket.on("connect", () => {
      socket.emit("register", { userId, userName });
      clearTimeout(timer);
      resolve(socket);
    });
    socket.on("connect_error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function joinRoom(socket: Socket, roomId: string, userId: string, userName: string) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("joinRoom timeout")), 8000);
    socket.emit("joinRoom", { roomId, userId, userName }, (payload: { error?: string }) => {
      clearTimeout(timer);
      if (payload?.error) reject(new Error(payload.error));
      else resolve();
    });
  });
}

function waitForMessage(socket: Socket, predicate: (msg: any) => boolean, ms = 8000) {
  return new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("chatMessage timeout")), ms);
    const handler = (msg: any) => {
      if (!predicate(msg)) return;
      clearTimeout(timer);
      socket.off("chatMessage", handler);
      resolve(msg);
    };
    socket.on("chatMessage", handler);
  });
}

async function main() {
  console.log(`\nfeedbackX chat smoke → ${ORIGIN}\n`);

  try {
    const userA = {
      name: "Chat A",
      username: `chata_${runId}`,
      email: `chata_${runId}@example.com`,
      password: "ChatTest1!",
    };
    const userB = {
      name: "Chat B",
      username: `chatb_${runId}`,
      email: `chatb_${runId}@example.com`,
      password: "ChatTest1!",
    };

    await api("/auth/register", { method: "POST", body: JSON.stringify(userA) });
    await api("/auth/register", { method: "POST", body: JSON.stringify(userB) });
    ok("Register two users");

    const loginA = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: userA.username, password: userA.password }),
    });
    const loginB = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: userB.username, password: userB.password }),
    });
    ok("Login both users");

    const post = await api("/posts", {
      method: "POST",
      token: loginA.token,
      body: JSON.stringify({
        title: "Realtime chat verification post",
        body: "Created by chat smoke test for socket delivery checks.",
        tags: ["Design"],
        published: true,
      }),
    });
    const postId = post.post?.id ?? post.id;
    if (!postId) throw new Error("No post id");
    ok("Create post");

    const roomPayload = await api(`/posts/${postId}/feedback-room`, {
      token: loginA.token,
    });
    const roomId = roomPayload.room?.id;
    if (!roomId) throw new Error("No room id");
    ok("Open feedback room");

    const idA = `u-${loginA.user.id}`;
    const idB = `u-${loginB.user.id}`;
    const sockA = await connectClient(idA, userA.name);
    const sockB = await connectClient(idB, userB.name);
    ok("Socket connect A + B");

    await joinRoom(sockA, roomId, idA, userA.name);
    await joinRoom(sockB, roomId, idB, userB.name);
    ok("Both join room");

    const marker = `ping-${runId}`;
    const waitB = waitForMessage(sockB, (m) => m?.text === marker && m?.roomId === roomId);
    sockA.emit("chatMessage", {
      roomId,
      text: marker,
      userId: idA,
      userName: userA.name,
    });
    const received = await waitB;
    if (!received?.id) throw new Error("Missing message id");
    ok("B receives A's realtime message");

    const reply = `pong-${runId}`;
    const waitA = waitForMessage(sockA, (m) => m?.text === reply && m?.roomId === roomId);
    sockB.emit("chatMessage", {
      roomId,
      text: reply,
      userId: idB,
      userName: userB.name,
    });
    const replyMsg = await waitA;
    if (!replyMsg?.id) throw new Error("Missing reply id");
    ok("A receives B's realtime reply");

    const history = await fetch(`${API}/rooms/${encodeURIComponent(roomId)}/messages`).then((r) =>
      r.json()
    );
    const persisted = (history.messages ?? []).some((m: { text?: string }) => m.text === marker);
    const replyPersisted = (history.messages ?? []).some((m: { text?: string }) => m.text === reply);
    if (!persisted || !replyPersisted) throw new Error("Message not persisted");
    ok("Messages persisted in DB");

    sockA.disconnect();
    sockB.disconnect();
  } catch (err) {
    fail("Chat flow", err);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
