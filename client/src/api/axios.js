import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We can also extract the token interceptor logic here if preferred,
// but for now we just export the configured instance.
export default api;
