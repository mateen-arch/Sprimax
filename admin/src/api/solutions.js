const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all solutions for admin list
 */
export async function fetchAdminSolutions(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/solutions${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch solutions: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch single solution by ID or slug
 */
export async function fetchAdminSolutionById(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch solution (${res.status})`);
  }
  return res.json();
}

/**
 * Create new solution
 */
export async function createAdminSolutionApi(solutionData) {
  const res = await fetch(`${API_BASE}/solutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solutionData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create solution');
  }
  return data;
}

/**
 * Update existing solution
 */
export async function updateAdminSolutionApi(id, solutionData) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solutionData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update solution');
  }
  return data;
}

/**
 * Delete solution
 */
export async function deleteAdminSolutionApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete solution');
  }
  return data;
}

/**
 * Duplicate solution as draft
 */
export async function duplicateAdminSolutionApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to duplicate solution');
  }
  return data;
}

/**
 * Publish solution
 */
export async function publishSolutionApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to publish solution');
  }
  return data;
}

/**
 * Unpublish solution
 */
export async function unpublishSolutionApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}/unpublish`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to unpublish solution');
  }
  return data;
}

/**
 * Restore version snapshot
 */
export async function restoreSolutionVersionApi(id, versionNumber) {
  const res = await fetch(
    `${API_BASE}/solutions/${encodeURIComponent(id)}/restore-version/${encodeURIComponent(versionNumber)}`,
    { method: 'POST' }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to restore version');
  }
  return data;
}

/**
 * Generate 7-day shareable preview token
 */
export async function generatePreviewTokenApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}/preview-token`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to generate preview token');
  }
  return data;
}

/**
 * Revoke preview token
 */
export async function revokePreviewTokenApi(id) {
  const res = await fetch(`${API_BASE}/solutions/${encodeURIComponent(id)}/preview-token`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to revoke preview token');
  }
  return data;
}

/**
 * Public: Fetch published solution by slug
 */
export async function fetchPublicSolutionBySlug(slug) {
  const res = await fetch(`${API_BASE}/solutions/public/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Solution page not found (${res.status})`);
  }
  return res.json();
}

/**
 * Public: Fetch draft solution by preview token
 */
export async function fetchSolutionByPreviewToken(token) {
  const res = await fetch(`${API_BASE}/solutions/preview/${encodeURIComponent(token)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Preview token invalid (${res.status})`);
  }
  return res.json();
}
