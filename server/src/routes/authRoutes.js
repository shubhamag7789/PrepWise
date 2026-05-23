/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe, refreshAccessToken,
  forgotPassword, resetPassword,
  registerValidation, loginValidation,
  forgotPasswordValidation, resetPasswordValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

