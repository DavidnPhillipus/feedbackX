import "../css/searchBox.css";
import SmallSideBar from "./SmallSideBar";
import SearchTemplate from "../Templates/SearchTemplate";
import { useState, useMemo } from "react";

const mockResults = [
  { id: 1, title: "David's feedback on UI", avatar: "https://i.pravatar.cc/40?img=1" },
  { id: 2, title: "Feature request: dark mode", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, title: "Bug report: search behaves oddly", avatar: "https://i.pravatar.cc/40?img=3" },
  { id: 4, title: "Explore ideas for onboarding", avatar: "https://i.pravatar.cc/40?img=4" },
];

export default function SearchBox() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockResults;
    return mockResults.filter((r) => r.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="search-container">
      <SmallSideBar />
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
          {filtered.map((item) => (
            <SearchTemplate item={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
