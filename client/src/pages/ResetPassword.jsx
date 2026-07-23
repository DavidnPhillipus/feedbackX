import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as api from "../services/api";

function passwordError(value) {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/\d/.test(value)) return "Password must contain at least 1 number";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value)) {
    return "Password must contain a special character";
  }
  return "";
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordIssue = passwordError(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    setLoading(true);
    try {
      const data = await api.resetPassword({ token, password });
      setMessage(data.message);
      setTimeout(() => navigate("/Login", { replace: true }), 2000);
    } catch (err) {
      setError(err.message || "Could not reset password");
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
        <p className="fx-auth__tagline">Choose a new password for your account.</p>
        <form className="fx-auth__form" onSubmit={handleSubmit}>
          {error && <p className="fx-auth__error">{error}</p>}
          {message && <p className="fx-auth__success">{message}</p>}
          <input
            type="password"
            placeholder="New password (8+ chars, number, special)"
            className="fx-auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="fx-auth__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
          <button type="submit" className="fx-auth__btn" disabled={loading || !token}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
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
