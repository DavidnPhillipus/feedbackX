import "./../css/ExplorePage.css";
import ExploreCard from "./../Templates/ExploreCard";
import Activity from "../components/Activity";
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
    <div className="page-inner container">
      <div className="columns">
        <main>
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
          <div className="feed">
            {loading ? (
              <p>Loading...</p>
            ) : (
              items.map((p) => <ExploreCard key={p.id} {...p} />)
            )}
          </div>
        </main>
        <aside>
          <Activity />
        </aside>
      </div>
    </div>
  );
}
