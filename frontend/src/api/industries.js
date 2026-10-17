import apiClient from './client.js';

/**
 * Fetch all industries from MongoDB Atlas with optional status or search query
 */
export const getIndustries = async (params = {}) => {
  const response = await apiClient.get('/industries', { params });
  if (response.data && Array.isArray(response.data.industries)) {
    return response.data.industries;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data || [];
};

/**
 * Fetch a single industry by ID or Slug
 */
export const getIndustryById = async (id) => {
  const response = await apiClient.get(`/industries/${encodeURIComponent(id)}`);
  if (response.data && response.data.industry) {
    return {
      ...response.data.industry,
      mappedProducts: response.data.mappedProducts || [],
    };
  }
  return response.data;
};
