import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="fx-page">
        <p className="fx-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="fx-page">
        <p className="fx-muted">Admin access required.</p>
      </div>
    );
  }

  return children;
}
