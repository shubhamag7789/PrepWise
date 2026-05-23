/**
 * Analytics API
 */
import axiosInstance, { aiClient } from './axiosInstance';

export const getDashboardAnalytics = () =>
  axiosInstance.get('/analytics/dashboard').then((r) => r.data);

export const getFullAnalytics = () =>
  axiosInstance.get('/analytics').then((r) => r.data);

export const getRoadmap = () =>
  axiosInstance.get('/analytics/roadmap').then((r) => r.data);

export const generateRoadmap = () =>
  aiClient.post('/analytics/roadmap/generate', {}).then((r) => r.data);
