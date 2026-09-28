const mongoose = require('mongoose');

const testScheduleSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Submission',
      required: [true, 'A test schedule must belong to a project'],
    },
    phase: {
      type: String,
      required: [true, 'Please specify the project phase'],
    },
    testName: {
      type: String,
      required: [true, 'Please specify the test name'],
    },
    testObjective: {
      type: String,
    },
    lab: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lab',
      required: [true, 'A laboratory is required for the test schedule'],
    },
    equipment: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Equipment',
      },
    ],
    requestedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    labManager: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    startTime: {
      type: Date,
      required: [true, 'Please specify the requested start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please specify the requested end time'],
    },
    duration: {
      type: Number, // In minutes
      required: true,
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'TENTATIVE',
        'PENDING_LAB_REVIEW',
        'CHANGES_REQUIRED',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'REJECTED',
      ],
      default: 'PENDING_LAB_REVIEW',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    samplesRequired: {
      type: String,
    },
    dependencies: {
      type: String,
    },
    remarks: {
      type: String,
    },
    labManagerRemarks: {
      type: String,
    },
    // Keep track of rescheduling history
    rescheduleHistory: [
      {
        startTime: Date,
        endTime: Date,
        reason: String,
        requestedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// We need to ensure that a confirmed schedule does not overlap with another confirmed schedule for the same lab/equipment
// However, simple unique indexes can't do complex date-range overlap checking. We will do this in the controller via logic.

module.exports = mongoose.model('TestSchedule', testScheduleSchema);
