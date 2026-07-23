import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";

const PAGE_SIZE = 30;

export default function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [people, setPeople] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const title = type === "following" ? "Following" : "Followers";
  const fetchList =
    type === "following" ? api.fetchUserFollowing : api.fetchUserFollowers;

  const loadPeople = (pageNum, append = false) => {
    setLoading(true);
    return fetchList(userId, { page: pageNum, limit: PAGE_SIZE })
      .then((data) => {
        const users = data.users || [];
        setPeople((prev) => (append ? [...prev, ...users] : users));
        setHasMore(Boolean(data.hasMore));
      })
      .catch(() => {
        if (!append) setPeople([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    setPeople([]);
    setHasMore(true);
    loadPeople(1, false);
  }, [userId, type]);

  useEffect(() => {
    if (!hasMore || loading) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [loading, hasMore]);

  useEffect(() => {
    if (page === 1) return;
    loadPeople(page, true);
  }, [page]);

  const openProfile = (person) => {
    onClose();
    if (person.id === currentUser?.id) {
      navigate("/Profile");
      return;
    }
    navigate(`/creators/${person.id}`);
  };

  return (
    <div className="fx-follow-modal-overlay" onClick={onClose}>
      <div
        className="fx-follow-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fx-follow-modal__head">
          <h2>{title}</h2>
          <button type="button" className="fx-follow-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="fx-follow-modal__list">
          {people.length === 0 && !loading ? (
            <p className="fx-muted fx-follow-modal__empty">
              {type === "following" ? "Not following anyone yet." : "No followers yet."}
            </p>
          ) : (
            people.map((person) => (
              <div key={person.id} className="fx-follow-modal__item">
                <button
                  type="button"
                  className="fx-follow-modal__profile"
                  onClick={() => openProfile(person)}
                >
                  <UserAvatar
                    src={person.avatarUrl}
                    name={person.name}
                    username={person.username}
                    size={44}
                    className="fx-follow-modal__avatar"
                  />
                  <div className="fx-follow-modal__meta">
                    <span className="fx-follow-modal__name">{person.name}</span>
                    <span className="fx-follow-modal__username">@{person.username}</span>
                  </div>
                </button>
                <FollowButton userId={person.id} initialFollowing={person.isFollowing} />
              </div>
            ))
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="fx-load-more">
              {loading ? "Loading…" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
