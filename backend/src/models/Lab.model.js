const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a laboratory name'],
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide the laboratory location'],
      trim: true,
    },
    labManager: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Lab Manager must be assigned'],
    },
    workingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00', // HH:mm format
      },
      end: {
        type: String,
        default: '17:00',
      },
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

module.exports = mongoose.model('Lab', labSchema);
