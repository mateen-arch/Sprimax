import apiClient from './client.js';

export const getCertifications = async (params = {}) => {
  try {
    const response = await apiClient.get('/certifications', { params });
    return response.data;
  } catch (error) {
    console.warn('[API] Failed to fetch certifications:', error.message);
    throw error;
  }
};

export const getCertificationById = async (id) => {
  try {
    const response = await apiClient.get(`/certifications/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.warn('[API] Failed to fetch certification by ID:', error.message);
    throw error;
  }
};
