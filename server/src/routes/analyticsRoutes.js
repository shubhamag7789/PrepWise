/**
 * Analytics Routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAnalytics,
  generateRoadmap,
  getRoadmap,
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/', getAnalytics);
router.get('/roadmap', getRoadmap);
router.post('/roadmap/generate', generateRoadmap);

module.exports = router;
