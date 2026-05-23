/**
 * Route Aggregator
 * Mounts all sub-routers under /api/v1
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const interviewRoutes = require('./interviewRoutes');
const resumeRoutes = require('./resumeRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: '✅ PrepWise API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/interviews', interviewRoutes);
router.use('/resumes', resumeRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;

