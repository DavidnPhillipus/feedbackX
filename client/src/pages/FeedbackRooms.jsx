import "./../css/FeedbackRooms.css";
import ChatsContainer from "../components/ChatsContainer";
import ChatRoom from "../components/ChatRoom";
import { useState, useEffect } from "react";
import { useSidebar } from "../components/SidebarContext";

export default function FeedbackRooms() {
  const [activeRoom, setActiveRoom] = useState(null);
  const { setIsCompact } = useSidebar();

  useEffect(() => {
    setIsCompact(!!activeRoom);
  }, [activeRoom, setIsCompact]);

  const closeRoom = () => setActiveRoom(null);

  return (
    // when a room is selected we add a modifier class so the wrapper can
    // break out of the normal max‑width container and let the chat panel
    // span the full browser width
    <div className={`page-inner container${activeRoom ? " full-chat" : ""}`}>
      {!activeRoom && (
        <div className="main-header">
          <span>
            <strong>Chatrooms</strong>
          </span>
          <span>Rooms you joined</span>
        </div>
      )}

      <div className={`columns${activeRoom ? " room-active" : ""}`}>
        {/* chat list always visible on the left of the conversation */}
        <main className="chat-list">
          <ChatsContainer onSelect={setActiveRoom} selectedRoom={activeRoom} />
        </main>

        {/* conversation panel; takes remaining horizontal space */}
        <aside className="chat-panel-wrapper" style={{ flex: 1, minWidth: 0 }}>
          <ChatRoom room={activeRoom} onClose={closeRoom} />
        </aside>
      </div>
    </div>
  );
}
