import "./../css/SideBar.css";
import { Link } from "react-router-dom";
import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal } from 'react-icons/fi';

export default function SideBar() {
  return (
    <div className="sidebar">
      <h1 className="logo-full">
        feedback<span style={{ color: "blue" }}>X</span>
      </h1>
      <h1 className="logo-compact">
        f<span style={{ color: "blue" }}>X</span>
      </h1>
      <div className="icons-container">
        <Link className="icon" to="/">
          <FiHome size={20} aria-hidden="true"/>
          <span>Home</span>
        </Link>
        <Link className="icon" to="/Search">
          <FiSearch size={20} aria-hidden="true"/>
          <span>Search</span>
        </Link>
        <Link className="icon" to="/Explore">
          <FiCompass size={20} aria-hidden="true"/>
          <span>Explore</span>
        </Link>
        <div className="icon">
          <FiPlusSquare size={20} aria-hidden="true"/>
          <span>Post</span>
        </div>
        <div className="icon">
          <FiFolder size={20} aria-hidden="true"/>
          <span>My Projects</span>
        </div>
        <div className="icon">
          <FiMessageCircle size={20} aria-hidden="true"/>
          <span>Chatroom</span>
        </div>
        <Link className="icon" to="/Profile">
          <FiUser size={20} aria-hidden="true"/>
          <span>Profile</span>
        </Link>
        <div className="icon">
          <FiMoreHorizontal size={20} aria-hidden="true"/>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
