import api from "./api";


// =====================================================
// SUBMIT FORM
// =====================================================

export const submitForm = async (submissionData) => {

  const response = await api.post(
    "/api/form-submissions",
    submissionData
  );

  return response.data;
};


// =====================================================
// GET MY SUBMISSIONS
// =====================================================

export const getMySubmissions = async () => {

  const response = await api.get(
    "/api/form-submissions/my"
  );

  return response.data;
};


// =====================================================
// GET ONE SUBMISSION DETAILS
// =====================================================

export const getMySubmissionById = async (
  submissionId
) => {

  const response = await api.get(
    `/api/form-submissions/my/${submissionId}`
  );

  return response.data;
};