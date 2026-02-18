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
        <NavLink className="icon" to="/">
          <FiHome size={18} />
        </NavLink>
        <NavLink className="icon" to="/Search">
          <FiSearch size={18} />
        </NavLink>
        <NavLink className="icon" to="/Explore">
          <FiCompass size={18} />
        </NavLink>
        <div className="icon">
          <FiPlusSquare size={18} />
        </div>
        <div className="icon">
          <FiFolder size={18} />
        </div>
        <div className="icon">
          <FiMessageCircle size={18} />
        </div>
        <NavLink className="icon" to="/Profile">
          <FiUser size={18} />
        </NavLink>
        <div className="icon">
          <FiMoreHorizontal size={18} />
        </div>
      </div>
    </div>
  );
}
