import "./../css/ChatRoomTemplate.css";

export default function ChatRoomTemplate() {
  return (
    <div className="chatroom-container">
      <div className="chatroom-profile">
        <img src="https://unsplash/picture-of-david" alt="" />
      </div>
      <div className="chat-info">
        <div className="title-date">
          <h4 className="chat-name">feedbackX YouTube Channel</h4>
          <span className="date">27/08/25</span>
        </div>
        <div className="recent-new">
          <span className="recent-chat">
            I think your viedo was too long mate
          </span>
          <span className="new">5</span>
        </div>
      </div>
    </div>
  );
}
