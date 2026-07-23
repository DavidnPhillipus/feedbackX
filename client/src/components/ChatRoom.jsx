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
  FiPaperclip,
} from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import { isSameChatUser } from "../services/socket";
import { uploadToSupabase } from "../services/supabase";
import EmojiPicker from "./EmojiPicker";
import UserAvatar from "./UserAvatar";
import { isEmojiOnly } from "../utils/emoji";
import { validateProjectFile } from "../utils/fileTypes";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const insertEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setText((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    handleTyping();

    requestAnimationFrame(() => {
      input.focus();
      const pos = start + emoji.length;
      input.setSelectionRange(pos, pos);
    });
  };

  const handleAttachment = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    const validationError = validateProjectFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadToSupabase(file);
      sendMessage(text, {
        url,
        name: file.name,
        type: file.type,
      });
      setText("");
    } catch (err) {
      setUploadError(err.message || "Could not upload attachment");
    } finally {
      setUploading(false);
    }
  };

  const renderMessageBody = (msg) => {
    const isImage =
      msg.attachmentType?.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp)$/i.test(msg.attachmentUrl || "");

    return (
      <>
        {msg.text && (
          <p className={isEmojiOnly(msg.text) ? "fx-chatwin__bubble-text--emoji" : undefined}>
            {msg.text}
          </p>
        )}
        {msg.attachmentUrl && isImage && (
          <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="fx-chatwin__attachment-image">
            <img src={msg.attachmentUrl} alt={msg.attachmentName || "Attachment"} />
          </a>
        )}
        {msg.attachmentUrl && !isImage && (
          <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="fx-chatwin__attachment-file">
            {msg.attachmentName || "Download attachment"}
          </a>
        )}
      </>
    );
  };

  const othersTyping = typingUsers.filter((u) => !isSameChatUser(u.userId, user.id));

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
            <li>Share images and emojis in feedback</li>
            <li>Open a post's feedback room from Give Feedback</li>
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
          <UserAvatar
            src={room.avatar}
            name={room.name}
            size={40}
            className="fx-chatwin__header-avatar"
          />
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
                const isSystem = msg.senderId === "system";
                const isOwn = !isSystem && isSameChatUser(msg.senderId, user.id);
                return (
                  <div
                    key={msg.id}
                    className={`fx-chatwin__bubble-row${
                      isSystem
                        ? " fx-chatwin__bubble-row--system"
                        : isOwn
                          ? " fx-chatwin__bubble-row--own"
                          : ""
                    }`}
                  >
                    {!isOwn && !isSystem && (
                      <div className="fx-chatwin__bubble-avatar">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`fx-chatwin__bubble${
                        isSystem
                          ? " fx-chatwin__bubble--system"
                          : isOwn
                            ? " fx-chatwin__bubble--own"
                            : ""
                      }`}
                    >
                      {!isOwn && !isSystem && (
                        <span className="fx-chatwin__bubble-name">{msg.senderName}</span>
                      )}
                      {isSystem && (
                        <span className="fx-chatwin__bubble-name">{msg.senderName}</span>
                      )}
                      {renderMessageBody(msg)}
                      {!isSystem && <time>{formatTime(msg.timestamp)}</time>}
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
        {uploadError && <p className="fx-chatwin__upload-error">{uploadError}</p>}
        <form onSubmit={handleSend}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="fx-chatwin__file-input"
            onChange={handleAttachment}
            hidden
          />
          <button
            type="button"
            className="fx-chatwin__attach"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach image"
          >
            <FiPaperclip size={18} />
          </button>
          <EmojiPicker onSelect={insertEmoji} disabled={uploading} />
          <input
            ref={inputRef}
            type="text"
            placeholder={uploading ? "Uploading…" : "Type a message…"}
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
            disabled={uploading}
            autoComplete="off"
            spellCheck="true"
          />
          <button type="submit" className="fx-chatwin__send" disabled={!text.trim() || uploading}>
            <FiSend size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
