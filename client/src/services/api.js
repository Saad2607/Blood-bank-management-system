import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';

    // Auto-logout on token expiration (HTTP 401)
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
