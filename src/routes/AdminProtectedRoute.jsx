import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function AdminProtectedRoute({ children }) {

  const {
    token,
    user,
  } = useAuth();


  // =============================================
  // NOT LOGGED IN
  // =============================================

  if (!token) {

    return (

      <Navigate
        to="/admin/login"
        replace
      />

    );

  }


  // =============================================
  // NOT AN ADMIN
  // =============================================

  if (
    user?.role !== "ADMIN"
  ) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  // =============================================
  // ADMIN ACCESS
  // =============================================

  return children;

}


export default AdminProtectedRoute;