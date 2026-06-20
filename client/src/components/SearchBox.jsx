import SearchTemplate from "../Templates/SearchTemplate";
import { useState, useEffect, useRef } from "react";
import { getPosts } from "../services/mockApi";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let mounted = true;
    getPosts().then((items) => mounted && setResults(items || [])).catch(() => mounted && setResults([]));
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      getPosts()
        .then((items) => {
          const q = (query || "").trim().toLowerCase();
          if (!q) return setResults(items || []);
          setResults((items || []).filter((it) => {
            const title = (it.title || it.username || "").toString().toLowerCase();
            return title.includes(q);
          }));
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
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
