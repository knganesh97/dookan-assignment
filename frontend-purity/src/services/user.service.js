import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const updateData = {};
      
      // Only include fields that are provided
      if (userData.name !== undefined) {
        updateData.name = userData.name;
      }
      if (userData.password !== undefined) {
        updateData.password = userData.password;
      }

      const response = await api.put('/auth/me', updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Commented out extra methods that don't exist in backend
  /*
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user settings
  getSettings: async () => {
    try {
      const response = await api.get('/users/settings');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/users/settings', settings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/account');
      return response;
    } catch (error) {
      throw error;
    }
  }
  */
};

export default userService; 