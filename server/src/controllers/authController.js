/**
 * Auth Controller
 * Handles: register, login, logout, getMe, refreshToken, forgotPassword, resetPassword
 */
const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateAccessToken, generateRefreshToken, verifyToken, setTokenCookie } = require('../utils/generateToken');

// ── Validation Rules ────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and a number'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and a number'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

// ── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, accessToken);

    return ApiResponse.created(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats,
      },
      accessToken,
    }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Select password explicitly (it's select: false in schema)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, accessToken);

    return ApiResponse.ok(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats,
      },
      accessToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.clearCookie('accessToken');
    return ApiResponse.ok(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(ApiError.notFound('User not found'));
    return ApiResponse.ok(res, { user }, 'User fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @access  Public (uses refresh token)
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) return next(ApiError.unauthorized('Refresh token missing'));

    const decoded = verifyToken(token, true);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return next(ApiError.unauthorized('Invalid or expired refresh token'));
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    setTokenCookie(res, newAccessToken);

    return ApiResponse.ok(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return 200 to avoid user enumeration attacks
    if (!user) {
      return ApiResponse.ok(res, null, 'If that email exists, a reset link has been sent.');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // ── Production: send email with resetToken embedded in a link ──────────
    // In production, replace this block with a nodemailer/sendgrid call:
    // await sendEmail({ to: user.email, subject: 'Reset your PrepWise password',
    //   html: `<a href="${CLIENT_URL}/reset-password/${resetToken}">Reset</a>` });
    // ───────────────────────────────────────────────────────────────────────

    return ApiResponse.ok(res, {
      message: 'Reset token generated (dev mode — in production this would be emailed)',
      resetToken,          // <── Remove this in production; send via email instead
      expiresIn: '10 minutes',
    }, 'Password reset token generated');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    // Hash the raw token from the URL to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return next(ApiError.badRequest('Reset token is invalid or has expired. Please request a new one.'));
    }

    // Update password — pre-save hook will hash it
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Issue fresh tokens so user is logged in immediately after reset
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, accessToken);

    return ApiResponse.ok(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    }, 'Password reset successful. You are now logged in.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
