import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignIn() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/home";

  const handleSuccess = async (response) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <>
        <button type="button" className="fx-auth__google" disabled>
          <FcGoogle size={20} aria-hidden="true" />
          Continue with Google
        </button>
        <p className="fx-auth__error" style={{ fontSize: "0.8rem" }}>
          Add VITE_GOOGLE_CLIENT_ID to client/.env to enable Google sign-in.
        </p>
      </>
    );
  }

  return (
    <div className="fx-auth__google-wrap">
      {loading ? (
        <button type="button" className="fx-auth__google" disabled>
          <FcGoogle size={20} aria-hidden="true" />
          Signing in with Google...
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in was cancelled or failed")}
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width="368"
          logo_alignment="left"
        />
      )}
      {error && <p className="fx-auth__error">{error}</p>}
    </div>
  );
}
