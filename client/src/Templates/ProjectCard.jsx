import { useNavigate } from "react-router-dom";



export default function ProjectCard({

  id,

  title,

  description,

  category,

  status,

  imageUrl,

  unread = 0,

}) {

  const navigate = useNavigate();

  const projectImage = imageUrl || `https://picsum.photos/600/400?image=${id}`;



  const handleOpen = () => {

    navigate("/feedbackRooms");

  };



  return (

    <article className="fx-card">

      <div className="fx-card__header">

        <img

          src="https://i.pravatar.cc/80?img=9"

          alt="Your Profile"

          className="fx-card__avatar"

        />

        <div className="fx-card__body">

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

        <img src={projectImage} alt={title} />

      </div>

      <div className="fx-card__footer">

        {unread > 0 && (

          <span className="fx-card__unread">💬 {unread} unread</span>

        )}

        <button type="button" className="fx-btn" onClick={handleOpen}>Open</button>

      </div>

    </article>

  );

}

