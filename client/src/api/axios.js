import axios from 'axios';

const api = axios.create({
    // In dev: Vite proxies /api → localhost:5000 (via vite.config.js)
    // In prod: VITE_API_URL should be set to your Render backend URL
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request automatically
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

// Handle 401 Unauthorized — clear stale token and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

