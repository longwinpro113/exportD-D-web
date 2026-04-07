import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create an Axios instance with base configuration
const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure Request Interceptors
axiosClient.interceptors.request.use(async (config) => {
  // Example: Attach Authentication Token
  // const token = localStorage.getItem('access_token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`; // Add Bearer token to headers
  // }
  return config;
});

// Configure Response Interceptors
axiosClient.interceptors.response.use(
  (response) => {
    // Return direct data object to simplify access in components
    if (response && response.data) {
      return response.data;
    }
    return response;
  }, 
  (error) => {
    // Global error handler
    console.error("API error response: ", error.response || error);
    
    // Example: Redirect to login if token expired
    // if (error.response?.status === 401) window.location.href = '/login';
    
    throw error;
  }
);

export default axiosClient;
