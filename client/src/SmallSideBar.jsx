import "./css/SmallSideBar.css";
import home from "./assets/icons/home.png";
import search from "./assets/icons/search.png";
import explore from "./assets/icons/explore.png";
import more from "./assets/icons/more.png";
import post from "./assets/icons/post.png";
import projects from "./assets/icons/projects.png";
import chatroom from "./assets/icons/chatroom.png";
import profile from "./assets/icons/profile.png";

export default function SmallSideBar() {
  return (
    <div className="sidebar-small">
      <h1
        style={{
          fontSize: 30,
          fontFamily: "ganeva",
          marginTop: 30,
          marginLeft: 15,
        }}
      >
        f<span style={{ color: "blue" }}>X</span>
      </h1>
      <div className="icons-container">
        <div className="icon">
          <img src={home} alt="home-icon" width={25} />
        </div>
        <div className="icon">
          <img src={search} alt="search-icon" width={25} />
        </div>
        <div className="icon">
          <img src={explore} alt="explore-icon" width={25} />
        </div>
        <div className="icon">
          <img src={post} alt="post-icon" width={25} />
        </div>
        <div className="icon">
          <img src={projects} alt="projects-icon" width={25} />
        </div>
        <div className="icon">
          <img src={chatroom} alt="chatroom-icon" width={30} />
        </div>
        <div className="icon">
          <img src={profile} alt="chatroom-icon" width={25} />
        </div>
        <div className="icon">
          <img src={more} alt="more-icon" width={25} />
        </div>
      </div>
    </div>
  );
}
