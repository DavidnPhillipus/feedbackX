import React from "react";
import "./../css/PostModal.css";
import CardTemplate from "../Templates/CardTemplate";

export default function PostModal({ post, onClose }) {
  if (!post) return null;

  return (
    <aside className="post-modal">
      <div className="post-modal-backdrop" onClick={onClose} />
      <div className="post-modal-content">
        <button
          className="post-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <CardTemplate {...post} />
      </div>
    </aside>
  );
}
