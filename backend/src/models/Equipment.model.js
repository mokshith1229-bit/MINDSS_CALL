const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the equipment name'],
      trim: true,
    },
    lab: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lab',
      required: [true, 'Equipment must be associated with a Laboratory'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate equipment names within the same lab
equipmentSchema.index({ name: 1, lab: 1 }, { unique: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
