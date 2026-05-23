import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getMe: () => axiosInstance.get('/auth/me'),
  refreshToken: (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken }),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  resetPassword: (token, data) => axiosInstance.post(`/auth/reset-password/${token}`, data),
};

