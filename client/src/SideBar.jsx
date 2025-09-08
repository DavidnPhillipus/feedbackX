import "./css/SideBar.css";
import SearchBox from "./SearchBox";
import { useState } from "react";
import home from "./assets/icons/home.png";
import search from "./assets/icons/search.png";
import explore from "./assets/icons/explore.png";
import more from "./assets/icons/more.png";
import post from "./assets/icons/post.png";
import projects from "./assets/icons/projects.png";
import chatroom from "./assets/icons/chatroom.png";
import profile from "./assets/icons/profile.png";

export default function SideBar() {
  const [openSearch, setOpenSearch] = useState(true);

  return (
    <div className="sidebar">
      <h1 className="logo-full">
        feedback<span style={{ color: "blue" }}>X</span>
      </h1>
      <h1 className="logo-compact">
        f<span style={{ color: "blue" }}>X</span>
      </h1>
      <div className="icons-container">
        <div className="icon">
          <img src={home} alt="home-icon" width={25} />
          <span>Home</span>
        </div>
        <div
          className="icon"
          onClick={(openSearch) => {
            setOpenSearch(!openSearch);
          }}
        >
          <img src={search} alt="search-icon" width={25} />
          {openSearch ? <span>Search</span> : <SearchBox></SearchBox>}
        </div>
        <div className="icon">
          <img src={explore} alt="explore-icon" width={25} />
          <span>Explore</span>
        </div>
        <div className="icon">
          <img src={post} alt="post-icon" width={25} />
          <span>Post</span>
        </div>
        <div className="icon">
          <img src={projects} alt="projects-icon" width={25} />
          My Projects
        </div>
        <div className="icon">
          <img src={chatroom} alt="chatroom-icon" width={30} />
          Chatroom
        </div>
        <div className="icon">
          <img src={profile} alt="chatroom-icon" width={25} />
          Profile
        </div>
        <div className="icon">
          <img src={more} alt="more-icon" width={25} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
