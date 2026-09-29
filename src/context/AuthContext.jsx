import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const isAdminRoute = () => {
  return window.location.pathname.startsWith("/admin");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storageKey = isAdminRoute()
      ? "dfb_admin"
      : "dfb_user";

    const savedUser = localStorage.getItem(storageKey);

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const storageKey = isAdminRoute()
      ? "dfb_admin_token"
      : "dfb_user_token";

    return localStorage.getItem(storageKey);
  });

  // =====================================================
  // USER LOGIN
  // =====================================================

  const loginUser = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem(
      "dfb_user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "dfb_user_token",
      jwtToken
    );
  };

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const loginAdmin = (adminData, jwtToken) => {
    setUser(adminData);
    setToken(jwtToken);

    localStorage.setItem(
      "dfb_admin",
      JSON.stringify(adminData)
    );

    localStorage.setItem(
      "dfb_admin_token",
      jwtToken
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    const adminRoute = isAdminRoute();

    setUser(null);
    setToken(null);

    if (adminRoute) {
      localStorage.removeItem("dfb_admin");
      localStorage.removeItem("dfb_admin_token");
    } else {
      localStorage.removeItem("dfb_user");
      localStorage.removeItem("dfb_user_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginUser,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}