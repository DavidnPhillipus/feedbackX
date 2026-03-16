import "./../css/SmallSideBar.css";
import { NavLink } from "react-router-dom";
import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
import SearchModal from "./SearchModal";

export default function SmallSideBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="app-layout">
      {isSearchOpen ? (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      ) : (
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
            <NavLink className="icon" to="/" title="Home" aria-label="Home">
              <FiHome size={18} />
            </NavLink>
            <button className="icon" type="button" title="Search" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
              <FiSearch size={18} />
            </button>
            <NavLink className="icon" to="/Explore" title="Explore" aria-label="Explore">
              <FiCompass size={18} />
            </NavLink>
            <NavLink className="icon" to="/post" title="Post" aria-label="Post">
              <FiPlusSquare size={18} />
            </NavLink>
            <NavLink className="icon" to="/projects" title="My Projects" aria-label="My Projects">
              <FiFolder size={18} />
            </NavLink>
            <NavLink className="icon" to="/feedbackRooms" title="Chatroom" aria-label="Chatroom">
              <FiMessageCircle size={18} />
            </NavLink>
            <NavLink className="icon" to="/Profile" title="Profile" aria-label="Profile">
              <FiUser size={18} />
            </NavLink>
            <button className="icon" type="button" title="More" aria-label="More">
              <FiMoreHorizontal size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="content">
        {/* Outlet will be rendered here, but since this is conditional, wait */}
      </main>
    </div>
  );
}
