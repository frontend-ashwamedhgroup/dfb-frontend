import api from "./api";

/* =====================================================
   USER AUTH
===================================================== */

export const login = async (
  email,
  password
) => {
  const response =
    await api.post(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

  return response.data;
};


export const register = async (
  userData
) => {
  const response =
    await api.post(
      "/api/auth/register",
      userData
    );

  return response.data;
};


/* =====================================================
   ADMIN AUTH
===================================================== */

export const adminLogin = async (
  email,
  password
) => {
  const response =
    await api.post(
      "/api/admin/auth/login",
      {
        email,
        password,
      }
    );

  return response.data;
};


export const adminRegister = async (
  adminData
) => {
  const response =
    await api.post(
      "/api/admin/auth/register",
      adminData
    );

  return response.data;
};