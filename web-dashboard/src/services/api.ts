import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const driversApi = {
  getAll: (params?: any) => api.get('/drivers', { params }),
  getById: (id: number) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: number, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: number) => api.delete(`/drivers/${id}`),
};

export const vehiclesApi = {
  getAll: (params?: any) => api.get('/vehicles', { params }),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

export const tripsApi = {
  getAll: (params?: any) => api.get('/trips', { params }),
  getActive: () => api.get('/trips/active'),
  getById: (id: number) => api.get(`/trips/${id}`),
  cancel: (id: number) => api.post(`/trips/${id}/cancel`),
};

export const reportsApi = {
  getTrips: (params?: any) => api.get('/reports/trips', { params }),
  getSummary: () => api.get('/reports/summary'),
  export: (params?: any) => api.get('/reports/export', { params, responseType: 'blob' }),
};

export default api;
