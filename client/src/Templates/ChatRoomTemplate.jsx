import UserAvatar from "../components/UserAvatar";

export default function ChatRoomTemplate({ item }) {
  return (
    <>
      <UserAvatar
        src={item?.avatar}
        name={item?.name}
        size={40}
        className="fx-chat-item__avatar"
        alt={`${item?.name} avatar`}
      />
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
