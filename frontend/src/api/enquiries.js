import apiClient from './client';

export const submitEnquiry = async (enquiryData) => {
  const response = await apiClient.post('/enquiries', enquiryData);
  return response.data;
};

export const fetchEnquiries = async () => {
  const response = await apiClient.get('/enquiries');
  return response.data;
};
