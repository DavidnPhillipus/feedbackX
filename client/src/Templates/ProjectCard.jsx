import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostMedia from "../components/PostMedia";
import UserAvatar from "../components/UserAvatar";

export default function ProjectCard({  id,
  title,
  description,
  category,
  status,
  imageUrl,
  attachmentUrl,
  attachmentType,
  attachmentName,
  mediaKind,
  unread = 0,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpen = () => {
    navigate(`/feedbackRooms?post=${id}`);
  };

  return (
    <article className="fx-card">
      <div className="fx-card__header">
        <UserAvatar
          src={user?.avatarUrl}
          name={user?.name}
          username={user?.username}
          size={48}
          className="fx-card__avatar"
          alt="Your profile"
        />        <div className="fx-card__body">
          <div className="fx-card__top">
            <span className="fx-card__author">You</span>
            <div className="fx-card__badges">
              <span className="fx-card__badge">{category}</span>
              <span className="fx-card__badge">{status}</span>
            </div>
          </div>
          <h2 className="fx-card__title">{title}</h2>
          <p className="fx-card__desc">{description}</p>
        </div>
      </div>
      <div className="fx-card__media">
        <PostMedia
          url={attachmentUrl || imageUrl}
          type={attachmentType}
          name={attachmentName}
          mediaKind={mediaKind}
          title={title}
          fallbackImage={null}
        />
      </div>
      <div className="fx-card__footer">
        {unread > 0 && (
          <span className="fx-card__unread">💬 {unread} unread</span>
        )}
        <button type="button" className="fx-btn" onClick={handleOpen}>
          Open Feedback Room
        </button>
      </div>
    </article>
  );
}
