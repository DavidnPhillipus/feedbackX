import "./../css/SmallSideBar.css";
import { NavLink } from "react-router-dom";
import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal } from 'react-icons/fi';

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
        <NavLink className="icon" to="/" title="Home" aria-label="Home">
          <FiHome size={18} />
        </NavLink>
        <NavLink className="icon" to="/Search" title="Search" aria-label="Search">
          <FiSearch size={18} />
        </NavLink>
        <NavLink className="icon" to="/Explore" title="Explore" aria-label="Explore">
          <FiCompass size={18} />
        </NavLink>
        <button className="icon" type="button" title="Post" aria-label="Post">
          <FiPlusSquare size={18} />
        </button>
        <button className="icon" type="button" title="My Projects" aria-label="My Projects">
          <FiFolder size={18} />
        </button>
        <button className="icon" type="button" title="Chatroom" aria-label="Chatroom">
          <FiMessageCircle size={18} />
        </button>
        <NavLink className="icon" to="/Profile" title="Profile" aria-label="Profile">
          <FiUser size={18} />
        </NavLink>
        <button className="icon" type="button" title="More" aria-label="More">
          <FiMoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
