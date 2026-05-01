import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, role, loading } = useAuth();

  // 1. Prevent premature redirect while auth is loading
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking authentication...
      </div>
    );
  }

  // 2. Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role mismatch
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;