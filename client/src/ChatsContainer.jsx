import "./css/ChatsContainer.css";
import ChatRoomTemplate from "./ChatRoomTemplate";

export default function ChatsContainer() {
  return (
    <div className="chats-container">
      <h3 className="chat-header">My Feedback Rooms</h3>
      <input
        type="text"
        placeholder="Search for rooms you have created"
        id="search-chat"
      />
      <div className="chats-wrapper">
        <ChatRoomTemplate />
        <ChatRoomTemplate />
        <ChatRoomTemplate />
        <ChatRoomTemplate />
      </div>
    </div>
  );
}
