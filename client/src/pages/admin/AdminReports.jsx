import { useEffect, useState } from "react";
import * as api from "../../services/api";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.fetchAdminReports({ status: nextStatus, limit: 50 });
      setReports(data.reports || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const resolve = async (id, nextStatus) => {
    try {
      const data = await api.updateAdminReport(id, { status: nextStatus });
      setReports((prev) =>
        status === "open"
          ? prev.filter((r) => r.id !== id)
          : prev.map((r) => (r.id === id ? data.report : r))
      );
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fx-admin__section">
      <div className="fx-admin__toolbar">
        <select
          className="fx-input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
        <button type="button" className="fx-btn fx-btn--secondary" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="fx-muted">Loading reports...</p>
      ) : error ? (
        <p className="fx-muted">{error}</p>
      ) : reports.length === 0 ? (
        <p className="fx-muted">No reports in this queue.</p>
      ) : (
        <div className="fx-feed">
          {reports.map((report) => (
            <div key={report.id} className="fx-card fx-admin__row">
              <div className="fx-admin__row-main">
                <strong>
                  {report.targetType} #{report.targetId}
                </strong>
                <span className="fx-muted">
                  Reason: {report.reason}
                  {report.reportedUser
                    ? ` · against @${report.reportedUser.username}`
                    : ""}
                  {report.reporter ? ` · by @${report.reporter.username}` : ""}
                </span>
                {report.details && <p className="fx-admin__clip">{report.details}</p>}
                <div className="fx-admin__badges">
                  <span className="fx-card__badge">{report.status}</span>
                  <span className="fx-muted">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {report.status === "open" && (
                <div className="fx-admin__actions">
                  <button
                    type="button"
                    className="fx-btn"
                    onClick={() => resolve(report.id, "resolved")}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    className="fx-btn fx-btn--secondary"
                    onClick={() => resolve(report.id, "dismissed")}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
