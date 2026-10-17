const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all downloads with optional filters
 */
export async function fetchDownloads(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/downloads${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch downloads: ${res.statusText}`);
  }
  const result = await res.json();
  return result?.downloads || [];
}

/**
 * Fetch a single download resource by ID
 */
export async function fetchDownloadById(id) {
  const res = await fetch(`${API_BASE}/downloads/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch download resource: ${res.statusText}`);
  }
  const result = await res.json();
  return result?.resource || result;
}

/**
 * Create a new download resource in MongoDB
 */
export async function createDownloadApi(data) {
  const res = await fetch(`${API_BASE}/downloads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to create download resource');
  }
  return result?.resource || result;
}

/**
 * Update an existing download resource in MongoDB
 */
export async function updateDownloadApi(id, data) {
  const res = await fetch(`${API_BASE}/downloads/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to update download resource');
  }
  return result?.resource || result;
}

/**
 * Delete a download resource from MongoDB
 */
export async function deleteDownloadApi(id) {
  const res = await fetch(`${API_BASE}/downloads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to delete download resource');
  }
  return result;
}
