import "./../css/SideBar.css";
import { NavLink, Outlet } from "react-router-dom";
import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal } from 'react-icons/fi';

export default function SideBar() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1 className="logo-full">
          feedback<span style={{ color: "blue" }}>X</span>
        </h1>
        <h1 className="logo-compact">
          f<span style={{ color: "blue" }}>X</span>
        </h1>
        <div className="icons-container">
          <NavLink className="icon" to="/" title="Home" aria-label="Home">
            <FiHome size={20} aria-hidden="true" />
            <span>Home</span>
          </NavLink>
          <NavLink className="icon" to="/Search" title="Search" aria-label="Search">
            <FiSearch size={20} aria-hidden="true" />
            <span>Search</span>
          </NavLink>
          <NavLink className="icon" to="/Explore" title="Explore" aria-label="Explore">
            <FiCompass size={20} aria-hidden="true" />
            <span>Explore</span>
          </NavLink>
          <button className="icon" type="button" title="Post" aria-label="Post">
            <FiPlusSquare size={20} aria-hidden="true" />
            <span>Post</span>
          </button>
          <button className="icon" type="button" title="My Projects" aria-label="My Projects">
            <FiFolder size={20} aria-hidden="true" />
            <span>My Projects</span>
          </button>
          <button className="icon" type="button" title="Chatroom" aria-label="Chatroom">
            <FiMessageCircle size={20} aria-hidden="true" />
            <span>Chatroom</span>
          </button>
          <NavLink className="icon" to="/Profile" title="Profile" aria-label="Profile">
            <FiUser size={20} aria-hidden="true" />
            <span>Profile</span>
          </NavLink>
          <button className="icon" type="button" title="More" aria-label="More">
            <FiMoreHorizontal size={20} aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
