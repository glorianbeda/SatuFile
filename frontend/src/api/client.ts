import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const client: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 0, // No timeout for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CRITICAL: Remove Content-Type for FormData, File, or Blob
    // to let browser set it automatically with proper content type
    if (config.data instanceof FormData || config.data instanceof File || config.data instanceof Blob) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Routes that should NOT trigger redirect to login
      const isAuthRoute = url.includes('/login') || url.includes('/signup');
      const isProfileRoute = url.includes('/change-password') || url.includes('/me');
      const isOnLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
      
      // Don't redirect for auth routes, profile routes, or if already on login
      if (!isAuthRoute && !isProfileRoute && !isOnLoginPage) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Typed API methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    client.get(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.post(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.put(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.patch(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    client.delete(url, config).then((res) => res.data),
};

export default client;
