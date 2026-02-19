import "./../css/FeedbackRooms.css";
import ChatsContainer from "../components/ChatsContainer";
import ChatRoom from "../components/ChatRoom";

export default function FeedbackRooms() {
  return (
    <div className="page-inner container">
      <div className="columns">
        <main>
          <ChatsContainer />
        </main>
        <aside>
          <ChatRoom />
        </aside>
      </div>
    </div>
  );
}
