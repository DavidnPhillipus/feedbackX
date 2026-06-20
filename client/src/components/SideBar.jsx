import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { FiHome, FiSearch, FiCompass, FiPlusSquare, FiFolder, FiMessageCircle, FiUser, FiMoreHorizontal, FiMail, FiLogOut, FiUsers } from 'react-icons/fi';

import { useState, useEffect } from 'react';

import SearchModal from "./SearchModal";

import SmallSideBar from "./SmallSideBar";

import { useAuth } from "../context/AuthContext";



function NavItem({ to, icon: Icon, label, onClick }) {

  if (onClick) {

    return (

      <button className="fx-nav__item" type="button" title={label} aria-label={label} onClick={onClick}>

        <Icon size={20} aria-hidden="true" />

        <span className="fx-nav__label">{label}</span>

      </button>

    );

  }

  return (

    <NavLink className={({ isActive }) => `fx-nav__item${isActive ? ' active' : ''}`} to={to} title={label} aria-label={label}>

      <Icon size={20} aria-hidden="true" />

      <span className="fx-nav__label">{label}</span>

    </NavLink>

  );

}



export default function SideBar() {

  const [isCompact, setIsCompact] = useState(window.innerWidth < 768);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [showMore, setShowMore] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  const { logout, isAdmin } = useAuth();

  const isChatPage = location.pathname === "/feedbackRooms";



  useEffect(() => {

    const handleResize = () => setIsCompact(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);

  }, []);



  const handleLogout = () => {

    logout();

    navigate("/");

  };



  return (

    <div className="fx-app">

      {isCompact ? (

        <SmallSideBar

          onSearchOpen={() => setIsSearchOpen(true)}

          onLogout={handleLogout}

          isAdmin={isAdmin}

        />

      ) : (

        <aside className="fx-sidebar">

          <h1 className="fx-logo">

            feedback<span className="fx-logo__accent">X</span>

          </h1>

          <nav className="fx-nav">

            <NavItem to="/home" icon={FiHome} label="Home" />

            <NavItem icon={FiSearch} label="Search" onClick={() => setIsSearchOpen(true)} />

            <NavItem to="/Explore" icon={FiCompass} label="Explore" />

            <NavItem to="/post" icon={FiPlusSquare} label="Post" />

            <NavItem to="/projects" icon={FiFolder} label="My Projects" />

            <NavItem to="/feedbackRooms" icon={FiMessageCircle} label="Chatroom" />

            <NavItem to="/Invites" icon={FiMail} label="Invites" />

            <NavItem to="/Profile" icon={FiUser} label="Profile" />

            <NavItem icon={FiMoreHorizontal} label="More" onClick={() => setShowMore(!showMore)} />

            {showMore && (

              <div className="fx-nav__more-menu">

                {isAdmin && (

                  <NavItem to="/admin/users" icon={FiUsers} label="Manage Users" />

                )}

                <NavItem icon={FiLogOut} label="Logout" onClick={handleLogout} />

              </div>

            )}

          </nav>

        </aside>

      )}

      <main className={`fx-main${isChatPage ? " fx-main--chat" : ""}`}>

        <div className={`fx-main__container${isChatPage ? " fx-main__container--full" : ""}`}>

          <Outlet />

        </div>

      </main>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

    </div>

  );

}

