import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { token, user } = useAuth();

  // Not logged in
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not ADMIN
  if (user?.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  // ADMIN
  return children;
}

export default AdminRoute;