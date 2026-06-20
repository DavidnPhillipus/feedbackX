import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fx-auth" style={{ minHeight: "100vh", alignItems: "center" }}>
        <p className="fx-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fx-auth" style={{ minHeight: "100vh", alignItems: "center" }}>
        <p className="fx-muted">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
