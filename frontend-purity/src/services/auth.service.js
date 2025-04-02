import api from './api';
import axios from 'axios';
import { getApiBaseUrl, getCookie } from '../utils/apiConfig';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      // We're NOT hashing the password client-side for login
      // The backend expects raw password for proper verification
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password // Send raw password
      });
      
      // Store user data in localStorage with expiration (7 days)
      if (response.user) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        const userData = {
          user: response.user,
          expiresAt: expiresAt.getTime()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      // We're NOT hashing the password client-side for registration
      // The backend will handle password hashing
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password, // Send raw password
        name: userData.name || ''
      });
      
      // Store user data in localStorage with expiration (7 days)
      if (response.user) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        const userData = {
          user: response.user,
          expiresAt: expiresAt.getTime()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      window.location.href = '/#/auth/signin';
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove user from localStorage and redirect, even if API call fails
      localStorage.removeItem('user');
      window.location.href = '/#/auth/signin';
    }
  },

  // Get current user from localStorage, or fetch from API if not available
  getCurrentUser: async () => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      
      // Check if data has expired
      if (userData.expiresAt && userData.expiresAt > Date.now()) {
        return userData.user;
      } else {
        // If expired, remove from localStorage
        localStorage.removeItem('user');
      }
    }
    
    // If no valid user in localStorage, try to fetch from API
    try {
      const response = await api.get('/auth/me');
      if (response.email) {
        // Store with expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        
        const userData = {
          user: response,
          expiresAt: expiresAt.getTime()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        return response;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Synchronous method to check if user is authenticated based on localStorage
  isAuthenticated: () => {
    const storedUserData = localStorage.getItem('user');
    if (!storedUserData) return false;
    
    try {
      const userData = JSON.parse(storedUserData);
      // Check if data has expired
      if (userData.expiresAt && userData.expiresAt > Date.now()) {
        return true;
      } else {
        // If expired, remove from localStorage
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  // Refresh the access token using the refresh token cookie
  refreshToken: async () => {
    try {
      const csrfRefreshToken = getCookie('csrf_refresh_token');
  
      if (!csrfRefreshToken) {
        console.error('No CSRF refresh token found');
        return false;
      }
  
      // Use direct axios call to avoid circular dependency with api instance
      await axios({
        method: 'post',
        url: `${getApiBaseUrl()}/auth/refresh`,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfRefreshToken
        }
      });
      
      // Update expiration date when token is refreshed
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        userData.expiresAt = expiresAt.getTime();
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed');
      return false;
    }
  },

  // Commented out extra methods that don't exist in backend
  /*
  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: token,
        password: password
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
  */
};

export default authService; 