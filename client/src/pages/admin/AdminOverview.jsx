import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../../services/api";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchAdminStats()
      .then((data) => setStats(data.stats))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="fx-muted">Loading overview...</p>;
  if (error) return <p className="fx-muted">{error}</p>;
  if (!stats) return null;

  const cards = [
    { label: "Users", value: stats.users, to: "/admin/users" },
    { label: "Banned", value: stats.bannedUsers, to: "/admin/users?banned=true" },
    { label: "Projects", value: stats.posts, to: "/admin/content" },
    { label: "Unpublished", value: stats.unpublishedPosts, to: "/admin/content?published=false" },
    { label: "Open reports", value: stats.openReports, to: "/admin/reports" },
    { label: "Chat messages", value: stats.messages, to: "/admin/content" },
  ];

  return (
    <div className="fx-admin__grid">
      {cards.map((card) => (
        <Link key={card.label} to={card.to} className="fx-admin__stat">
          <span className="fx-admin__stat-value">{card.value}</span>
          <span className="fx-admin__stat-label">{card.label}</span>
        </Link>
      ))}
    </div>
  );
}
