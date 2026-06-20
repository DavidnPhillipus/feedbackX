import { FiMoreHorizontal, FiLogOut } from 'react-icons/fi';

import { NavLink } from 'react-router-dom';

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import * as api from "../services/api";



export default function ProfilePage() {

  const { user, updateUser, logout } = useAuth();

  const [invites, setInvites] = useState([]);

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "" });

  const [saving, setSaving] = useState(false);

  const [postCount, setPostCount] = useState(0);



  useEffect(() => {

    if (!user) return;

    setForm({

      name: user.name || "",

      bio: user.bio || "",

      avatarUrl: user.avatarUrl || "",

    });

    setPostCount(user.postCount || 0);



    api.fetchMe()

      .then((d) => setPostCount(d.user.postCount || 0))

      .catch(() => {});



    api.fetchInvites(user.id)

      .then((d) => setInvites((d.invites || []).slice(0, 3)))

      .catch(() => setInvites([]));

  }, [user]);



  const handleSave = async () => {

    setSaving(true);

    try {

      const data = await api.updateProfile(form);

      updateUser(data.user);

      setEditing(false);

    } catch (err) {

      alert(err.message);

    } finally {

      setSaving(false);

    }

  };



  const avatar =

    user?.avatarUrl || `https://i.pravatar.cc/150?img=${(user?.id || 1) % 70}`;



  return (

    <div className="fx-page">

      <div className="fx-page-header">

        <span><strong>My Profile</strong></span>

        <span>Your public profile</span>

      </div>

      <div className="fx-grid fx-grid--with-aside">

        <main>

          <div className="fx-profile">

            <div className="fx-profile__banner">

              <img className="fx-profile__avatar" src={avatar} alt="Profile" />

              <div className="fx-profile__info">

                {editing ? (

                  <>

                    <input

                      className="fx-input"

                      value={form.name}

                      onChange={(e) => setForm({ ...form, name: e.target.value })}

                      placeholder="Name"

                    />

                    <textarea

                      className="fx-textarea"

                      value={form.bio}

                      onChange={(e) => setForm({ ...form, bio: e.target.value })}

                      placeholder="Bio"

                      rows={3}

                    />

                    <input

                      className="fx-input"

                      value={form.avatarUrl}

                      onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}

                      placeholder="Avatar URL"

                    />

                  </>

                ) : (

                  <>

                    <h1 className="fx-profile__name">{user?.name}</h1>

                    <p className="fx-profile__username">@{user?.username}</p>

                    <p className="fx-profile__bio">

                      {user?.bio || "No bio yet. Click Edit profile to add one."}

                    </p>

                  </>

                )}

              </div>

              <div className="fx-profile__actions">

                {editing ? (

                  <>

                    <button type="button" className="fx-btn" onClick={handleSave} disabled={saving}>

                      {saving ? "Saving..." : "Save"}

                    </button>

                    <button type="button" className="fx-btn fx-btn--secondary" onClick={() => setEditing(false)}>

                      Cancel

                    </button>

                  </>

                ) : (

                  <button type="button" className="fx-btn" onClick={() => setEditing(true)}>

                    Edit profile

                  </button>

                )}

                <button type="button" className="fx-nav__item" title="Logout" onClick={() => { logout(); window.location.href = "/"; }}>

                  <FiLogOut size={20} />

                </button>

                <FiMoreHorizontal size={20} />

              </div>

            </div>

            <div className="fx-profile__stats">

              <div>

                <span className="fx-stat__value">{postCount}</span>

                <span className="fx-stat__label">Posts</span>

              </div>

              <div>

                <span className="fx-stat__value">{invites.length}</span>

                <span className="fx-stat__label">Invites</span>

              </div>

            </div>

          </div>

          <div className="fx-highlights">

            <NavLink to="/projects" className="fx-highlight">

              <span className="fx-highlight__icon">📋</span>

              <div>

                <h3 className="fx-highlight__title">My Projects</h3>

                <p className="fx-highlight__desc">View and manage your projects</p>

              </div>

              <span className="fx-highlight__arrow">→</span>

            </NavLink>

            <NavLink to="/feedbackRooms" className="fx-highlight">

              <span className="fx-highlight__icon">💬</span>

              <div>

                <h3 className="fx-highlight__title">Chat Rooms</h3>

                <p className="fx-highlight__desc">Join feedback discussions</p>

              </div>

              <span className="fx-highlight__arrow">→</span>

            </NavLink>

            <NavLink to="/Invites" className="fx-highlight">

              <span className="fx-highlight__icon">✉️</span>

              <div>

                <h3 className="fx-highlight__title">Invites</h3>

                <p className="fx-highlight__desc">Pending room invitations</p>

              </div>

              <span className="fx-highlight__arrow">→</span>

            </NavLink>

          </div>

        </main>

        <aside>

          <div className="fx-suggested">

            <h3 className="fx-suggested__title">Suggested</h3>

            {invites.length === 0 ? (

              <p className="fx-muted">No invites yet</p>

            ) : (

              invites.map((invite) => (

                <div key={invite.id} className="fx-suggested__item">

                  <img src={invite.avatar} alt={invite.title} className="fx-suggested__avatar" />

                  <div>

                    <h4 className="fx-suggested__name">{invite.title}</h4>

                    <p className="fx-suggested__about">{invite.about}</p>

                  </div>

                </div>

              ))

            )}

          </div>

        </aside>

      </div>

    </div>

  );

}

