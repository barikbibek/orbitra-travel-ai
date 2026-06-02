import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// this handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Access token expired — try refresh once
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/refresh' &&
      original.url !== '/auth/login'
    ) {
      original._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(original); // retry original request
      } catch {
        const publicRoutes = ['/login', '/register', '/share'];
        const isPublic = publicRoutes.some(route => window.location.pathname.startsWith(route));

        if (!isPublic) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;