import { useNavigate } from "react-router-dom";



export default function ExploreCard({

  category,

  username,

  profilePicture,

  title,

  post,

  emojis,

}) {

  const navigate = useNavigate();



  return (

    <article className="fx-card">

      <div className="fx-card__header">

        <img src={profilePicture} alt={username} className="fx-card__avatar" />

        <div className="fx-card__body">

          <div className="fx-card__top">

            <span className="fx-card__author">{username}</span>

            <div className="fx-card__badges">

              <span className="fx-card__badge">{category}</span>

              <span className="fx-card__badge">Post</span>

            </div>

          </div>

          <h2 className="fx-card__title">{title}</h2>

        </div>

      </div>

      <div className="fx-card__media">

        <img src={post} alt={title} />

      </div>

      <div className="fx-card__footer">

        <div className="fx-card__reactions">

          {(emojis || ["👍"]).map((emoji, index) => (

            <span key={index} className="fx-card__emoji">{emoji}</span>

          ))}

        </div>

        <button type="button" className="fx-btn" onClick={() => navigate("/feedbackRooms")}>

          Give Feedback

        </button>

      </div>

    </article>

  );

}

