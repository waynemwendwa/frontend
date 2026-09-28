import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  loginJSON: async (email, password) => {
    const response = await api.post('/api/auth/login-json', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/api/admin/students', { params });
    return response.data;
  },

  getStudentDetail: async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}`);
    return response.data;
  },

  // Primary name used in StudentDetail component
  getStudentWeeklyMetrics: async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/weekly-metrics`);
    return response.data;
  },

  // Alias for backwards compatibility
  getStudentMetrics: async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/weekly-metrics`);
    return response.data;
  },

  getStudentInterventions: async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/interventions`);
    return response.data;
  },

  createIntervention: async (data) => {
    const response = await api.post('/api/admin/interventions', data);
    return response.data;
  },

  getInterventionTemplates: async () => {
    const response = await api.get('/api/admin/intervention-templates');
    return response.data;
  },

  recalculateRisk: async (studentId) => {
    const response = await api.post(`/api/admin/students/${studentId}/recalculate-risk`);
    return response.data;
  },
};

// ─── Student API ─────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile: async () => {
    const response = await api.get('/api/student/profile');
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/api/student/progress');
    return response.data;
  },

  getResources: async () => {
    const response = await api.get('/api/student/resources');
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/api/student/notifications');
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.post(`/api/student/notifications/${notificationId}/mark-read`);
    return response.data;
  },

  dismissNotification: async (notificationId) => {
    const response = await api.post(`/api/student/notifications/${notificationId}/dismiss`);
    return response.data;
  },
};

export default api;