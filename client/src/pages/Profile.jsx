import "./../css/ProfilePage.css";
import CardTemplate from "../Templates/CardTemplate";
import { FiMoreHorizontal } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getInvites } from "../services/mockApi";

export default function ProfilePage() {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    let mounted = true;
    getInvites()
      .then((d) => mounted && setInvites(d.slice(0, 3)))
      .catch(() => mounted && setInvites([]));
    return () => (mounted = false);
  }, []);
  return (
    <div className="page-inner container">
      <div className="columns">
        <main>
          <div className="main-header">
            <span>
              <strong>My Profile</strong>
            </span>
            <span>Your public profile</span>
          </div>
          <div className="profile-card">
            <div className="profile-banner">
              <img
                className="profile-avatar"
                src="https://i.pravatar.cc/150?img=9"
                alt="Profile"
              />
              <div className="profile-header-info">
                <h1 className="profile-full-name">David Phillipus</h1>
                <p className="profile-username">@david.n.phillipus</p>
                <p className="profile-bio">
                  This is just a bio nothing more nothing less but it can be anything you want
                </p>
              </div>
              <div className="profile-actions">
                <button className="edit-profile">Edit profile</button>
                <FiMoreHorizontal className="more-icon" size={20} />
              </div>
            </div>
            <div className="profile-stats-row">
              <div className="stat-item">
                <span className="stat-number">10</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100</span>
                <span className="stat-label">Categories</span>
              </div>
            </div>
          </div>
          <div className="profile-highlights">
            <NavLink to="/projects" className="highlight-card">
              <div className="highlight-icon">📋</div>
              <div className="highlight-content">
                <h3 className="highlight-title">My Projects</h3>
                <p className="highlight-description">View and manage your projects</p>
              </div>
              <span className="highlight-arrow">→</span>
            </NavLink>
            <NavLink to="/feedbackRooms" className="highlight-card">
              <div className="highlight-icon">💬</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Chat Rooms</h3>
                <p className="highlight-description">Join feedback discussions</p>
              </div>
              <span className="highlight-arrow">→</span>
            </NavLink>
          </div>
        </main>
        <aside>
          <div className="suggested-section">
            <h3 className="suggested-title">Suggested</h3>
            <div className="suggested-list">
              {invites.map((invite) => (
                <div key={invite.id} className="suggested-item">
                  <img src={invite.avatar} alt={invite.title} className="suggested-avatar" />
                  <div className="suggested-content">
                    <h4 className="suggested-name">{invite.title}</h4>
                    <p className="suggested-about">{invite.about}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
