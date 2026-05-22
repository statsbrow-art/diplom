import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const baseURL = configuredApiUrl?.trim() || '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
