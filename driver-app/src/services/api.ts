import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL - override via EXPO_PUBLIC_API_URL env var at build time
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://aytalnet-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/driver/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email, type: 'driver' }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const vehiclesApi = {
  getAvailable: () => api.get('/vehicles/available'),
  getMyAssigned: () => api.get('/drivers/my-vehicle'),
};

export const tripsApi = {
  getActiveTrip: () => api.get('/trips/my-active'),
  getMyTrips: () => api.get('/trips/my-trips'),
  start: (data: any) => api.post('/trips/start', data),
  end: (id: number, data: any) => api.put(`/trips/${id}/end`, data),
  uploadPhoto: (tripId: number, formData: FormData) =>
    api.post(`/trips/${tripId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
