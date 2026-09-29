import api from "./api";

// Get Visit Types for a Domain
export const getVisitTypesByDomain = async (domainId) => {
  const response = await api.get(
    `/api/domains/${domainId}/visit-types`
  );

  return response.data;
};


// Get a single Visit Type
export const getVisitTypeById = async (visitTypeId) => {
  const response = await api.get(
    `/api/visit-types/${visitTypeId}`
  );

  return response.data;
};


// Create Visit Type
export const createVisitType = async (domainId, name) => {
  const response = await api.post(
    `/api/domains/${domainId}/visit-types`,
    {
      name,
    }
  );

  return response.data;
};


// Update Visit Type
export const updateVisitType = async (visitTypeId, name) => {
  const response = await api.put(
    `/api/visit-types/${visitTypeId}`,
    {
      name,
    }
  );

  return response.data;
};


// Deactivate Visit Type
export const deactivateVisitType = async (visitTypeId) => {
  const response = await api.patch(
    `/api/visit-types/${visitTypeId}/deactivate`
  );

  return response.data;
};


// Activate Visit Type
export const activateVisitType = async (visitTypeId) => {
  const response = await api.patch(
    `/api/visit-types/${visitTypeId}/activate`
  );

  return response.data;
};


// Get Delete Information
export const getVisitTypeDeleteInfo = async (visitTypeId) => {
  const response = await api.get(
    `/api/visit-types/${visitTypeId}/delete-info`
  );

  return response.data;
};


// Permanently Delete Visit Type
export const deleteVisitType = async (visitTypeId) => {
  const response = await api.delete(
    `/api/visit-types/${visitTypeId}`
  );

  return response.data;
};