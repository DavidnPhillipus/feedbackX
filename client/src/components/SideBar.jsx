import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiPlusSquare,
  FiFolder,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiLogOut,
  FiUsers,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import SearchModal from "./SearchModal";
import SmallSideBar from "./SmallSideBar";
import MobileBottomNav from "./MobileBottomNav";
import MoreMenu from "./MoreMenu";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const PHONE_MAX = 640;
const TABLET_MAX = 767;

function useViewportMode() {
  const getMode = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (w <= PHONE_MAX) return "phone";
    if (w <= TABLET_MAX) return "tablet";
    return "desktop";
  };

  const [mode, setMode] = useState(getMode);

  useEffect(() => {
    const update = () => setMode(getMode());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return mode;
}

function NavItem(props) {
  const { to, icon: Icon, label, onClick } = props;
  const iconMarkup = Icon ? <Icon size={20} aria-hidden="true" /> : null;

  if (onClick) {
    return (
      <button
        className="fx-nav__item"
        type="button"
        title={label}
        aria-label={label}
        onClick={onClick}
      >
        {iconMarkup}
        <span className="fx-nav__label">{label}</span>
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
      {iconMarkup}
      <span className="fx-nav__label">{label}</span>
    </NavLink>
  );
}

export default function SideBar() {
  const mode = useViewportMode();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { activeRoom } = useChat();
  const isChatPage = location.pathname === "/feedbackRooms";
  const phoneChatActive = mode === "phone" && isChatPage && !!activeRoom;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const moreItems = [
    { label: "Invites", icon: FiMail, to: "/Invites" },
    {
      label: "Admin",
      icon: FiUsers,
      to: "/admin",
      hidden: !isAdmin,
    },
    { label: "Log out", icon: FiLogOut, onClick: handleLogout, danger: true },
  ];

  const appClass = [
    "fx-app",
    isChatPage ? "fx-app--chat" : "",
    mode === "phone" ? "fx-app--phone" : "",
    phoneChatActive ? "fx-app--phone-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appClass}>
      {mode === "tablet" && (
        <SmallSideBar
          onSearchOpen={() => setIsSearchOpen(true)}
          moreItems={moreItems}
        />
      )}

      {mode === "desktop" && (
        <aside className="fx-sidebar">
          <h1 className="fx-logo">
            feedback<span className="fx-logo__accent">X</span>
          </h1>
          <nav className="fx-nav">
            <NavItem to="/home" icon={FiHome} label="Home" />
            <NavItem icon={FiSearch} label="Search" onClick={() => setIsSearchOpen(true)} />
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
      )}

      <main className={`fx-main${isChatPage ? " fx-main--chat" : ""}`}>
        <div className={`fx-main__container${isChatPage ? " fx-main__container--full" : ""}`}>
          <Outlet />
        </div>
      </main>

      {mode === "phone" && (
        <MobileBottomNav onSearchOpen={() => setIsSearchOpen(true)} />
      )}

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
}
