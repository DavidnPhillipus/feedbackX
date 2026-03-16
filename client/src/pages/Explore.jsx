import "./../css/ExplorePage.css";
import ExploreCard from "./../Templates/ExploreCard";
import Activity from "../components/Activity";
import { useEffect, useState, useRef } from "react";
import { getExplorePosts, getExploreCategories } from "../services/mockApi";

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const loadMoreRef = useRef(null);

  // fetch available categories on mount
  useEffect(() => {
    let mounted = true;
    getExploreCategories()
      .then((cats) => {
        if (mounted) {
          const sorted = cats.slice().sort((a, b) => a.localeCompare(b));
          setCategories(["All", ...sorted]);
        }
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  // load posts whenever selectedCategory changes (resets page)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setHasMore(true);
    getExplorePosts(1, 6, 150, selectedCategory)
      .then((data) => {
        if (mounted) {
          setItems(data);
          setHasMore(data.length >= 6);
          setPage(1);
        }
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
          setHasMore(false);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [selectedCategory]);

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

  // Load more posts when page changes (after initial load or category change)
  useEffect(() => {
    if (page === 1) return;

    let mounted = true;
    setLoading(true);
    getExplorePosts(page, 6, 150, selectedCategory)
      .then((data) => {
        if (mounted) {
          setItems((prev) => [...prev, ...data]);
          setHasMore(data.length >= 6);
        }
      })
      .catch(() => mounted && setHasMore(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [page, selectedCategory]);

  return (
    <div className="explore-page">
      <div className="page-inner">
        <main>
          <div className="main-header">
            <span>
              <strong>Explore</strong>
            </span>
            <span>Discover posts</span>
          </div>

          <div className="search">
            <input type="text" placeholder="Search" id="search-input" />
          </div>
          <div className="categories">
            {categories.map((cat) => (
              <span
                key={cat}
                className={cat === selectedCategory ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="feed">
            {items.length === 0 && loading ? (
              <p>Loading...</p>
            ) : items.length === 0 ? (
              <p>No posts found</p>
            ) : (
              items.map((p) => <ExploreCard key={p.id} {...p} />)
            )}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="load-more-trigger">
              {loading && <p>Loading more posts...</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
