const API_BASE = 'http://localhost:5000/api';

/**
 * Fetch products with optional query parameters (search, category, status, etc.)
 */
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/products${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch single product by ID or SKU
 */
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Create a new product
 */
export async function createProductApi(productData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create product');
  }
  return data;
}

/**
 * Update existing product by ID or SKU
 */
export async function updateProductApi(id, productData) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update product');
  }
  return data;
}

/**
 * Delete product by ID or SKU
 */
export async function deleteProductApi(id) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete product');
  }
  return data;
}

/**
 * Upload an image file to the backend
 */
export async function uploadImageApi(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to upload image file');
  }
  return data;
}

/**
 * Fetch categories with product counts
 */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Create a new category
 */
export async function createCategoryApi(categoryData) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create category');
  }
  return data;
}

/**
 * Update an existing category
 */
export async function updateCategoryApi(id, categoryData) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update category');
  }
  return data;
}

/**
 * Delete a category
 */
export async function deleteCategoryApi(id) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete category');
  }
  return data;
}

/**
 * Fetch all enquiries with optional status or search query
 */
export async function fetchEnquiries(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/enquiries${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch enquiries: ${res.statusText}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result : (result.data || []);
}

/**
 * Create a new enquiry
 */
export async function createEnquiryApi(enquiryData) {
  const res = await fetch(`${API_BASE}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create enquiry');
  }
  return data;
}

/**
 * Update enquiry status or details
 */
export async function updateEnquiryApi(id, enquiryData) {
  const res = await fetch(`${API_BASE}/enquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update enquiry');
  }
  return data;
}

/**
 * Delete an enquiry
 */
export async function deleteEnquiryApi(id) {
  const res = await fetch(`${API_BASE}/enquiries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete enquiry');
  }
  return data;
}

/**
 * Fetch banners
 */
export async function fetchBanners() {
  try {
    const res = await fetch(`${API_BASE}/banners`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.banners || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn('Failed to fetch banners:', err);
    return [];
  }
}

/**
 * Fetch downloads
 */
export async function fetchDownloads() {
  try {
    const res = await fetch(`${API_BASE}/downloads`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.downloads || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn('Failed to fetch downloads:', err);
    return [];
  }
}
