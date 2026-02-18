import "./../css/ExplorePage.css";
import ExploreCard from "./../Templates/ExploreCard";
import SmallSideBar from "../components/SmallSideBar";
import { explorePosts } from "../mocks/mockData";

export default function explorePage() {
  return (
    <div className="explore-container">
      <SmallSideBar />
      <div className="outer-container">
        <header>
          <h1 className="first-header">Explore</h1>
        </header>

        <div className="search">
          <input type="text" placeholder="Search" id="search-input" />
        </div>
        <div className="categories">
          <span>All</span>
          <span>Web design</span>
          <span>YouTube</span>
          <span>Writting</span>
          <span>AI/ML</span>
        </div>
        <main>
          <div className="feed">
            {explorePosts.slice(0, 3).map((p) => (
              <ExploreCard key={p.id} {...p} />
            ))}
          </div>
          <div className="feed">
            {explorePosts.slice(3).map((p) => (
              <ExploreCard key={p.id} {...p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
