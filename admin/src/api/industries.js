const API_BASE = 'http://localhost:5000/api';

/**
 * Fetch industries from MongoDB Atlas with optional status or search query
 */
export async function fetchIndustries(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/industries${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch industries: ${res.statusText}`);
  }
  const result = await res.json();
  if (result && Array.isArray(result.industries)) {
    return result.industries;
  }
  if (Array.isArray(result)) {
    return result;
  }
  return result?.data || [];
}

/**
 * Fetch a single industry by ID or Slug
 */
export async function fetchIndustryById(id) {
  const res = await fetch(`${API_BASE}/industries/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch industry: ${res.statusText}`);
  }
  const result = await res.json();
  return result?.industry || result;
}

/**
 * Create a new industry in MongoDB
 */
export async function createIndustryApi(industryData) {
  const res = await fetch(`${API_BASE}/industries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(industryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create industry');
  }
  return data?.industry || data;
}

/**
 * Update existing industry in MongoDB
 */
export async function updateIndustryApi(id, industryData) {
  const res = await fetch(`${API_BASE}/industries/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(industryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update industry');
  }
  return data?.industry || data;
}

/**
 * Delete an industry from MongoDB
 */
export async function deleteIndustryApi(id) {
  const res = await fetch(`${API_BASE}/industries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete industry');
  }
  return data;
}

/**
 * Fetch all project requirements submitted from solutions pages
 */
export async function fetchProjectRequirements(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/project-requirements${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch project requirements: ${res.statusText}`);
  }
  const result = await res.json();
  return result?.requirements || [];
}

/**
 * Update project requirement status or admin notes
 */
export async function updateProjectRequirementApi(id, data) {
  const res = await fetch(`${API_BASE}/project-requirements/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to update project requirement');
  }
  return result?.requirement || result;
}

/**
 * Delete a project requirement
 */
export async function deleteProjectRequirementApi(id) {
  const res = await fetch(`${API_BASE}/project-requirements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to delete project requirement');
  }
  return result;
}
