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
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import { isSameChatUser } from "../services/socket";
import * as api from "../services/api";
import EmojiPicker from "./EmojiPicker";
import UserAvatar from "./UserAvatar";
import { isEmojiOnly } from "../utils/emoji";
import { validateProjectFile } from "../utils/fileTypes";
import { formatChatClock, formatChatDayLabel } from "../utils/chatTime";

function groupMessages(messages) {
  const groups = [];
  let current = null;

  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i];
    const day = formatChatDayLabel(msg.timestamp);
    if (!current || current.day !== day) {
      current = { day, items: [] };
      groups.push(current);
    }

    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameSenderAsPrev =
      prev &&
      prev.senderId === msg.senderId &&
      formatChatDayLabel(prev.timestamp) === day;
    const sameSenderAsNext =
      next &&
      next.senderId === msg.senderId &&
      formatChatDayLabel(next.timestamp) === day;

    current.items.push({
      ...msg,
      showAvatar: msg.senderId !== "system" && !sameSenderAsNext,
      showName: msg.senderId !== "system" && !sameSenderAsPrev,
      clustered: sameSenderAsPrev,
    });
  }
  return groups;
}

function autoResize(el) {
  if (!el) return;
  el.style.height = "0px";
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
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
    setDisplayName(user.name);
  }, [user.name]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (room) {
      inputRef.current?.focus();
      autoResize(inputRef.current);
    }
  }, [room]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() || uploading) return;
    sendMessage(text);
    setText("");
    requestAnimationFrame(() => autoResize(inputRef.current));
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
      autoResize(input);
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
      // Same authenticated API path as project uploads (Supabase via backend).
      const uploaded = await api.uploadProjectFile(file);
      sendMessage(text, {
        url: uploaded.url,
        name: file.name,
        type: file.type || uploaded.type,
      });
      setText("");
      requestAnimationFrame(() => autoResize(inputRef.current));
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
          <a
            href={msg.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="fx-chatwin__attachment-image"
          >
            <img src={msg.attachmentUrl} alt={msg.attachmentName || "Attachment"} />
          </a>
        )}
        {msg.attachmentUrl && !isImage && (
          <a
            href={msg.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="fx-chatwin__attachment-file"
          >
            {msg.attachmentName || "Download attachment"}
          </a>
        )}
      </>
    );
  };

  const othersTyping = typingUsers.filter((u) => !isSameChatUser(u.userId, user.id));
  const onlineCount = onlineUsers.length;
  const typingNames = othersTyping.map((u) => u.userName || "Someone").join(", ");
  const statusLine =
    onlineCount > 0
      ? `${onlineCount} online · ${members.length} members`
      : `${members.length} members`;

  if (!room) {
    return (
      <div className="fx-chatwin__welcome">
        <div className="fx-chatwin__welcome-inner">
          <div className="fx-chatwin__welcome-icon">
            <FiMessageSquare size={36} strokeWidth={1.5} />
          </div>
          <h2>Pick a conversation</h2>
          <p>
            Select a feedback room on the left to chat in real time — just like your other messaging
            apps.
          </p>
          <ul>
            <li>Live delivery with typing indicators</li>
            <li>See who’s online in each room</li>
            <li>Share images and reactions</li>
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
            <button
              type="button"
              className="fx-chatwin__back"
              onClick={onClose}
              aria-label="Back to chats"
            >
              <FiArrowLeft size={20} />
            </button>
          )}
          <UserAvatar
            src={room.avatar}
            name={room.name}
            size={42}
            className="fx-chatwin__header-avatar"
          />
          <div className="fx-chatwin__header-text">
            <h2>{room.name}</h2>
            <p className={othersTyping.length ? "fx-chatwin__header-typing" : undefined}>
              {othersTyping.length ? `${typingNames} typing…` : statusLine}
            </p>
          </div>
        </div>
        <div className="fx-chatwin__header-actions">
          <button
            type="button"
            className={`fx-chatwin__icon-btn${settingsOpen ? " active" : ""}`}
            onClick={onToggleSettings}
            title="Room info"
            aria-label="Room info"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </header>

      <div className="fx-chatwin__body">
        <div className="fx-chatwin__messages" aria-live="polite">
          {groups.length === 0 && (
            <div className="fx-chatwin__messages-empty" aria-hidden="true" />
          )}
          {groups.map((group) => (
            <div key={group.day} className="fx-chatwin__day-group">
              <div className="fx-chatwin__date-divider">
                <span>{group.day}</span>
              </div>
              {group.items.map((msg) => {
                const isSystem = msg.senderId === "system";
                const isOwn = !isSystem && isSameChatUser(msg.senderId, user.id);
                return (
                  <div
                    key={msg.id}
                    className={[
                      "fx-chatwin__bubble-row",
                      isSystem ? "fx-chatwin__bubble-row--system" : "",
                      isOwn ? "fx-chatwin__bubble-row--own" : "",
                      msg.clustered ? "fx-chatwin__bubble-row--clustered" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {!isOwn && !isSystem && (
                      <div
                        className={`fx-chatwin__bubble-avatar${
                          msg.showAvatar ? "" : " fx-chatwin__bubble-avatar--spacer"
                        }`}
                      >
                        {msg.showAvatar ? msg.senderName.charAt(0).toUpperCase() : null}
                      </div>
                    )}
                    <div
                      className={[
                        "fx-chatwin__bubble",
                        isSystem ? "fx-chatwin__bubble--system" : "",
                        isOwn ? "fx-chatwin__bubble--own" : "",
                        msg.clustered ? "fx-chatwin__bubble--clustered" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {!isOwn && !isSystem && msg.showName && (
                        <span className="fx-chatwin__bubble-name">{msg.senderName}</span>
                      )}
                      {renderMessageBody(msg)}
                      {!isSystem && (
                        <time>
                          {formatChatClock(msg.timestamp)}
                          {isOwn && <FiCheck size={12} aria-hidden="true" />}
                        </time>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {othersTyping.length > 0 && (
            <div className="fx-chatwin__typing">
              <span className="fx-chatwin__typing-dots">
                <span />
                <span />
                <span />
              </span>
              <span>
                {typingNames} {othersTyping.length === 1 ? "is" : "are"} typing…
              </span>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {settingsOpen && (
          <aside className="fx-chatwin__settings">
            <div className="fx-chatwin__settings-head">
              <h3>Chat info</h3>
              <button
                type="button"
                className="fx-chatwin__icon-btn"
                onClick={onToggleSettings}
                aria-label="Close info"
              >
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
              <h4>
                <FiUsers size={14} /> Members ({members.length})
              </h4>
              <ul className="fx-chatwin__member-list">
                {members.map((m) => {
                  const online = onlineUsers.some((o) => o.userId === m.id);
                  return (
                    <li key={m.id}>
                      <span className="fx-chatwin__member-avatar">{m.name.charAt(0)}</span>
                      <span className="fx-chatwin__member-name">{m.name}</span>
                      {online && <span className="fx-chatwin__online-pill">Online</span>}
                    </li>
                  );
                })}
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
                {muted ? "Unmute chat" : "Mute chat"}
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
              <FiLogOut size={16} /> Leave chat
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
            aria-label="Attach image"
          >
            <FiPaperclip size={18} />
          </button>
          <EmojiPicker onSelect={insertEmoji} disabled={uploading} />
          <div className="fx-chatwin__composer-field">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={uploading ? "Uploading…" : "Message"}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
                autoResize(e.target);
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
          </div>
          <button
            type="submit"
            className="fx-chatwin__send"
            disabled={!text.trim() || uploading}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
