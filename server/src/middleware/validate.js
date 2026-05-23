/**
 * Request Validation Middleware
 * Wraps express-validator's validationResult for clean error responses
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware that checks the result of express-validator rules.
 * Place this after your validation rule arrays in a route.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }
  next();
};

module.exports = validate;
