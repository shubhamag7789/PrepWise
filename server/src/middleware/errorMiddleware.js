/**
 * Global Error Handling Middleware
 * Handles 404s and all thrown/forwarded errors
 */
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * 404 Not Found handler — catch all unmatched routes
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler — must have 4 parameters (err, req, res, next)
 */
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if not an ApiError
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose Validation Error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  // ── MongoDB Duplicate Key Error ────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  }

  // ── Log in development ─────────────────────────────────────────────────
  if (env.isDev) {
    const isExpectedAuthFailure =
      statusCode === 401 &&
      /\/auth\/(login|register)/.test(req.originalUrl);
    if (isExpectedAuthFailure) {
      console.warn(`[${req.method}] ${req.originalUrl} → ${statusCode} ${message}`);
    } else {
      console.error(`\n❌ [${req.method}] ${req.originalUrl}`);
      console.error('Status:', statusCode);
      console.error('Message:', message);
      console.error('Stack:', err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(env.isDev && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
