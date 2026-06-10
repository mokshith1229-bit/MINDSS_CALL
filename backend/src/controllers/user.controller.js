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
    const users = await User.find();
    res.status(200).json(new ApiResponse(200, { users }, 'Users retrieved successfully'));
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

// @desc    Delete user / Deactivate
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // We can soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, 'User deactivated successfully'));
  } catch (err) {
    next(err);
  }
};
