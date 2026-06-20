import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

export default function AdminUsers() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    api
      .fetchUsers()
      .then((d) => setUsers(d.users || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="fx-page">
        <p className="fx-muted">Admin access required.</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fx-page">
      <div className="fx-page-header">
        <span><strong>Manage Users</strong></span>
        <span>Admin panel</span>
      </div>
      {loading ? (
        <p className="fx-muted">Loading users...</p>
      ) : error ? (
        <p className="fx-muted">{error}</p>
      ) : (
        <div className="fx-feed">
          {users.map((u) => (
            <div key={u.id} className="fx-card" style={{ padding: "1rem" }}>
              <div className="fx-card__top">
                <strong>{u.name}</strong>
                <span className="fx-muted">@{u.username}</span>
              </div>
              <p className="fx-muted">{u.email}</p>
              <p className="fx-muted">Roles: {(u.roles || []).join(", ")}</p>
              {u.id !== user.id && (
                <button
                  type="button"
                  className="fx-btn fx-btn--secondary"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
