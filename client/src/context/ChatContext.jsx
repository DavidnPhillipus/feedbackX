import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  connectSocket,
  getChatUser,
  setChatUserName,
  fetchRooms,
} from "../services/socket";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
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

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit("register", { userId: user.id, userName: user.name });
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("roomsList", (list) => setRooms(list));

    socket.on("roomCreated", (room) => {
      setActiveRoom(room);
      socket.emit("joinRoom", {
        roomId: room.id,
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on("roomJoined", ({ messages: msgs, members: m, online }) => {
      setMessages(msgs);
      setMembers(m);
      setOnlineUsers(online);
      setTypingUsers([]);
    });

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("userJoined", ({ userName, online }) => {
      setOnlineUsers(online);
    });

    socket.on("userLeft", ({ online }) => {
      setOnlineUsers(online);
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
  }, [user.id, user.name]);

  const selectRoom = useCallback(
    (room) => {
      if (!room) {
        if (activeRoom && socketRef.current?.connected) {
          socketRef.current.emit("leaveRoom", {
            roomId: activeRoom.id,
            userId: user.id,
          });
        }
        setActiveRoom(null);
        setMessages([]);
        setMembers([]);
        setOnlineUsers([]);
        setTypingUsers([]);
        return;
      }

      setActiveRoom(room);
      socketRef.current?.emit("joinRoom", {
        roomId: room.id,
        userId: user.id,
        userName: user.name,
      });
    },
    [activeRoom, user.id, user.name]
  );

  const sendMessage = useCallback(
    (text) => {
      if (!activeRoom || !text.trim()) return;
      socketRef.current?.emit("chatMessage", {
        roomId: activeRoom.id,
        text: text.trim(),
        userId: user.id,
        userName: user.name,
      });
      emitTyping(false);
    },
    [activeRoom, user.id, user.name]
  );

  const emitTyping = useCallback(
    (isTyping) => {
      if (!activeRoom) return;
      socketRef.current?.emit("typing", {
        roomId: activeRoom.id,
        userId: user.id,
        userName: user.name,
        isTyping,
      });
    },
    [activeRoom, user.id, user.name]
  );

  const handleTyping = useCallback(() => {
    emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 2000);
  }, [emitTyping]);

  const createRoom = useCallback(
    (roomName) => {
      if (!roomName.trim()) return;
      socketRef.current?.emit("createRoom", {
        roomName: roomName.trim(),
        userId: user.id,
        userName: user.name,
      });
    },
    [user.id, user.name]
  );

  const updateDisplayName = useCallback((name) => {
    const updated = setChatUserName(name);
    setUser(updated);
    if (socketRef.current?.connected) {
      socketRef.current.emit("register", {
        userId: updated.id,
        userName: updated.name,
      });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    selectRoom(null);
  }, [selectRoom]);

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
