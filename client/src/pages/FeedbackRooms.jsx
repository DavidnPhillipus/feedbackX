import { useState } from "react";
import ChatsContainer from "../components/ChatsContainer";
import ChatRoom from "../components/ChatRoom";
import { useChat } from "../context/ChatContext";

export default function FeedbackRooms() {
  const { activeRoom, selectRoom } = useChat();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelect = (room) => {
    selectRoom(room);
    setSettingsOpen(false);
    setMobileShowChat(true);
  };

  const handleClose = () => {
    selectRoom(null);
    setMobileShowChat(false);
    setSettingsOpen(false);
  };

  return (
    <div className="fx-chatwin">
      <div className={`fx-chatwin__layout${mobileShowChat && activeRoom ? " fx-chatwin__layout--chat" : ""}`}>
        <ChatsContainer
          selectedRoom={activeRoom}
          onSelect={handleSelect}
        />
        <ChatRoom
          room={activeRoom}
          onClose={handleClose}
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen((v) => !v)}
        />
      </div>
    </div>
  );
}
