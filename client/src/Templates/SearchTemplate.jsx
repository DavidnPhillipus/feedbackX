import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

export default function SearchTemplate({ item }) {
  const title = item?.title || "Untitled";
  const author = item?.username || item?.authorUsername || "Unknown";

  return (
    <Link to={`/feedbackRooms?post=${item.id}`} className="fx-search-page__result">
      <UserAvatar
        src={item?.profilePicture}
        name={author}
        username={item?.authorUsername}
        size={40}
      />
      <div>
        <p>{title}</p>
        <span className="fx-muted">{author}</span>
      </div>
    </Link>
  );
}
