import { useState } from "react";
import * as api from "../services/api";

const REACTIONS = ["👍", "❤️"];

export default function ReactionBar({
  postId,
  reactions: initialReactions = {},
  userReaction: initialUserReaction = null,
  disabled = false,
}) {
  const [reactions, setReactions] = useState(() => normalizeReactions(initialReactions));
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [loading, setLoading] = useState(false);

  function normalizeReactions(data) {
    return REACTIONS.reduce((acc, emoji) => {
      acc[emoji] = data?.[emoji] ?? 0;
      return acc;
    }, {});
  }

  async function handleReaction(emoji) {
    if (!postId || loading || disabled) return;
    setLoading(true);
    try {
      const data = await api.likePost(postId, emoji);
      setReactions(normalizeReactions(data.reactions));
      setUserReaction(data.userReaction ?? null);
    } catch {
      /* keep current state */
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fx-card__reactions">
      {REACTIONS.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        const isActive = userReaction === emoji;
        return (
          <button
            key={emoji}
            type="button"
            className={`fx-card__emoji${isActive ? " fx-card__emoji--active" : ""}`}
            onClick={() => handleReaction(emoji)}
            disabled={loading || disabled}
            title={isActive ? "Remove reaction" : `React with ${emoji}`}
          >
            {emoji} {count > 0 ? count : ""}
          </button>
        );
      })}
    </div>
  );
}
