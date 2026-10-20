const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch blogs for admin management with filters, sorting, and pagination
 */
export async function fetchAdminBlogs(params = {}) {
  const query = new URLSearchParams({ isAdmin: 'true' });
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const res = await fetch(`${API_BASE}/blogs?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blogs: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch a single blog by MongoDB ID or slug (supports draft preview)
 */
export async function fetchBlogById(id, isPreview = false) {
  const query = isPreview ? '?isPreview=true' : '';
  const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(id)}${query}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch blog (${res.status})`);
  }
  return res.json();
}

/**
 * Create a new blog post
 */
export async function createBlogApi(blogData) {
  const res = await fetch(`${API_BASE}/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blogData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create blog post');
  }
  return data;
}

/**
 * Update an existing blog post
 */
export async function updateBlogApi(id, blogData) {
  const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blogData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update blog post');
  }
  return data;
}

/**
 * Soft delete a blog post
 */
export async function deleteBlogApi(id) {
  const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete blog post');
  }
  return data;
}

/**
 * Duplicate a blog post as draft
 */
export async function duplicateBlogApi(id) {
  const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to duplicate blog post');
  }
  return data;
}

/**
 * Execute bulk actions (publish, unpublish, archive, delete, changeCategory)
 */
export async function bulkUpdateBlogsApi(ids, action, targetCategory = '') {
  const res = await fetch(`${API_BASE}/blogs/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, action, targetCategory }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Bulk operation failed');
  }
  return data;
}

/**
 * Fetch database blog categories
 */
export async function fetchBlogCategoriesApi() {
  const res = await fetch(`${API_BASE}/blogs/categories`);
  if (!res.ok) {
    throw new Error('Failed to fetch blog categories');
  }
  return res.json();
}

/**
 * Upload an image (banner or content block)
 */
export async function uploadBlogImageApi(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload image');
  }
  return data.url;
}
