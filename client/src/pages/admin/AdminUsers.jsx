import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

export default function AdminUsers() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bannedFilter = params.get("banned") || "";

  const load = async (search = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.fetchAdminUsers({
        q: search,
        banned: bannedFilter || undefined,
        limit: 50,
      });
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannedFilter]);

  const patchUser = async (id, body) => {
    try {
      const data = await api.updateAdminUser(id, body);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this user and their projects?")) return;
    try {
      await api.deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fx-admin__section">
      <form
        className="fx-admin__toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <input
          className="fx-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, username, email"
        />
        <button type="submit" className="fx-btn">
          Search
        </button>
      </form>

      {loading ? (
        <p className="fx-muted">Loading users...</p>
      ) : error ? (
        <p className="fx-muted">{error}</p>
      ) : users.length === 0 ? (
        <p className="fx-muted">No users found.</p>
      ) : (
        <div className="fx-feed">
          {users.map((u) => {
            const isSelf = u.id === user.id;
            const isUserAdmin = (u.roles || []).includes("ADMIN");
            return (
              <div key={u.id} className="fx-card fx-admin__row">
                <div className="fx-admin__row-main">
                  <strong>{u.name}</strong>
                  <span className="fx-muted">@{u.username}</span>
                  <span className="fx-muted">{u.email}</span>
                  <div className="fx-admin__badges">
                    {(u.roles || []).map((role) => (
                      <span key={role} className="fx-card__badge">
                        {role}
                      </span>
                    ))}
                    {u.bannedAt && <span className="fx-admin__badge-danger">Banned</span>}
                    <span className="fx-muted">
                      {u.postCount} projects · {u.reportCount} reports
                    </span>
                  </div>
                  {u.banReason && <p className="fx-muted">Ban reason: {u.banReason}</p>}
                </div>
                {!isSelf && (
                  <div className="fx-admin__actions">
                    <button
                      type="button"
                      className="fx-btn fx-btn--secondary"
                      onClick={() =>
                        patchUser(u.id, {
                          roles: isUserAdmin ? ["USER"] : ["ADMIN", "USER"],
                        })
                      }
                    >
                      {isUserAdmin ? "Remove admin" : "Make admin"}
                    </button>
                    <button
                      type="button"
                      className="fx-btn fx-btn--secondary"
                      onClick={() =>
                        patchUser(
                          u.id,
                          u.bannedAt
                            ? { banned: false }
                            : {
                                banned: true,
                                banReason: prompt("Ban reason") || "Banned by admin",
                              }
                        )
                      }
                    >
                      {u.bannedAt ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      className="fx-btn fx-btn--secondary"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
