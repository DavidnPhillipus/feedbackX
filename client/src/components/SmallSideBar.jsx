import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiPlusSquare,
  FiFolder,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import MoreMenu from "./MoreMenu";

function NavItem({ to, icon: Icon, label, onClick }) {
  if (onClick) {
    return (
      <button className="fx-nav__item" type="button" title={label} aria-label={label} onClick={onClick}>
        <Icon size={20} />
      </button>
    );
  }

  return (
    <NavLink
      className={({ isActive }) => `fx-nav__item${isActive ? " active" : ""}`}
      to={to}
      title={label}
      aria-label={label}
    >
      <Icon size={20} />
    </NavLink>
  );
}

export default function SmallSideBar({ onSearchOpen, moreItems = [] }) {
  return (
    <aside className="fx-sidebar fx-sidebar--compact">
      <h1 className="fx-logo">
        f<span className="fx-logo__accent">X</span>
      </h1>
      <nav className="fx-nav">
        <NavItem to="/home" icon={FiHome} label="Home" />
        <NavItem icon={FiSearch} label="Search" onClick={onSearchOpen} />
        <NavItem to="/Explore" icon={FiCompass} label="Explore" />
        <NavItem to="/creators" icon={FiUsers} label="Creators" />
        <NavItem to="/post" icon={FiPlusSquare} label="Post" />
        <NavItem to="/projects" icon={FiFolder} label="My Projects" />
        <NavItem to="/feedbackRooms" icon={FiMessageCircle} label="Chatroom" />
        <NavItem to="/Invites" icon={FiMail} label="Invites" />
        <NavItem to="/Profile" icon={FiUser} label="Profile" />
        <MoreMenu items={moreItems} buttonClassName="fx-nav__item fx-more-menu__trigger" />
      </nav>
    </aside>
  );
}
