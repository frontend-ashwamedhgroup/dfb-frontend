import api from "./api";

export const getAllDomains = async () => {
    const response = await api.get("/api/domains");
    return response.data;
};

export const getDomainById = async (domainId) => {
    const response = await api.get(`/api/domains/${domainId}`);
    return response.data;
};

export const createDomain = async (domainData) => {
    const response = await api.post("/api/domains", domainData);
    return response.data;
};

export const updateDomain = async (domainId, domainData) => {
    const response = await api.put(`/api/domains/${domainId}`, domainData);
    return response.data;
};

export const deactivateDomain = async (domainId) => {
    const response = await api.patch(
        `/api/domains/${domainId}/deactivate`
    );
    return response.data;
};

export const activateDomain = async (domainId) => {
    const response = await api.patch(
        `/api/domains/${domainId}/activate`
    );
    return response.data;
};