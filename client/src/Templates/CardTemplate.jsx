import "./../css/cardTemplate.css";

export default function cardTemplate({
  category,
  username,
  profilePicture,
  description,
  title,
  post,
  emojis,
}) {
  return (
    <div className="card">
      <div className="details-continer">
        <div className="profile-container">
          <div className="author">
            <div className="user-profile">
              <img src={profilePicture} alt="User Profile" />
            </div>
            <span className="username">{username}</span>
          </div>
          <div className="category-format">
            <button className="category">{category}</button>
            <button className="category">Image</button>
          </div>
        </div>
        <div className="description">
          <h2>{title}</h2>
          <p>{description}</p>
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
