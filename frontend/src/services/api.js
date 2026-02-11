import axios from 'axios';

const API_BASE_URL = '/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (data) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      // Ensure we have valid data before storing
      if (response.data?.access_token && response.data?.user) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      // Ensure we have valid data before storing
      if (response.data?.access_token && response.data?.user) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      // Safe JSON parsing to avoid "undefined is not valid JSON" error
      if (user && user !== 'undefined') {
        return JSON.parse(user);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
    }
    return null;
  },
};

// Scan APIs
export const scanAPI = {
  scanImage: async (file, tamilSupport = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tamil_support', tamilSupport);

    const response = await apiClient.post('/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  smartScan: async (file, tamilSupport = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tamil_support', tamilSupport);

    const response = await apiClient.post('/smart-scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  batchScan: async (files, tamilSupport = false) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('tamil_support', tamilSupport);

    const response = await apiClient.post('/batch-scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Audit APIs
export const auditAPI = {
  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  deleteAuditLog: async (id) => {
    const response = await apiClient.delete(`/audit-logs/${id}`);
    return response.data;
  },
};

export default apiClient;
