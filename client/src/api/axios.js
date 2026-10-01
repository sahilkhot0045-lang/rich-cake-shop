import axios from 'axios';

// Get or generate persistent guest session ID
const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('rich_cake_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('rich_cake_session_id', sessionId);
  }
  return sessionId;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token and Guest Session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rich_cake_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-session-id'] = getGuestSessionId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors ? error.response.data.errors.join(', ') : 'Network error occurred');
    return Promise.reject(new Error(message));
  }
);

export default api;
