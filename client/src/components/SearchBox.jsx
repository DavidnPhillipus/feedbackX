import "../css/searchBox.css";
import SearchTemplate from "../Templates/SearchTemplate";
import { useState, useEffect, useRef } from "react";
import { getPosts } from "../services/mockApi";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    // initial load: fetch all posts
    let mounted = true;
    getPosts().then((items) => {
      if (mounted) setResults(items || []);
    }).catch(() => {
      if (mounted) setResults([]);
    });
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    // debounce search and simulate API call
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      getPosts()
        .then((items) => {
          const q = (query || "").trim().toLowerCase();
          if (!q) return setResults(items || []);
          const filtered = (items || []).filter((it) => {
            const title = (it.title || it.post || it.username || "").toString().toLowerCase();
            return title.includes(q);
          });
          setResults(filtered);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className="search-container">
      <div className="search-box">
        <header>
          <h1>Search</h1>
          <input
            type="search"
            placeholder="Search"
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
        </header>
        <div className="suggestions">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : (
            results.map((item) => (
              <SearchTemplate item={item} key={item.id || item._id || JSON.stringify(item)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
