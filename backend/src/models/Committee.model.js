const mongoose = require('mongoose');

const committeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  members: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 6 evaluator emails']
  },
  auditHistory: [{
    members: [String],
    updatedBy: String,
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 6;
}

module.exports = mongoose.model('Committee', committeeSchema);
