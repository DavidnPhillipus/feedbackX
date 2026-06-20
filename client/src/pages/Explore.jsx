import ExploreCard from "./../Templates/ExploreCard";

import { useEffect, useState, useRef } from "react";

import * as api from "../services/api";



export default function ExplorePage() {

  const [items, setItems] = useState([]);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [categories, setCategories] = useState(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [search, setSearch] = useState("");

  const loadMoreRef = useRef(null);



  const loadPosts = (pageNum, append = false, cat = selectedCategory, q = search) => {

    setLoading(true);

    return api

      .fetchPosts({

        page: pageNum,

        limit: 6,

        category: cat !== "All" ? cat : undefined,

        search: q || undefined,

      })

      .then((data) => {

        const posts = data.posts || [];

        if (!append && posts.length > 0) {

          const cats = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

          setCategories(["All", ...cats.sort()]);

        }

        setItems((prev) => (append ? [...prev, ...posts] : posts));

        setHasMore(posts.length >= 6);

      })

      .catch(() => {

        if (!append) setItems([]);

        setHasMore(false);

      })

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    setPage(1);

    loadPosts(1, false, selectedCategory, search);

  }, [selectedCategory]);



  useEffect(() => {

    const timer = setTimeout(() => {

      setPage(1);

      loadPosts(1, false, selectedCategory, search);

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);



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

    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); };

  }, [loading, hasMore]);



  useEffect(() => {

    if (page === 1) return;

    loadPosts(page, true, selectedCategory, search);

  }, [page]);



  return (

    <div className="fx-page">

      <div className="fx-page-header">

        <span><strong>Explore</strong></span>

        <span>Discover posts</span>

      </div>



      <div className="fx-search-bar">

        <input

          type="text"

          placeholder="Search posts..."

          value={search}

          onChange={(e) => setSearch(e.target.value)}

        />

      </div>



      <div className="fx-tags">

        {categories.map((cat) => (

          <button

            key={cat}

            type="button"

            className={`fx-tag${cat === selectedCategory ? " active" : ""}`}

            onClick={() => setSelectedCategory(cat)}

          >

            {cat}

          </button>

        ))}

      </div>



      <div className="fx-feed fx-feed--grid">

        {items.length === 0 && loading ? (

          <p className="fx-muted">Loading...</p>

        ) : items.length === 0 ? (

          <p className="fx-muted">No posts found</p>

        ) : (

          items.map((p) => <ExploreCard key={p.id} {...p} />)

        )}

      </div>



      {hasMore && (

        <div ref={loadMoreRef} className="fx-load-more">

          {loading && <p>Loading more posts...</p>}

        </div>

      )}

    </div>

  );

}

