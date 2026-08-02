import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import * as api from "../services/api";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "hate", label: "Hate / abuse" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
];

export default function ReportButton({
  targetType,
  targetId,
  reportedUserId,
  label = "Report",
  className = "fx-btn fx-btn--secondary",
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await api.createReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
        reportedUserId,
      });
      setMessage("Report submitted. Thanks.");
      setDetails("");
      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1200);
    } catch (err) {
      setMessage(err.message || "Could not submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fx-report">
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <FiFlag size={16} aria-hidden="true" />
        <span>{label}</span>
      </button>

      {open && (
        <div className="fx-report__backdrop" role="presentation" onClick={() => setOpen(false)}>
          <form
            className="fx-report__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
          >
            <h3>Report {targetType}</h3>
            <label className="fx-field">
              <span>Reason</span>
              <select
                className="fx-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="fx-field">
              <span>Details (optional)</span>
              <textarea
                className="fx-input"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What should admins know?"
              />
            </label>
            {message && <p className="fx-muted">{message}</p>}
            <div className="fx-admin__actions">
              <button type="button" className="fx-btn fx-btn--secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="fx-btn" disabled={submitting}>
                {submitting ? "Sending…" : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
