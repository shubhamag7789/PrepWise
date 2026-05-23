/**
 * Axios Instance — auth, refresh, timeouts, user-friendly errors
 */
import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '@utils/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const isAuthRoute = (url = '') => /\/auth\/(login|register|refresh)/.test(url);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!error.response) {
      const silent =
        originalRequest?._silent ||
        isAuthRoute(originalRequest?.url);
      if (!silent) {
        toast.error('Network error. Check your connection and try again.');
      }
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute(originalRequest.url)) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          const refreshToken = storage.get('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');
          refreshPromise = axios.post(
            `${baseURL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          ).finally(() => { refreshPromise = null; });
        }
        const { data } = await refreshPromise;
        const newToken = data.data.accessToken;
        storage.set('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
        storage.remove('accessToken');
        storage.remove('refreshToken');
        if (!window.location.pathname.startsWith('/login')) {
          toast.error('Session expired. Please sign in again.');
          window.location.href = '/login';
        }
      }
    }

    if (status >= 500 && !originalRequest?._silent) {
      const msg = error.response?.data?.message;
      if (msg && !msg.includes('GEMINI')) toast.error(msg);
    }

    return Promise.reject(error);
  }
);

/** Long-running AI requests */
export const aiClient = axios.create({
  baseURL,
  timeout: 120000,
  withCredentials: true,
});

aiClient.interceptors.request.use((config) => {
  const token = storage.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

export default axiosInstance;
