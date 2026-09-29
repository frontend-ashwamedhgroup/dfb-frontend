import api from "./api";


// =========================================================
// FORMS
// =========================================================

export const getAllForms = async () => {

  const response =
    await api.get("/api/forms");

  return response.data;
};


// =========================================================
// GET FORM BY ID
// =========================================================

export const getFormById = async (formId) => {

  const response =
    await api.get(
      `/api/forms/${formId}`
    );

  return response.data;
};


// =========================================================
// CREATE FORM
// =========================================================

export const createForm = async (formData) => {

  const response =
    await api.post(
      "/api/forms",
      formData
    );

  return response.data;
};


// =========================================================
// UPDATE FORM
// =========================================================

export const updateForm = async (
  formId,
  formData
) => {

  const response =
    await api.put(
      `/api/forms/${formId}`,
      formData
    );

  return response.data;
};


// =========================================================
// DELETE FORM
// =========================================================

export const deleteForm = async (
  formId
) => {

  const response =
    await api.delete(
      `/api/forms/${formId}`
    );

  return response.data;
};


// =========================================================
// DEACTIVATE FORM
// =========================================================

export const deactivateForm = async (
  formId
) => {

  const response =
    await api.patch(
      `/api/forms/${formId}/deactivate`
    );

  return response.data;
};


// =========================================================
// ACTIVATE FORM
// =========================================================

export const activateForm = async (
  formId
) => {

  const response =
    await api.patch(
      `/api/forms/${formId}/activate`
    );

  return response.data;
};


// =========================================================
// FORM FIELDS - ADMIN BUILDER
// =========================================================

export const getFormFieldsByForm = async (
  formId
) => {

  const response =
    await api.get(
      `/api/forms/${formId}/fields`
    );

  return response.data;
};


// =========================================================
// CREATE FORM FIELD
// =========================================================

export const createFormField = async (
  formId,
  fieldData
) => {

  const response =
    await api.post(
      `/api/forms/${formId}/fields`,
      fieldData
    );

  return response.data;
};


// =========================================================
// UPDATE FORM FIELD
// =========================================================

export const updateFormField = async (
  fieldId,
  fieldData
) => {

  const response =
    await api.put(
      `/api/form-fields/${fieldId}`,
      fieldData
    );

  return response.data;
};


// =========================================================
// DELETE FORM FIELD
// =========================================================

export const deleteFormField = async (
  fieldId
) => {

  const response =
    await api.delete(
      `/api/form-fields/${fieldId}`
    );

  return response.data;
};


// =========================================================
// RUNTIME DYNAMIC FORM
// =========================================================

export const getFormFieldsByVisitType =
  async (visitTypeId) => {

    const response =
      await api.get(
        `/api/form-fields/visit-type/${visitTypeId}`
      );

    return response.data;
  };