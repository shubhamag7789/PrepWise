/**
 * Resume / ATS Analysis API
 */
import axiosInstance, { aiClient } from './axiosInstance';
import { unwrapApi } from '@utils/apiHelpers';

export const analyzeResume = (formData) =>
  aiClient.post('/resumes/analyze', formData).then((r) => r.data);

export const listResumeAnalyses = (params = {}) =>
  axiosInstance.get('/resumes', { params }).then((r) => {
    const payload = unwrapApi(r.data);
    return Array.isArray(payload) ? payload : [];
  });

export const getLatestResumeAnalysis = () =>
  axiosInstance.get('/resumes/latest').then((r) => unwrapApi(r.data));

export const getResumeAnalysis = (id) =>
  axiosInstance.get(`/resumes/${id}`).then((r) => unwrapApi(r.data));

export const deleteResumeAnalysis = (id) =>
  axiosInstance.delete(`/resumes/${id}`).then((r) => r.data);
