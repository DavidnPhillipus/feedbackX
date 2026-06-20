import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, username, email, password });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
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
        <p className="fx-auth__tagline">
          Join the feedback revolution — where every opinion fuels innovation
        </p>
        <GoogleSignIn />
        <div className="fx-auth__divider">OR</div>
        <form className="fx-auth__form" onSubmit={handleSubmit}>
          {error && <p className="fx-auth__error">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="fx-auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            className="fx-auth__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username (min 5 chars)"
            className="fx-auth__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={5}
            required
          />
          <input
            type="password"
            placeholder="Password (8+ chars, number, special)"
            className="fx-auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button type="submit" className="fx-btn fx-auth__btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="fx-auth__legal">
          By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
        </div>
        <p className="fx-auth__footer">
          Have an account?{' '}
          <button type="button" className="fx-auth__link" onClick={() => navigate('/Login')}>Login</button>
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
