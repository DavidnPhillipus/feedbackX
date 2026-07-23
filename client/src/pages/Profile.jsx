import {
  FiLogOut,
  FiMail,
  FiUsers,
  FiFolder,
  FiMessageCircle,
  FiHome,
  FiChevronRight,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";
import MoreMenu from "../components/MoreMenu";
import UserAvatar from "../components/UserAvatar";
import ProfileStats from "../components/ProfileStats";

export default function ProfilePage() {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
    });
    setPostCount(user.postCount || 0);

    api
      .fetchMe()
      .then((d) => {
        setPostCount(d.user.postCount || 0);
        setFollowerCount(d.user.followerCount || 0);
        setFollowingCount(d.user.followingCount || 0);
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl || null,
      });
      updateUser(data.user);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setEditing(false);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const { url } = await api.uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      if (!editing) {
        const data = await api.updateProfile({
          name: user.name,
          bio: user.bio || "",
          avatarUrl: url,
        });
        updateUser(data.user);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const previewAvatar = editing ? form.avatarUrl : user?.avatarUrl;

  return (
    <div className="fx-page">
      <div className="fx-page-header">
        <span>
          <strong>My Profile</strong>
        </span>
        <span>Your public profile</span>
      </div>

      <div className="fx-profile">
        <div className="fx-profile__banner">
          <div className="fx-profile__avatar-wrap">
            <UserAvatar
              src={previewAvatar}
              name={form.name || user?.name}
              username={user?.username}
              size={96}
              className="fx-profile__avatar"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="fx-profile__avatar-input"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="fx-profile__avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Uploading…" : "Change photo"}
            </button>
          </div>

          <div className="fx-profile__info">
            {editing ? (
              <>
                <label className="fx-profile__field-label" htmlFor="profile-name">
                  Name
                </label>
                <input
                  id="profile-name"
                  className="fx-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                />
                <p className="fx-profile__username">@{user?.username}</p>
                <label className="fx-profile__field-label" htmlFor="profile-bio">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  className="fx-textarea"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Write a short bio about yourself"
                  rows={3}
                />
                <p className="fx-profile__edit-hint">
                  Tap your photo to upload a profile picture.
                </p>
              </>
            ) : (
              <>
                <h1 className="fx-profile__name">{user?.name}</h1>
                <p className="fx-profile__username">@{user?.username}</p>
                <p className="fx-profile__bio">
                  {user?.bio || "No bio yet. Tap Edit profile to add one."}
                </p>
                {!user?.avatarUrl && (
                  <p className="fx-profile__edit-hint">
                    Add a profile photo so people recognize you across feedbackX.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="fx-profile__actions">
            {editing ? (
              <>
                <button type="button" className="fx-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="fx-btn fx-btn--secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="fx-btn" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            )}

            <MoreMenu
              items={[
                { label: "Edit profile", onClick: () => setEditing(true) },
                { label: "Invites", icon: FiMail, to: "/Invites" },
                {
                  label: "Manage Users",
                  icon: FiUsers,
                  to: "/admin/users",
                  hidden: !isAdmin,
                },
                { label: "Log out", icon: FiLogOut, onClick: handleLogout, danger: true },
              ]}
            />
          </div>
        </div>

        <ProfileStats
          userId={user?.id}
          postCount={postCount}
          followingCount={followingCount}
          followerCount={followerCount}
        />
      </div>

      <div className="fx-highlights">
        <NavLink to="/projects" className="fx-highlight">
          <span className="fx-highlight__icon" aria-hidden="true">
            <FiFolder size={22} />
          </span>
          <div>
            <h3 className="fx-highlight__title">My Projects</h3>
            <p className="fx-highlight__desc">View and manage your projects</p>
          </div>
          <FiChevronRight className="fx-highlight__arrow" size={20} aria-hidden="true" />
        </NavLink>

        <NavLink to="/feedbackRooms" className="fx-highlight">
          <span className="fx-highlight__icon" aria-hidden="true">
            <FiMessageCircle size={22} />
          </span>
          <div>
            <h3 className="fx-highlight__title">Chat Rooms</h3>
            <p className="fx-highlight__desc">Join feedback discussions</p>
          </div>
          <FiChevronRight className="fx-highlight__arrow" size={20} aria-hidden="true" />
        </NavLink>

        <NavLink
          to="/home"
          className="fx-highlight"
          onClick={() => sessionStorage.setItem("fx-home-tab", "liked")}
        >
          <span className="fx-highlight__icon" aria-hidden="true">
            <FiHome size={22} />
          </span>
          <div>
            <h3 className="fx-highlight__title">Liked Projects</h3>
            <p className="fx-highlight__desc">Posts you reacted to</p>
          </div>
          <FiChevronRight className="fx-highlight__arrow" size={20} aria-hidden="true" />
        </NavLink>
      </div>
    </div>
  );
}
