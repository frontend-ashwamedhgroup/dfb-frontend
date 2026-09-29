import api from "./api";


// =====================================================
// GET FORM FIELDS BY VISIT TYPE
// =====================================================

export const getFormFieldsByVisitType = async (
  visitTypeId
) => {

  const response = await api.get(
    `/api/form-fields/visit-type/${visitTypeId}`,
    {
      params: {
        formId: Number(visitTypeId),
      },
    }
  );

  return response.data;
};