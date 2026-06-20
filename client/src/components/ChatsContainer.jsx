import { useState } from "react";
import { FiPlus, FiSearch, FiWifi, FiWifiOff } from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import ChatRoomTemplate from "../Templates/ChatRoomTemplate";

export default function ChatsContainer({ selectedRoom, onSelect }) {
  const { rooms, connected, createRoom } = useChat();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    createRoom(newRoomName);
    setNewRoomName("");
    setShowCreate(false);
  };

  return (
    <aside className="fx-chatwin__sidebar">
      <div className="fx-chatwin__sidebar-head">
        <div>
          <h2>Messages</h2>
          <span className={`fx-chatwin__status${connected ? " fx-chatwin__status--on" : ""}`}>
            {connected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {connected ? "Live" : "Connecting…"}
          </span>
        </div>
        <button
          type="button"
          className="fx-chatwin__icon-btn"
          title="New room"
          onClick={() => setShowCreate((v) => !v)}
        >
          <FiPlus size={18} />
        </button>
      </div>

      {showCreate && (
        <form className="fx-chatwin__create" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Room name…"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="fx-btn">Create</button>
        </form>
      )}

      <div className="fx-chatwin__search">
        <FiSearch size={16} />
        <input
          type="text"
          placeholder="Search rooms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="fx-chatwin__room-list">
        {!connected && rooms.length === 0 ? (
          <p className="fx-muted fx-chatwin__empty-list">Connecting to chat…</p>
        ) : filtered.length === 0 ? (
          <p className="fx-muted fx-chatwin__empty-list">No rooms found</p>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className={`fx-chat-item${selectedRoom?.id === r.id ? " selected" : ""}`}
              onClick={() => onSelect?.(r)}
            >
              <ChatRoomTemplate item={r} />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
