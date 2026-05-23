/**
 * Authentication Middleware
 * - protect: Verifies JWT, attaches req.user
 * - restrictTo: Role-based access control guard
 */
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

/**
 * Protect middleware — validates Bearer token from Authorization header
 * Falls back to cookie-based token for web clients
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HTTP-only cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Access token is missing. Please login.'));
    }

    // 3. Verify token
    const decoded = verifyToken(token);

    // 4. Fetch fresh user record (ensures revoked tokens are caught)
    const currentUser = await User.findById(decoded.id).select('+refreshToken');
    if (!currentUser) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    // 5. Attach user to request context
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token. Please login again.'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired. Please login again.'));
    }
    next(err);
  }
};

/**
 * Role guard — restrict access to specific roles
 * Must be used AFTER protect middleware
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
