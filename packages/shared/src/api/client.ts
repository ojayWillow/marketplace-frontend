import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Token will be set by the auth module
    // This is a placeholder for the token injection logic
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Trigger logout or token refresh
      console.log('Unauthorized - need to handle auth refresh');
    }
    return Promise.reject(error);
  }
);
