import "./../css/ExploreCard.css";

export default function ExploreCard({
  category,
  username,
  profilePicture,
  title,
  post,
  emojis,
}) {
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
        </div>
      </div>
      <div className="format-part">
        <div className="format">
          <img src={post}></img>
        </div>
        <div className="reactions">
          <span className="emojis">
            {emojis.map((emoji, index) => (
              <span key={index} className="emoji">
                {emoji}
              </span>
            ))}
          </span>

          <button className="feedback-button">Give Feedback</button>
        </div>
      </div>
    </div>
  );
}
