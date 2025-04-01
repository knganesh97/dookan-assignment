import axios from 'axios';
import authService from './auth.service';
import { getApiBaseUrl, getCookie } from '../utils/apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: needed for cookies to be sent with requests
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add CSRF token header if it exists in cookies
    const csrfToken = getCookie('csrf_access_token');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config || {};
    
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') && // Don't retry login requests
      !originalRequest.url.includes('/auth/register')  // Don't retry register requests
    ) {
      originalRequest._retry = true;
      
      try {
        const refreshSuccess = await authService.refreshToken();
        if (refreshSuccess) {
          return api(originalRequest);
        } else {
          localStorage.removeItem('user');
          window.location.href = '/#/auth/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/#/auth/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 