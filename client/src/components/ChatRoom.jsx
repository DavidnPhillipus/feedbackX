import { useEffect, useRef, useState } from "react";
import {
  FiSend,
  FiSettings,
  FiUsers,
  FiBell,
  FiBellOff,
  FiLogOut,
  FiX,
  FiMessageSquare,
} from "react-icons/fi";
import { useChat } from "../context/ChatContext";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function groupMessages(messages) {
  const groups = [];
  let current = null;

  for (const msg of messages) {
    const day = new Date(msg.timestamp).toLocaleDateString();
    if (!current || current.day !== day) {
      current = { day, items: [] };
      groups.push(current);
    }
    current.items.push(msg);
  }
  return groups;
}

export default function ChatRoom({ room, onClose, settingsOpen, onToggleSettings }) {
  const {
    messages,
    sendMessage,
    handleTyping,
    user,
    onlineUsers,
    typingUsers,
    members,
    leaveRoom,
    updateDisplayName,
  } = useChat();

  const [text, setText] = useState("");
  const [muted, setMuted] = useState(false);
  const [displayName, setDisplayName] = useState(user.name);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (room) inputRef.current?.focus();
  }, [room]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  const othersTyping = typingUsers.filter((u) => u.userId !== user.id);

  if (!room) {
    return (
      <div className="fx-chatwin__welcome">
        <div className="fx-chatwin__welcome-inner">
          <FiMessageSquare size={48} strokeWidth={1.5} />
          <h2>Your feedback rooms</h2>
          <p>Select a room from the sidebar to start a real-time conversation with your team.</p>
          <ul>
            <li>Live messaging with typing indicators</li>
            <li>See who's online in each room</li>
            <li>Create new rooms for your projects</li>
          </ul>
        </div>
      </div>
    );
  }

  const groups = groupMessages(messages);

  return (
    <div className="fx-chatwin__main">
      <header className="fx-chatwin__header">
        <div className="fx-chatwin__header-info">
          {onClose && (
            <button type="button" className="fx-chatwin__back" onClick={onClose} aria-label="Back">
              ←
            </button>
          )}
          <img src={room.avatar} alt="" className="fx-chatwin__header-avatar" />
          <div>
            <h2>{room.name}</h2>
            <p>
              {onlineUsers.length > 0
                ? `${onlineUsers.length} online · ${members.length} members`
                : `${members.length} members`}
            </p>
          </div>
        </div>
        <div className="fx-chatwin__header-actions">
          <button
            type="button"
            className={`fx-chatwin__icon-btn${settingsOpen ? " active" : ""}`}
            onClick={onToggleSettings}
            title="Room settings"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </header>

      <div className="fx-chatwin__body">
        <div className="fx-chatwin__messages">
          {groups.map((group) => (
            <div key={group.day}>
              <div className="fx-chatwin__date-divider">
                <span>{group.day}</span>
              </div>
              {group.items.map((msg) => {
                const isOwn = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`fx-chatwin__bubble-row${isOwn ? " fx-chatwin__bubble-row--own" : ""}`}
                  >
                    {!isOwn && (
                      <div className="fx-chatwin__bubble-avatar">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`fx-chatwin__bubble${isOwn ? " fx-chatwin__bubble--own" : ""}`}>
                      {!isOwn && <span className="fx-chatwin__bubble-name">{msg.senderName}</span>}
                      <p>{msg.text}</p>
                      <time>{formatTime(msg.timestamp)}</time>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {othersTyping.length > 0 && (
            <div className="fx-chatwin__typing">
              <span className="fx-chatwin__typing-dots">
                <span /><span /><span />
              </span>
              {othersTyping.map((u) => u.userName).join(", ")}{" "}
              {othersTyping.length === 1 ? "is" : "are"} typing…
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {settingsOpen && (
          <aside className="fx-chatwin__settings">
            <div className="fx-chatwin__settings-head">
              <h3>Room settings</h3>
              <button type="button" className="fx-chatwin__icon-btn" onClick={onToggleSettings}>
                <FiX size={18} />
              </button>
            </div>

            <div className="fx-chatwin__settings-section">
              <label htmlFor="display-name">Your display name</label>
              <div className="fx-chatwin__settings-row">
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <button
                  type="button"
                  className="fx-btn"
                  onClick={() => updateDisplayName(displayName)}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="fx-chatwin__settings-section">
              <h4><FiUsers size={14} /> Members ({members.length})</h4>
              <ul className="fx-chatwin__member-list">
                {members.map((m) => (
                  <li key={m.id}>
                    <span className="fx-chatwin__member-avatar">{m.name.charAt(0)}</span>
                    {m.name}
                    {onlineUsers.some((o) => o.userId === m.id) && (
                      <span className="fx-chatwin__online-dot" title="Online" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="fx-chatwin__settings-section">
              <h4>Notifications</h4>
              <button
                type="button"
                className="fx-chatwin__settings-toggle"
                onClick={() => setMuted((v) => !v)}
              >
                {muted ? <FiBellOff size={16} /> : <FiBell size={16} />}
                {muted ? "Unmute room" : "Mute room"}
              </button>
            </div>

            {room.description && (
              <div className="fx-chatwin__settings-section">
                <h4>About</h4>
                <p className="fx-muted">{room.description}</p>
              </div>
            )}

            <button
              type="button"
              className="fx-chatwin__leave-btn"
              onClick={() => {
                leaveRoom();
                onClose?.();
              }}
            >
              <FiLogOut size={16} /> Leave room
            </button>
          </aside>
        )}
      </div>

      <footer className="fx-chatwin__composer">
        <form onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button type="submit" className="fx-chatwin__send" disabled={!text.trim()}>
            <FiSend size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
