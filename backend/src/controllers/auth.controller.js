const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const jwt = require('jsonwebtoken');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  res.status(statusCode).json(new ApiResponse(statusCode, { token, refreshToken }, message));
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ApiError(400, 'Email already in use'));
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      // The first user created should be SUPER_ADMIN, otherwise EMPLOYEE.
      // This is a common pattern, but you might want a manual seeding process instead.
    });

    const refreshToken = user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    if (!user.isActive) {
      return next(new ApiError(401, 'Account is deactivated'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const refreshToken = user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return next(new ApiError(401, 'Invalid refresh token'));
    }

    const newToken = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, { token: newToken, refreshToken: newRefreshToken }, 'Token refreshed'));
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired refresh token'));
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+refreshToken');
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
};
