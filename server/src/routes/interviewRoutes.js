/**
 * Interview Routes
 * All routes protected by JWT auth middleware.
 */
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createSession,
  listSessions,
  getSession,
  sendMessage,
  endSession,
  deleteSession,
} = require('../controllers/interviewController');

// Apply auth middleware to all interview routes
router.use(protect);

// ── Session CRUD ────────────────────────────────────────────────────────────
router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);

// ── Interview Actions ───────────────────────────────────────────────────────
router.post('/sessions/:id/message', sendMessage);
router.post('/sessions/:id/end', endSession);

module.exports = router;
