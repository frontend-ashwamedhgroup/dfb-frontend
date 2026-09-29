import api from "./api";

// =========================================================
// GET ALL ADMIN SUBMISSIONS
// =========================================================

export const getAllAdminSubmissions = async () => {
  const response = await api.get("/api/admin/form-submissions");
  return response.data;
};


// =========================================================
// GET ADMIN SUBMISSION BY ID
// =========================================================

export const getAdminSubmissionById = async (submissionId) => {
  const response = await api.get(
    `/api/admin/form-submissions/${submissionId}`
  );

  return response.data;
};