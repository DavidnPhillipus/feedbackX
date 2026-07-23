import { useState } from "react";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function FollowButton({
  userId,
  initialFollowing = false,
  size = "sm",
  onChange,
}) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!user || !userId || user.id === userId) return null;

  async function toggleFollow(e) {
    e?.stopPropagation?.();
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await api.unfollowUser(userId);
        setFollowing(false);
        onChange?.(false);
      } else {
        await api.followUser(userId);
        setFollowing(true);
        onChange?.(true);
      }
    } catch {
      /* keep state */
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`fx-follow-btn fx-follow-btn--${size}${following ? " fx-follow-btn--active" : ""}`}
      onClick={toggleFollow}
      disabled={loading}
    >
      {loading ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}
