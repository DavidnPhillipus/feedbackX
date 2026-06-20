export default function ChatRoomTemplate({ item }) {
  const avatar = item?.avatar || "https://via.placeholder.com/40";
  return (
    <>
      <img src={avatar} alt={`${item?.name} avatar`} className="fx-chat-item__avatar" />
      <div className="fx-chat-item__body">
        <div className="fx-chat-item__top">
          <h4 className="fx-chat-item__name">{item?.name}</h4>
          <span className="fx-chat-item__date">{item?.date}</span>
        </div>
        <div className="fx-chat-item__preview">
          <span className="fx-chat-item__msg">{item?.lastMessage}</span>
          {item?.unread > 0 && (
            <span className="fx-chat-item__badge">{item.unread}</span>
          )}
        </div>
      </div>
    </>
  );
}
