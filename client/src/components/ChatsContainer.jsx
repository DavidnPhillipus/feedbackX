import { useMemo, useState } from "react";
import { FiEdit, FiSearch, FiWifi, FiWifiOff } from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import ChatRoomTemplate from "../Templates/ChatRoomTemplate";

export default function ChatsContainer({ selectedRoom, onSelect, hiddenOnMobile }) {
  const { rooms, connected, createRoom } = useChat();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.lastMessage || "").toLowerCase().includes(q)
    );
  }, [rooms, search]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    createRoom(newRoomName);
    setNewRoomName("");
    setShowCreate(false);
  };

  return (
    <aside
      className={`fx-chatwin__sidebar${hiddenOnMobile ? " fx-chatwin__sidebar--hidden" : ""}`}
    >
      <div className="fx-chatwin__sidebar-head">
        <div>
          <h2>Chats</h2>
          <span className={`fx-chatwin__status${connected ? " fx-chatwin__status--on" : ""}`}>
            {connected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {connected ? "Connected" : "Connecting…"}
          </span>
        </div>
        <button
          type="button"
          className="fx-chatwin__icon-btn"
          title="New chat room"
          aria-label="New chat room"
          onClick={() => setShowCreate((v) => !v)}
        >
          <FiEdit size={18} />
        </button>
      </div>

      {showCreate && (
        <form className="fx-chatwin__create" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Name this room…"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="fx-btn">
            Create
          </button>
        </form>
      )}

      <div className="fx-chatwin__search">
        <FiSearch size={16} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search chats"
        />
      </div>

      <div className="fx-chatwin__room-list" role="list">
        {!connected && rooms.length === 0 ? (
          <div className="fx-chatwin__empty-list">
            <p className="fx-muted">Connecting to chat…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="fx-chatwin__empty-list">
            <p className="fx-muted">
              {search.trim() ? "No chats match your search." : "No chats yet."}
            </p>
            {!search.trim() && (
              <p className="fx-muted">Open Give Feedback on a project to start a room.</p>
            )}
          </div>
        ) : (
          filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              role="listitem"
              className={`fx-chat-item${selectedRoom?.id === r.id ? " selected" : ""}`}
              onClick={() => onSelect?.(r)}
            >
              <ChatRoomTemplate item={r} />
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
