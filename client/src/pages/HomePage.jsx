import "./../css/HomePage.css";
import CardTemplate from "../Templates/CardTemplate.jsx";
import Activity from "../components/Activity";
import SideBar from "../components/SideBar";
import { posts } from "../mocks/mockData";

export default function HomePage() {
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
          {posts.map((p) => (
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
          ))}
        </div>
      </div>
      <Activity />
    </div>
  );
}
