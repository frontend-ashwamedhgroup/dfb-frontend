import api from "./api";

// =====================================================
// ADMIN LOGIN
// =====================================================

export const loginAdmin = async (email, password) => {
  const response = await api.post(
    "/api/admin/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};


// =====================================================
// ADMIN REGISTER
// =====================================================

export const registerAdmin = async (adminData) => {
  const response = await api.post(
    "/api/admin/auth/register",
    adminData
  );

  return response.data;
};