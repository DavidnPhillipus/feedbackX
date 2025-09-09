import "./../css/searchBox.css";
import SmallSideBar from "./SmallSideBar";
import SearchTemplate from "./SearchTemplate";

export default function searchBox() {
  return (
    <div className="search-container">
      <SmallSideBar />
      <div className="search-box">
        <header>
          <h1>Search</h1>
          <input type="search" placeholder="search" id="seach" />
        </header>
        <div className="suggestions">
          <SearchTemplate />
          <SearchTemplate />
          <SearchTemplate />
          <SearchTemplate />
        </div>
      </div>
    </div>
  );
}
