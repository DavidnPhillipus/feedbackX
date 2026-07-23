import SearchTemplate from "../Templates/SearchTemplate";
import { useState, useEffect, useRef } from "react";
import * as api from "../services/api";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      const search = query.trim() || undefined;
      api
        .fetchPosts({ page: 1, limit: 50, search })
        .then((data) => setResults(data.posts || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className="fx-search-page">
      <div className="fx-search-page__box">
        <div className="fx-search-page__header">
          <h1>Search</h1>
          <input
            type="search"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
        </div>
        <div className="fx-search-page__results">
          {loading ? (
            <p className="fx-muted" style={{ padding: 16 }}>Searching...</p>
          ) : results.length === 0 ? (
            <p className="fx-muted" style={{ padding: 16 }}>No posts found</p>
          ) : (
            results.map((item) => (
              <SearchTemplate item={item} key={item.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
