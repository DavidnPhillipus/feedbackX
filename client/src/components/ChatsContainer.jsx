import "./../css/ChatsContainer.css";
import ChatRoomTemplate from "../Templates/ChatRoomTemplate";
import { rooms } from "../mocks/mockData";

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
        {rooms.map((r) => (
          <ChatRoomTemplate key={r.id} item={r} />
        ))}
      </div>
    </div>
  );
}
