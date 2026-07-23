import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../services/api";
import FollowButton from "../components/FollowButton";
import UserAvatar from "../components/UserAvatar";

const PAGE_SIZE = 30;

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const loadCreators = (pageNum, append = false) => {
    setLoading(true);
    return api
      .fetchCreators({ page: pageNum, limit: PAGE_SIZE })
      .then((data) => {
        const users = data.users || [];
        setCreators((prev) => (append ? [...prev, ...users] : users));
        setHasMore(Boolean(data.hasMore));
      })
      .catch(() => {
        if (!append) setCreators([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    loadCreators(1, false);
  }, []);

  useEffect(() => {
    if (!hasMore) return undefined;
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
    loadCreators(page, true);
  }, [page]);

  return (
    <div className="fx-page">
      <div className="fx-page-header">
        <span>
          <strong>Creators</strong>
        </span>
        <span>Discover people to follow</span>
      </div>

      <div className="fx-creators">
        {creators.length === 0 && !loading ? (
          <p className="fx-muted">No creators to show yet.</p>
        ) : (
          creators.map((creator) => (
            <article key={creator.id} className="fx-creator-card">
              <Link to={`/creators/${creator.id}`} className="fx-creator-card__main">
                <UserAvatar
                  src={creator.avatarUrl}
                  name={creator.name}
                  username={creator.username}
                  size={64}
                  className="fx-creator-card__avatar"
                />
                <div className="fx-creator-card__body">
                  <h2 className="fx-creator-card__name">{creator.name}</h2>
                  <p className="fx-creator-card__username">@{creator.username}</p>
                  <p className="fx-creator-card__bio">
                    {creator.bio || "No bio yet."}
                  </p>
                  <div className="fx-creator-card__stats">
                    <span>
                      <strong>{creator.postCount ?? 0}</strong> projects
                    </span>
                    <span>
                      <strong>{creator.followerCount ?? 0}</strong> followers
                    </span>
                    <span>
                      <strong>{creator.followingCount ?? 0}</strong> following
                    </span>
                  </div>
                </div>
              </Link>
              <FollowButton
                userId={creator.id}
                initialFollowing={creator.isFollowing}
                size="md"
              />
            </article>
          ))
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="fx-load-more">
            {loading ? "Loading more creators…" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
