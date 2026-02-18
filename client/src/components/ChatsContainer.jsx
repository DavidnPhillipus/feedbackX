import "./../css/ChatsContainer.css";
import ChatRoomTemplate from "../Templates/ChatRoomTemplate";
import { useEffect, useState } from "react";
import { getRooms } from "../services/mockApi";

export default function ChatsContainer() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRooms()
      .then((r) => mounted && setRooms(r))
      .catch(() => mounted && setRooms([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="chats-container">
      <h3 className="chat-header">My Feedback Rooms</h3>
      <input
        type="text"
        placeholder="Search for rooms you have created"
        id="search-chat"
      />
      <div className="chats-wrapper">
        {loading ? <p>Loading...</p> : rooms.map((r) => <ChatRoomTemplate key={r.id} item={r} />)}
      </div>
    </div>
  );
}
