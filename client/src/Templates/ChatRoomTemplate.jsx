import UserAvatar from "../components/UserAvatar";
import { formatChatListTime } from "../utils/chatTime";

export default function ChatRoomTemplate({ item }) {
  const time = formatChatListTime(item?.lastActivityAt || item?.date);
  const preview = item?.lastMessage || "No messages yet";
  const unread = Number(item?.unread) || 0;

  return (
    <>
      <div className="fx-chat-item__avatar-wrap">
        <UserAvatar
          src={item?.avatar}
          name={item?.name}
          size={48}
          className="fx-chat-item__avatar"
          alt={`${item?.name} avatar`}
        />
      </div>
      <div className="fx-chat-item__body">
        <div className="fx-chat-item__top">
          <h4 className={`fx-chat-item__name${unread > 0 ? " fx-chat-item__name--unread" : ""}`}>
            {item?.name}
          </h4>
          <span className={`fx-chat-item__date${unread > 0 ? " fx-chat-item__date--unread" : ""}`}>
            {time}
          </span>
        </div>
        <div className="fx-chat-item__preview">
          <span className={`fx-chat-item__msg${unread > 0 ? " fx-chat-item__msg--unread" : ""}`}>
            {preview}
          </span>
          {unread > 0 && <span className="fx-chat-item__badge">{unread > 99 ? "99+" : unread}</span>}
        </div>
      </div>
    </>
  );
}
