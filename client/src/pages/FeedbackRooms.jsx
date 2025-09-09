import "./../css/FeedbackRooms.css";
import ChatsContainer from "../components/ChatsContainer";
import SmallSideBar from "../components/SmallSideBar";
import ChatRoom from "../components/ChatRoom";

export default function FeedbackRooms() {
  return (
    <div className="feedback-room-container">
      <SmallSideBar />
      <ChatsContainer />
      <ChatRoom />
    </div>
  );
}
