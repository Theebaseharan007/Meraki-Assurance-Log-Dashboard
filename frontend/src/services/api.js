import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// Submission API endpoints
export const submissionAPI = {
  create: (data) => api.post('/submissions', data),
  getMine: (params = {}) => api.get('/submissions/mine', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  delete: (id) => api.delete(`/submissions/${id}`),
};

// Manager API endpoints
export const managerAPI = {
  getRuns: (params) => api.get('/manager/runs', { params }),
  getTeams: () => api.get('/manager/teams'),
  getDashboard: (params = {}) => api.get('/manager/dashboard', { params }),
  getStats: (params = {}) => api.get('/manager/stats', { params }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Generic API utilities
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response?.data?.errors) {
    // Handle validation errors
    return {
      message: error.response.data.message || 'Validation failed',
      errors: error.response.data.errors,
      status: error.response.status,
    };
  }
  
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message,
      status: error.response.status,
    };
  }
  
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timeout. Please try again.',
      status: 408,
    };
  }
  
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: error.response?.status || 500,
  };
};

// Upload utilities (for future file uploads)
export const uploadAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
  },
};

export default api;
