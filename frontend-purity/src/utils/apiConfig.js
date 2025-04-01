/**
 * API configuration utilities
 */

// Helper function to get the API base URL
export const getApiBaseUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}/api`;
  }
  
  // Default to secure if in production, otherwise use http for local dev
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://localhost:5000/api`;
};

// Helper function to get cookie by name
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}; 