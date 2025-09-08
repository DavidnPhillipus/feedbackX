import "./css/ChatRoom.css";

export default function ChatRoom() {
  return (
    <div id="chatroom-container">
      <header className="bar">
        <div className="room-info">
          <div className="room-profile">
            <img src="https:idononthaveasrcrightnow" />
          </div>
          <span>The room title</span>
        </div>
      </header>
      <main className="chats"></main>
      <footer className="bottom-bar">
        <textarea type="text" placeholder="Enter your insights" id="text" />
      </footer>
    </div>
  );
}
