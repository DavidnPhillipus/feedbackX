import "./../css/ChatRoomTemplate.css";

export default function ChatRoomTemplate({ item }) {
  const avatar = item?.avatar || "https://via.placeholder.com/40";
  return (
    <div className="chatroom-container">
      <div className="chatroom-profile">
        <img src={avatar} alt={`${item?.name} avatar`} />
      </div>
      <div className="chat-info">
        <div className="title-date">
          <h4 className="chat-name">{item?.name}</h4>
          <span className="date">{item?.date}</span>
        </div>
        <div className="recent-new">
          <span className="recent-chat">{item?.lastMessage}</span>
          <span className="new">{item?.unread || ""}</span>
        </div>
      </div>
    </div>
  );
}
