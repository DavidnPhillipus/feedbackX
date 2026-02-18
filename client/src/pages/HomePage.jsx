import "./../css/HomePage.css";
import CardTemplate from "../Templates/CardTemplate.jsx";
import Activity from "../components/Activity";
import SideBar from "../components/SideBar";
import { useEffect, useState } from "react";
import { getPosts } from "../services/mockApi";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPosts()
      .then((data) => mounted && setItems(data))
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="outer-container">
      <div className="main-content">
        <div className="main-header">
          <span>
            <strong>Following</strong>
          </span>
          <span>Trending now</span>
        </div>
        <div className="feed">
          {loading ? (
            <p>Loading...</p>
          ) : (
            items.map((p) => (
              <CardTemplate
                key={p.id}
                username={p.username}
                category={p.category}
                title={p.title}
                description={p.description}
                post={p.post}
                profilePicture={p.profilePicture}
                emojis={p.emojis}
              />
            ))
          )}
        </div>
      </div>
      <Activity />
    </div>
  );
}
