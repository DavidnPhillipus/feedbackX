import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);
    try {
      const data = await api.forgotPassword(email.trim());
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setError(err.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fx-auth">
      <div className="fx-auth__card">
        <h1 className="fx-auth__logo">
          feedback<span className="fx-logo__accent">X</span>
        </h1>
        <p className="fx-auth__tagline">Enter your email and we'll send you a reset link.</p>
        <form className="fx-auth__form" onSubmit={handleSubmit}>
          {error && <p className="fx-auth__error">{error}</p>}
          {message && <p className="fx-auth__success">{message}</p>}
          <input
            type="email"
            placeholder="Email"
            className="fx-auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="fx-auth__btn" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        {resetUrl && (
          <p className="fx-auth__footer fx-muted" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
            No email server configured — use this reset link:{" "}
            <a className="fx-auth__link" href={resetUrl}>
              Open reset page
            </a>
          </p>
        )}
        <p className="fx-auth__footer">
          <button type="button" className="fx-auth__link" onClick={() => navigate("/Login")}>
            Back to login
          </button>
        </p>
      </div>
      <footer className="fx-auth__site-footer">
        <div>
          feedback<span className="fx-logo__accent">X</span>
          <span>About</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
          <span>Help</span>
        </div>
        <p>&copy; {new Date().getFullYear()} feedbackX. All rights reserved.</p>
      </footer>
    </div>
  );
}
