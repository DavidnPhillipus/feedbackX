import "./css/FeedbackRooms.css";
import ChatsContainer from "./ChatsContainer";
import SmallSideBar from "./SmallSideBar";
import ChatRoom from "./ChatRoom";

export default function FeedbackRooms() {
  return (
    <div className="feedback-room-container">
      <SmallSideBar />
      <ChatsContainer />
      <ChatRoom />
    </div>
  );
}
