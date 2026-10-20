const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all admin jobs with optional filters (search, status, department, location, type, page, limit)
 */
export async function fetchAdminJobs(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/careers/admin/jobs${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch single job for admin editor
 */
export async function fetchAdminJobById(id) {
  const res = await fetch(`${API_BASE}/careers/admin/jobs/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch job details: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Create new job
 */
export async function createAdminJobApi(jobData) {
  const res = await fetch(`${API_BASE}/careers/admin/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create job');
  }
  return data;
}

/**
 * Update existing job
 */
export async function updateAdminJobApi(id, jobData) {
  const res = await fetch(`${API_BASE}/careers/admin/jobs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update job');
  }
  return data;
}

/**
 * Delete / archive job
 */
export async function deleteAdminJobApi(id) {
  const res = await fetch(`${API_BASE}/careers/admin/jobs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete job');
  }
  return data;
}

/**
 * Duplicate job as Draft
 */
export async function duplicateAdminJobApi(id) {
  const res = await fetch(`${API_BASE}/careers/admin/jobs/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to duplicate job');
  }
  return data;
}

/**
 * Fetch applications list
 */
export async function fetchAdminApplications(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/careers/admin/applications${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch applications: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch application details
 */
export async function fetchAdminApplicationById(id) {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch application details: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update application pipeline status
 */
export async function updateApplicationStatusApi(id, status, note = '') {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update status');
  }
  return data;
}

/**
 * Update candidate star rating
 */
export async function updateApplicationRatingApi(id, rating) {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update rating');
  }
  return data;
}

/**
 * Add internal team note
 */
export async function addApplicationNoteApi(id, content, author = 'Technical Lead', authorRole = 'Reviewer') {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, author, authorRole }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to add note');
  }
  return data;
}

/**
 * Schedule candidate interview
 */
export async function scheduleApplicationInterviewApi(id, interviewData) {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(interviewData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to schedule interview');
  }
  return data;
}

/**
 * Delete / anonymize candidate application
 */
export async function deleteApplicationApi(id) {
  const res = await fetch(`${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete application');
  }
  return data;
}

/**
 * Get Careers global settings
 */
export async function fetchAdminCareersSettings() {
  const res = await fetch(`${API_BASE}/careers/admin/settings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch careers settings: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update Careers global settings
 */
export async function updateAdminCareersSettingsApi(settingsData) {
  const res = await fetch(`${API_BASE}/careers/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update careers settings');
  }
  return data;
}

/**
 * CSV Export download URL
 */
export function getExportApplicationsCsvUrl() {
  return `${API_BASE}/careers/admin/export`;
}

/**
 * Admin download application receipt PDF URL
 */
export function getAdminApplicationReceiptUrl(id) {
  return `${API_BASE}/careers/admin/applications/${encodeURIComponent(id)}/receipt`;
}
