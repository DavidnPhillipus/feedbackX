import "./../css/ExplorePage.css";
import ExploreCard from "./../Templates/ExploreCard";
import { useEffect, useState } from "react";
import { getExplorePosts } from "../services/mockApi";

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getExplorePosts()
      .then((d) => mounted && setItems(d))
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="explore-container">
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
            {loading ? (
              <p>Loading...</p>
            ) : (
              items.slice(0, 3).map((p) => <ExploreCard key={p.id} {...p} />)
            )}
          </div>
          <div className="feed">
            {!loading && items.slice(3).map((p) => <ExploreCard key={p.id} {...p} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
