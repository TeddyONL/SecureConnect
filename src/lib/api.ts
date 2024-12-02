import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Replace with your actual API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API endpoints
export const adminApi = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (userId: string, role: string) => 
    api.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  
  // Businesses
  getBusinesses: (params?: any) => api.get('/admin/businesses', { params }),
  verifyBusiness: (businessId: string) => 
    api.post(`/admin/businesses/${businessId}/verify`),
  deleteBusiness: (businessId: string) => 
    api.delete(`/admin/businesses/${businessId}`),
  
  // Reviews
  getReviews: (params?: any) => api.get('/admin/reviews', { params }),
  approveReview: (reviewId: string) => 
    api.post(`/admin/reviews/${reviewId}/approve`),
  rejectReview: (reviewId: string) => 
    api.post(`/admin/reviews/${reviewId}/reject`),
  
  // Reports
  getReports: (params?: any) => api.get('/admin/reports', { params }),
  handleReport: (reportId: string, action: string) => 
    api.post(`/admin/reports/${reportId}/handle`, { action }),
  
  // Activity Logs
  getActivityLogs: (params?: any) => api.get('/admin/activity-logs', { params }),
};

export default api;