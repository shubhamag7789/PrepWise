/**
 * Rate Limiter Middleware
 * Configures express-rate-limit for general and auth-specific routes
 */
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,  // 15 minutes by default
  max: env.RATE_LIMIT_MAX,             // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
  },
  skip: () => env.isDev, // Skip limiting in development
});

/** Stricter limiter for auth endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  skip: () => env.isDev,
});

module.exports = { apiLimiter, authLimiter };
