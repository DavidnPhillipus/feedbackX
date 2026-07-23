import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isPostOwner } from "../utils/post";
import ReactionBar from "../components/ReactionBar";
import FollowButton from "../components/FollowButton";
import PostMedia from "../components/PostMedia";
import UserAvatar from "../components/UserAvatar";

export default function ExploreCard({
  id,
  category,
  username,
  authorUsername,
  profilePicture,
  title,
  post,
  reactions,
  userReaction,
  userId,
  authorIsFollowing,
  attachmentUrl,
  attachmentType,
  attachmentName,
  mediaKind,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = isPostOwner(user, { userId, username, authorUsername });

  const giveFeedback = () => {
    if (!id) return;
    navigate(`/feedbackRooms?post=${id}`);
  };

  return (
    <article className="fx-card">
      <div className="fx-card__header">
        <UserAvatar
          src={profilePicture}
          name={username}
          username={authorUsername}
          size={48}
          className="fx-card__avatar"
        />
        <div className="fx-card__body">
          <div className="fx-card__top">
            <span className="fx-card__author">{username}</span>
            {!isOwner && (
              <FollowButton userId={userId} initialFollowing={authorIsFollowing} />
            )}
            <div className="fx-card__badges">
              <span className="fx-card__badge">{category}</span>
              <span className="fx-card__badge">Post</span>
            </div>
          </div>
          <h2 className="fx-card__title">{title}</h2>
        </div>
      </div>
      <div className="fx-card__media">
        <PostMedia
          url={attachmentUrl || post}
          type={attachmentType}
          name={attachmentName}
          mediaKind={mediaKind}
          title={title}
          fallbackImage={post}
        />
      </div>
      <div className="fx-card__footer">
        <ReactionBar
          postId={id}
          reactions={reactions}
          userReaction={userReaction}
          disabled={!user}
        />
        {!isOwner && (
          <button type="button" className="fx-btn" onClick={giveFeedback}>
            Give Feedback
          </button>
        )}
      </div>
    </article>
  );
}
