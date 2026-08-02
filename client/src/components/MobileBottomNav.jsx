import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiMessageCircle,
  FiUser,
  FiSearch,
  FiUsers,
  FiFolder,
  FiMail,
  FiLogOut,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const PRIMARY = [
  { to: "/home", icon: FiHome, label: "Home" },
  { to: "/Explore", icon: FiCompass, label: "Explore" },
  { to: "/post", icon: FiPlusSquare, label: "Post", primary: true },
  { to: "/feedbackRooms", icon: FiMessageCircle, label: "Chat" },
  { to: "/Profile", icon: FiUser, label: "Profile" },
];

export default function MobileBottomNav({ onSearchOpen }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { activeRoom } = useChat();

  const onChatPage = location.pathname === "/feedbackRooms";
  const hideForActiveChat = onChatPage && !!activeRoom;

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  if (hideForActiveChat) return null;

  const secondary = [
    {
      key: "search",
      label: "Search",
      hint: "Find posts & people",
      icon: FiSearch,
      onClick: () => {
        setSheetOpen(false);
        onSearchOpen?.();
      },
    },
    {
      key: "creators",
      label: "Creators",
      hint: "Discover people",
      icon: FiUsers,
      to: "/creators",
    },
    {
      key: "projects",
      label: "My Projects",
      hint: "Your published work",
      icon: FiFolder,
      to: "/projects",
    },
    {
      key: "invites",
      label: "Invites",
      hint: "Room invitations",
      icon: FiMail,
      to: "/Invites",
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: "Admin",
            hint: "Users, content, reports",
            icon: FiUsers,
            to: "/admin",
          },
        ]
      : []),
    {
      key: "logout",
      label: "Log out",
      hint: "Sign out of feedbackX",
      icon: FiLogOut,
      danger: true,
      onClick: () => {
        setSheetOpen(false);
        logout();
        navigate("/");
      },
    },
  ];

  const secondaryActive = ["/creators", "/projects", "/Invites", "/admin"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  return (
    <>
      {sheetOpen && (
        <>
          <button
            type="button"
            className="fx-phone-sheet__backdrop"
            aria-label="Close menu"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fx-phone-sheet fx-phone-sheet--open"
            id="fx-phone-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More destinations"
          >
            <div className="fx-phone-sheet__panel">
              <div className="fx-phone-sheet__head">
                <div>
                  <p className="fx-phone-sheet__eyebrow">Quick jump</p>
                  <h2>Everything else</h2>
                </div>
                <button
                  type="button"
                  className="fx-phone-sheet__close"
                  aria-label="Close"
                  onClick={() => setSheetOpen(false)}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="fx-phone-sheet__grid">
                {secondary.map((item) => {
                  const Icon = item.icon;
                  const className = `fx-phone-sheet__tile${item.danger ? " fx-phone-sheet__tile--danger" : ""}`;

                  if (item.to) {
                    return (
                      <NavLink
                        key={item.key}
                        to={item.to}
                        className={({ isActive }) => `${className}${isActive ? " active" : ""}`}
                        onClick={() => setSheetOpen(false)}
                      >
                        <span className="fx-phone-sheet__icon">
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span className="fx-phone-sheet__label">{item.label}</span>
                        <span className="fx-phone-sheet__hint">{item.hint}</span>
                      </NavLink>
                    );
                  }

                  return (
                    <button key={item.key} type="button" className={className} onClick={item.onClick}>
                      <span className="fx-phone-sheet__icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="fx-phone-sheet__label">{item.label}</span>
                      <span className="fx-phone-sheet__hint">{item.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <nav className="fx-phone-nav" aria-label="Primary">
        <button
          type="button"
          className={`fx-phone-nav__handle${secondaryActive || sheetOpen ? " fx-phone-nav__handle--active" : ""}`}
          aria-expanded={sheetOpen}
          aria-controls="fx-phone-more-sheet"
          onClick={() => setSheetOpen((v) => !v)}
        >
          <span className="fx-phone-nav__handle-pill" />
          <span className="fx-phone-nav__handle-label">
            <FiChevronUp size={14} aria-hidden="true" />
            More
          </span>
        </button>

        <div className="fx-phone-nav__items">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            if (item.primary) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `fx-phone-nav__item fx-phone-nav__item--post${isActive ? " active" : ""}`
                  }
                  aria-label={item.label}
                >
                  <span className="fx-phone-nav__post-btn">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="fx-phone-nav__text">{item.label}</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `fx-phone-nav__item${isActive ? " active" : ""}`}
                aria-label={item.label}
              >
                <Icon size={22} aria-hidden="true" />
                <span className="fx-phone-nav__text">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
