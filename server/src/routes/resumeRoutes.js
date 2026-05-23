/**
 * Resume / ATS Analysis Routes
 */
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');
const {
  analyzeResumeUpload,
  listAnalyses,
  getLatestAnalysis,
  getAnalysis,
  deleteAnalysis,
} = require('../controllers/resumeController');

router.use(protect);

router.post('/analyze', handleUpload, analyzeResumeUpload);
router.get('/latest', getLatestAnalysis);
router.get('/', listAnalyses);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
