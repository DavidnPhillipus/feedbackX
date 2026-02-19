import "./../css/FeedbackRooms.css";
import ChatsContainer from "../components/ChatsContainer";
import ChatRoom from "../components/ChatRoom";

export default function FeedbackRooms() {
  return (
    <div className="feedback-room-container">
      <ChatsContainer />
      <ChatRoom />
    </div>
  );
}
