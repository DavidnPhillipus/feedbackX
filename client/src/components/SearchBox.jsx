import "../css/searchBox.css";
import SmallSideBar from "./SmallSideBar";
import SearchTemplate from "../Templates/SearchTemplate";
import { useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");

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
          />
        </header>
        <div className="suggestions">
          <SearchTemplate query={query} />
          <SearchTemplate query={query} />
          <SearchTemplate query={query} />
          <SearchTemplate query={query} />
        </div>
      </div>
    </div>
  );
}
