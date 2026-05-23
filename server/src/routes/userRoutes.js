/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, deleteProfile, getAllUsers,
  updateProfileValidation,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidation, validate, updateProfile);
router.delete('/profile', deleteProfile);

// Admin only
router.get('/', restrictTo('admin'), getAllUsers);

module.exports = router;
