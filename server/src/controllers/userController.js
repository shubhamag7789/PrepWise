/**
 * User Controller
 * Handles profile CRUD operations for authenticated users
 */
const { body } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ── Validation Rules ────────────────────────────────────────────────────────

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  body('college').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('targetCompanies').optional().isArray().withMessage('Target companies must be an array'),
];

// ── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(ApiError.notFound('User not found'));
    return ApiResponse.ok(res, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'college', 'skills', 'targetCompanies', 'avatar'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return next(ApiError.notFound('User not found'));

    return ApiResponse.ok(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/v1/users/profile
 * @access  Private
 */
const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('accessToken');
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/users (Admin only)
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return ApiResponse.paginated(res, users, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  updateProfileValidation,
};
