import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For mobile testing, replace 'localhost' with your computer's IP address
// Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
const API_URL = 'http://192.168.1.100:3001/api'; // Change to your IP for mobile testing

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
};

export const vehiclesApi = {
  getAvailable: () => api.get('/vehicles/available'),
};

export const tripsApi = {
  getActiveTrip: () => api.get('/trips/my-active'),
  start: (data: any) => api.post('/trips/start', data),
  end: (id: number, data: any) => api.put(`/trips/${id}/end`, data),
  uploadPhoto: (tripId: number, formData: FormData) =>
    api.post(`/trips/${tripId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
