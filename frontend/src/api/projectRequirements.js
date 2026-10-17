import apiClient from './client.js';

/**
 * Submit client project requirements for an industrial sector
 */
export const submitProjectRequirements = async (requirementsData) => {
  const response = await apiClient.post('/project-requirements', requirementsData);
  return response.data;
};

/**
 * Fetch project requirements (optional user tracking by reference)
 */
export const getProjectRequirementByRef = async (referenceNumber) => {
  const response = await apiClient.get(`/project-requirements/${encodeURIComponent(referenceNumber)}`);
  return response.data;
};
