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

const FeatureVisibility = require('../models/FeatureVisibility.model');

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // DEVELOPER has full access everywhere
    if (req.user.role === 'DEVELOPER') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};

// Check if a specific feature is dynamically enabled for the user's role
const checkFeatureAccess = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Not authorized'));
      }
      
      // DEVELOPER is immune to dynamic visibility restrictions
      if (req.user.role === 'DEVELOPER') {
        return next();
      }

      const feature = await FeatureVisibility.findOne({ featureKey }).lean();
      
      // If feature isn't registered in DB, fail open (allow access)
      if (!feature) {
        return next();
      }

      const roleEntry = feature.roles.find(r => r.role === req.user.role);
      
      // If the role is explicitly marked as visible=false, deny access
      if (roleEntry && roleEntry.visible === false) {
        return next(new ApiError(403, `Access to feature '${feature.label || featureKey}' is disabled for your role.`));
      }

      // Otherwise, allow
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { protect, authorize, checkFeatureAccess };
