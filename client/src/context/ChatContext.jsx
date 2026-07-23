import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  connectSocket,
  getChatUser,
  setChatUserName,
  fetchRooms,
  fetchRoomMessages,
  syncChatUserFromAuth,
  clearChatUser,
} from "../services/socket";
import { fetchPostFeedbackRoom } from "../services/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

function appendMessage(prev, msg) {
  if (prev.some((m) => m.id === msg.id)) return prev;
  return [...prev, msg];
}

export function ChatProvider({ children }) {
  const { user: authUser } = useAuth();
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [user, setUser] = useState(getChatUser);
  const typingTimeout = useRef(null);
  const socketRef = useRef(null);
  const activeRoomRef = useRef(null);
  const userRef = useRef(user);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!authUser) {
      clearChatUser();
      setUser(getChatUser());
      setMessages([]);
      setMembers([]);
      setOnlineUsers([]);
      setTypingUsers([]);
      return;
    }
    setUser(syncChatUserFromAuth());
    setMessages([]);
  }, [authUser?.id, authUser?.name, authUser?.username]);

  const joinRoom = useCallback((room) => {
    const socket = socketRef.current;
    if (!room || !socket) return;

    const currentUser = userRef.current;
    socket.emit(
      "joinRoom",
      {
        roomId: room.id,
        userId: currentUser.id,
        userName: currentUser.name,
      },
      (payload) => {
        if (!payload || payload.error) return;
        if (activeRoomRef.current?.id !== room.id) return;
        setMessages(payload.messages ?? []);
        setMembers(payload.members ?? []);
        setOnlineUsers(payload.online ?? []);
        setTypingUsers([]);
      }
    );

    fetchRoomMessages(room.id)
      .then((msgs) => {
        if (activeRoomRef.current?.id !== room.id) return;
        setMessages(msgs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      const currentUser = userRef.current;
      socket.emit("register", { userId: currentUser.id, userName: currentUser.name });

      const room = activeRoomRef.current;
      if (room) joinRoom(room);
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("roomsList", (list) => setRooms(list));

    socket.on("roomCreated", (room) => {
      setActiveRoom(room);
      joinRoom(room);
    });

    socket.on("roomJoined", ({ roomId, messages: msgs, members: m, online }) => {
      if (roomId !== activeRoomRef.current?.id) return;
      setMessages(msgs ?? []);
      setMembers(m ?? []);
      setOnlineUsers(online ?? []);
      setTypingUsers([]);
    });

    socket.on("chatMessage", (msg) => {
      if (msg.roomId !== activeRoomRef.current?.id) return;
      setMessages((prev) => appendMessage(prev, msg));
    });

    socket.on("userJoined", ({ online }) => {
      setOnlineUsers(online ?? []);
    });

    socket.on("userLeft", ({ online }) => {
      setOnlineUsers(online ?? []);
    });

    socket.on("typing", ({ userId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== userId);
        return isTyping ? [...filtered, { userId, userName }] : filtered;
      });
    });

    if (!socket.connected) socket.connect();
    else onConnect();

    fetchRooms().then(setRooms).catch(() => {});

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomsList");
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("chatMessage");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("typing");
    };
  }, [user.id, user.name, joinRoom]);

  const selectRoom = useCallback(
    (room) => {
      const socket = socketRef.current;
      const currentUser = userRef.current;

      if (!room) {
        if (activeRoomRef.current && socket?.connected) {
          socket.emit("leaveRoom", {
            roomId: activeRoomRef.current.id,
            userId: currentUser.id,
          });
        }
        setActiveRoom(null);
        setMessages([]);
        setMembers([]);
        setOnlineUsers([]);
        setTypingUsers([]);
        return;
      }

      if (activeRoomRef.current && activeRoomRef.current.id !== room.id && socket?.connected) {
        socket.emit("leaveRoom", {
          roomId: activeRoomRef.current.id,
          userId: currentUser.id,
        });
      }

      setActiveRoom(room);
      setMessages([]);
      joinRoom(room);
    },
    [joinRoom]
  );

  const emitTyping = useCallback((isTyping) => {
    const room = activeRoomRef.current;
    const currentUser = userRef.current;
    if (!room) return;
    socketRef.current?.emit("typing", {
      roomId: room.id,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping,
    });
  }, []);

  const sendMessage = useCallback((text, attachment = null) => {
    const room = activeRoomRef.current;
    const currentUser = userRef.current;
    const trimmed = text?.trim() ?? "";
    const hasAttachment = Boolean(attachment?.url);
    if (!room || (!trimmed && !hasAttachment)) return;

    const payload = {
      roomId: room.id,
      text: trimmed,
      userId: currentUser.id,
      userName: currentUser.name,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
    };

    socketRef.current?.emit("chatMessage", payload, (msg) => {
      if (!msg || msg.roomId !== activeRoomRef.current?.id) return;
      setMessages((prev) => appendMessage(prev, msg));
    });

    emitTyping(false);
  }, [emitTyping]);

  const handleTyping = useCallback(() => {
    emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 2000);
  }, [emitTyping]);

  const createRoom = useCallback((roomName) => {
    if (!roomName.trim()) return;
    const currentUser = userRef.current;
    socketRef.current?.emit("createRoom", {
      roomName: roomName.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
    });
  }, []);

  const updateDisplayName = useCallback((name) => {
    const updated = setChatUserName(name);
    setUser(updated);
    if (socketRef.current?.connected) {
      socketRef.current.emit("register", {
        userId: updated.id,
        userName: updated.name,
      });
      const room = activeRoomRef.current;
      if (room) joinRoom(room);
    }
  }, [joinRoom]);

  const leaveRoom = useCallback(() => {
    selectRoom(null);
  }, [selectRoom]);

  const openPostFeedbackRoom = useCallback(
    async (postId) => {
      const { room } = await fetchPostFeedbackRoom(postId);

      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) return prev;
        return [room, ...prev];
      });
      selectRoom(room);
      return room;
    },
    [selectRoom]
  );

  return (
    <ChatContext.Provider
      value={{
        connected,
        rooms,
        activeRoom,
        messages,
        members,
        onlineUsers,
        typingUsers,
        user,
        selectRoom,
        sendMessage,
        handleTyping,
        createRoom,
        updateDisplayName,
        leaveRoom,
        openPostFeedbackRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
