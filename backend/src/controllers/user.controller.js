const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get current logged in user
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { users }, 'Users retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new user (admin-created, no email verification needed)
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new ApiError(409, 'A user with this email already exists'));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      department: department || 'General',
    });

    // Strip sensitive fields from response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json(new ApiResponse(201, { user: userData }, 'User created successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json(new ApiResponse(200, { user }, 'User role updated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate user (soft delete)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, 'User deactivated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Reactivate a deactivated user
// @route   PATCH /api/v1/users/:id/reactivate
// @access  Private/Admin
exports.reactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.isActive = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, 'User reactivated successfully'));
  } catch (err) {
    next(err);
  }
};
