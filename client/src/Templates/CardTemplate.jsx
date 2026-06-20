import { useState } from "react";

import { useNavigate } from "react-router-dom";

import * as api from "../services/api";



export default function CardTemplate({

  id,

  category,

  username,

  profilePicture,

  description,

  title,

  post,

  emojis,

}) {

  const navigate = useNavigate();

  const [localEmojis, setLocalEmojis] = useState(emojis || ["👍"]);

  const [liked, setLiked] = useState(false);



  const emojiCounts = localEmojis.reduce((acc, emoji) => {

    acc[emoji] = (acc[emoji] || 0) + 1;

    return acc;

  }, {});



  const addReaction = async (emoji) => {

    setLocalEmojis([...localEmojis, emoji]);

    if (!liked && id) {

      try {

        await api.likePost(id);

        setLiked(true);

      } catch {

        /* ignore */

      }

    }

  };



  const giveFeedback = () => {

    navigate("/feedbackRooms");

  };



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

          <p className="fx-card__desc">{description}</p>

        </div>

      </div>

      <div className="fx-card__media">

        <img src={post} alt={title} />

      </div>

      <div className="fx-card__footer">

        <div className="fx-card__reactions">

          {Object.entries(emojiCounts).map(([emoji, count]) => (

            <button key={emoji} type="button" className="fx-card__emoji" onClick={() => addReaction(emoji)}>

              {emoji} {count}

            </button>

          ))}

        </div>

        <button type="button" className="fx-btn" onClick={giveFeedback}>Give Feedback</button>

      </div>

    </article>

  );

}

