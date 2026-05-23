import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.patch('/users/profile', data),
  deleteProfile: () => axiosInstance.delete('/users/profile'),
  getAllUsers: (params) => axiosInstance.get('/users', { params }),
};
