import apiClient from './client.js';

/**
 * Fetch downloadable resources with optional query params (search, category, type, status)
 */
export const getDownloads = async (params = {}) => {
  const response = await apiClient.get('/downloads', { params });
  if (response.data && Array.isArray(response.data.downloads)) {
    return response.data.downloads;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data || [];
};

/**
 * Fetch primary catalog
 */
export const getPrimaryCatalog = async () => {
  const response = await apiClient.get('/downloads/primary-catalog');
  return response.data?.catalog || response.data;
};

/**
 * Track file download count in backend
 */
export const trackDownload = async (id) => {
  try {
    if (id) {
      await apiClient.post(`/downloads/${encodeURIComponent(id)}/track`);
    }
  } catch (err) {
    console.warn('Track download error:', err);
  }
};
