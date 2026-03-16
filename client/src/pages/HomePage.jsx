import "./../css/HomePage.css";
import CardTemplate from "../Templates/CardTemplate.jsx";
import Activity from "../components/Activity";
import { useEffect, useState, useRef } from "react";
import { getPosts } from "../services/mockApi";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  // Initial load
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPosts(1, 5)
      .then((data) => {
        if (mounted) {
          setItems(data);
          setHasMore(data.length >= 5);
        }
      })
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  // Intersection Observer for lazy loading
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, hasMore]);

  // Load more posts when page changes
  useEffect(() => {
    if (page === 1) return;

    let mounted = true;
    setLoading(true);
    getPosts(page, 5)
      .then((data) => {
        if (mounted) {
          setItems((prev) => [...prev, ...data]);
          setHasMore(data.length >= 5);
        }
      })
      .catch(() => mounted && setHasMore(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [page]);

  return (
    <div className="page-inner">
      <div className="main-header">
        <span>
          <strong>Following</strong>
        </span>
        <span>Trending now</span>
      </div>
      <div className="columns">
        <main>
          <div className="feed">
            {items.length === 0 && loading ? (
              <p>Loading...</p>
            ) : items.length === 0 ? (
              <p>No posts yet</p>
            ) : (
              items.map((p) => (
                <CardTemplate
                  key={p.id}
                  username={p.username}
                  category={p.category}
                  title={p.title}
                  description={p.description}
                  post={p.post}
                  profilePicture={p.profilePicture}
                  emojis={p.emojis}
                />
              ))
            )}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="load-more-trigger">
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
