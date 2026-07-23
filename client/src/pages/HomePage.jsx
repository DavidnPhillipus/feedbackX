import CardTemplate from "../Templates/CardTemplate.jsx";
import Activity from "../components/Activity";
import { useEffect, useState, useRef } from "react";
import * as api from "../services/api";

const EMPTY_MESSAGES = {
  following:
    "You're not following anyone yet. Follow creators from the Creators page to see their projects here.",
  liked: "No liked projects yet. React to posts with 👍 or ❤️ to save them here.",
  trending: "No trending posts yet. React to posts to help them trend!",
};

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState(() => {
    const saved = sessionStorage.getItem("fx-home-tab");
    if (saved === "liked" || saved === "trending" || saved === "following") {
      sessionStorage.removeItem("fx-home-tab");
      return saved;
    }
    return "following";
  });
  const loadMoreRef = useRef(null);

  const loadPosts = (pageNum, append = false, feed = tab) => {
    setLoading(true);
    return api
      .fetchPosts({ page: pageNum, limit: 5, feed })
      .then((data) => {
        const posts = data.posts || [];
        setItems((prev) => (append ? [...prev, ...posts] : posts));
        setHasMore(posts.length >= 5);
      })
      .catch(() => {
        if (!append) setItems([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    loadPosts(1, false, tab);
  }, [tab]);

  useEffect(() => {
    if (!hasMore) return;
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
    loadPosts(page, true, tab);
  }, [page, tab]);

  return (
    <div className="fx-page">
      <div className="fx-page-header">
        <button
          type="button"
          className={tab === "following" ? "active" : ""}
          onClick={() => setTab("following")}
        >
          <strong>Following</strong>
        </button>
        <button
          type="button"
          className={tab === "liked" ? "active" : ""}
          onClick={() => setTab("liked")}
        >
          Liked
        </button>
        <button
          type="button"
          className={tab === "trending" ? "active" : ""}
          onClick={() => setTab("trending")}
        >
          Trending now
        </button>
      </div>
      <div className="fx-grid fx-grid--with-aside">
        <main>
          <div className="fx-feed">
            {items.length === 0 && loading ? (
              <p className="fx-muted">Loading...</p>
            ) : items.length === 0 ? (
              <p className="fx-muted">
                {EMPTY_MESSAGES[tab] || "No posts yet."}{" "}
                {tab === "following" && (
                  <a href="/creators">Discover creators →</a>
                )}
              </p>
            ) : (
              items.map((p) => <CardTemplate key={p.id} {...p} />)
            )}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="fx-load-more">
              {loading && <p>Loading more posts...</p>}
            </div>
          )}
        </main>
        <aside>
          <Activity />
        </aside>
      </div>
    </div>
  );
}
