const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchCertifications(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const url = `${API_BASE}/certifications${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch certifications: ${res.statusText}`);
  }
  return res.json();
}

export async function createCertificationApi(certData) {
  const res = await fetch(`${API_BASE}/certifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create certification');
  }
  return data;
}

export async function updateCertificationApi(id, certData) {
  const res = await fetch(`${API_BASE}/certifications/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update certification');
  }
  return data;
}

export async function deleteCertificationApi(id) {
  const res = await fetch(`${API_BASE}/certifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete certification');
  }
  return data;
}
