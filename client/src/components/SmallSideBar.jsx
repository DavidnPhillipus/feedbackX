import { NavLink } from "react-router-dom";

import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal, FiLogOut } from 'react-icons/fi';



function NavItem({ to, icon: Icon, label, onClick }) {

  if (onClick) {

    return (

      <button className="fx-nav__item" type="button" title={label} aria-label={label} onClick={onClick}>

        <Icon size={20} />

      </button>

    );

  }

  return (

    <NavLink className={({ isActive }) => `fx-nav__item${isActive ? ' active' : ''}`} to={to} title={label} aria-label={label}>

      <Icon size={20} />

    </NavLink>

  );

}



export default function SmallSideBar({ onSearchOpen, onLogout }) {
  return (

    <aside className="fx-sidebar fx-sidebar--compact">

      <h1 className="fx-logo">

        f<span className="fx-logo__accent">X</span>

      </h1>

      <nav className="fx-nav">

        <NavItem to="/home" icon={FiHome} label="Home" />

        <NavItem icon={FiSearch} label="Search" onClick={onSearchOpen} />

        <NavItem to="/Explore" icon={FiCompass} label="Explore" />

        <NavItem to="/post" icon={FiPlusSquare} label="Post" />

        <NavItem to="/projects" icon={FiFolder} label="My Projects" />

        <NavItem to="/feedbackRooms" icon={FiMessageCircle} label="Chatroom" />

        <NavItem to="/Profile" icon={FiUser} label="Profile" />

        <NavItem icon={FiLogOut} label="Logout" onClick={onLogout} />

      </nav>

    </aside>

  );

}

