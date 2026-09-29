import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {

    // ================================================
    // SELECT TOKEN BASED ON CURRENT PORTAL
    // ================================================

    const isAdminRoute =
      window.location.pathname.startsWith("/admin");

    const token = isAdminRoute
      ? localStorage.getItem("dfb_admin_token")
      : localStorage.getItem("dfb_user_token");


    // ================================================
    // ATTACH JWT
    // ================================================

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }


    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default api;