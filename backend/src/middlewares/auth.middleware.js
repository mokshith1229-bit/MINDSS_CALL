const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ApiError(401, 'The user belonging to this token does no longer exist.'));
    }

    if (!req.user.isActive) {
      return next(new ApiError(401, 'This user account has been deactivated.'));
    }

    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
