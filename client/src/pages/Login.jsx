import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/home";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
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
        <form className="fx-auth__form" onSubmit={handleSubmit}>
          {error && <p className="fx-auth__error">{error}</p>}
          <input
            type="text"
            placeholder="Email or username"
            className="fx-auth__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="fx-auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="fx-auth__btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="fx-auth__divider">OR</div>
          <GoogleSignIn />
          <p className="fx-auth__footer">
            <span className="fx-auth__link">Forgot password?</span>
          </p>
        </form>
        <p className="fx-auth__footer">
          Don't have an account?{' '}
          <button type="button" className="fx-auth__link" onClick={() => navigate('/Register')}>Register</button>
        </p>
        <p className="fx-auth__footer fx-muted" style={{ fontSize: "0.8rem" }}>
          Demo: demo_user / Demo1234! &nbsp;|&nbsp; Admin: admin / admin369!
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
