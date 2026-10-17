import apiClient from './client.js';

/**
 * Fetch products with optional filtering, search, and pagination
 */
export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by ID or SKU
 */
export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${encodeURIComponent(id)}`);
  return response.data;
};

/**
 * Fetch related products by product ID or SKU
 */
export const getRelatedProducts = async (id) => {
  const response = await apiClient.get(`/products/${encodeURIComponent(id)}/related`);
  return response.data;
};

/**
 * Fetch all categories with live aggregated product counts
 */
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};
