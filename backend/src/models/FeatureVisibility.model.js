const mongoose = require('mongoose');

/**
 * FeatureVisibility — stores visibility rules for each application feature per role.
 * featureKey is the unique identifier used across frontend and backend.
 */
const featureVisibilitySchema = new mongoose.Schema({
  featureKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['module', 'section', 'button'],
    default: 'module',
  },
  // Visibility per role: array of { role, visible }
  roles: [{
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
    },
    visible: {
      type: Boolean,
      default: true,
    },
  }],
  updatedBy: {
    type: String,
    default: 'system',
  },
}, { timestamps: true });

module.exports = mongoose.model('FeatureVisibility', featureVisibilitySchema);
