/**
 * JWT Token Generation Utilities
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a short-lived access token
 * @param {string} userId - MongoDB user _id
 * @param {string} role - User role (e.g. 'user', 'admin')
 */
const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Generate a long-lived refresh token
 * @param {string} userId
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Verify and decode a token
 * @param {string} token
 * @param {boolean} isRefresh - Whether to verify against refresh secret
 */
const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? env.JWT_REFRESH_SECRET : env.JWT_SECRET;
  return jwt.verify(token, secret);
};

/**
 * Set access token cookie on response
 * @param {object} res - Express response
 * @param {string} token
 */
const setTokenCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    maxAge,
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, setTokenCookie };
