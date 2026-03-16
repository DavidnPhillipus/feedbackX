import "./../css/cardTemplate.css";
import { useState } from "react";

export default function cardTemplate({
  category,
  username,
  profilePicture,
  description,
  title,
  post,
  emojis,
}) {
  const [localEmojis, setLocalEmojis] = useState(emojis);

  const emojiCounts = localEmojis.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  const addReaction = (emoji) => {
    setLocalEmojis([...localEmojis, emoji]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <img src={profilePicture} alt={username} className="card-author-image" />
        <div className="card-header-content">
          <div className="card-header-top">
            <span className="card-author-name">{username}</span>
            <div className="card-badges">
              <button className="card-badge">{category}</button>
              <button className="card-badge">Post</button>
            </div>
          </div>
          <h2 className="card-title">{title}</h2>
          <p className="card-description">{description}</p>
        </div>
      </div>
      <div className="format-part">
        <div className="format">
          <img src={post}></img>
        </div>
        <div className="reactions">
          <div className="emojis">
            {Object.entries(emojiCounts).map(([emoji, count]) => (
              <button key={emoji} className="emoji" onClick={() => addReaction(emoji)}>
                {emoji} {count}
              </button>
            ))}
          </div>

          <button className="feedback-button">Give Feedback</button>
        </div>
      </div>
    </div>
  );
}
