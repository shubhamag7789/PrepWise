/**
 * Interview API Client
 * Axios functions for all interview session endpoints.
 * Uses the shared axiosInstance (handles token refresh automatically).
 */
import axiosInstance from './axiosInstance';

/* ── Session CRUD ─────────────────────────────────────────────────────────── */

/** Create a new interview session — returns session with first AI question */
export const createSession = (payload) =>
  axiosInstance.post('/interviews/sessions', payload).then((r) => r.data);

/** List user's past sessions (paginated) */
export const listSessions = (params = {}) =>
  axiosInstance.get('/interviews/sessions', { params }).then((r) => r.data);

/** Get a single session with full message history */
export const getSession = (id) =>
  axiosInstance.get(`/interviews/sessions/${id}`).then((r) => r.data);

/** Delete a session */
export const deleteSession = (id) =>
  axiosInstance.delete(`/interviews/sessions/${id}`).then((r) => r.data);

/* ── Interview Actions ────────────────────────────────────────────────────── */

/** Send a user message and receive the AI's next question */
export const sendMessage = (id, content) =>
  axiosInstance.post(`/interviews/sessions/${id}/message`, { content }).then((r) => r.data);

/** End the session and trigger AI feedback generation */
export const endSession = (id, duration) =>
  axiosInstance.post(`/interviews/sessions/${id}/end`, { duration }).then((r) => r.data);
