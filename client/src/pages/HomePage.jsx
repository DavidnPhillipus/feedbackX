import "./../css/HomePage.css";
import CardTemplate from "./CardTemplate.jsx";
import Activity from "..components/Activity";
import SideBar from "..components/SideBar";

export default function HomePage() {
  const user = {
    username: "David Phillipus",
    profilePicture:
      "https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-persons-hand-9yYpMvn-j30",
    title: "This is just a title nothing more nothing less",
    category: "Web Design",
    post: "https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-persons-hand-9yYpMvn-j30",
    emojis: ["👍", "❤️", "😄"],
  };
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
          <CardTemplate
            username={user.username}
            category={user.category}
            title={user.title}
            post={user.post}
            profilePicture={user.profilePicture}
            emojis={user.emojis}
          />
          <CardTemplate
            username={user.username}
            category={user.category}
            title={user.title}
            post={user.post}
            profilePicture={user.profilePicture}
            emojis={user.emojis}
          />
          <CardTemplate
            username={user.username}
            category={user.category}
            title={user.title}
            post={user.post}
            profilePicture={user.profilePicture}
            emojis={user.emojis}
          />
        </div>
      </div>
      <Activity />
    </div>
  );
}
