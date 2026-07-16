const mongoose = require('mongoose');

const meetingRequestSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: [true, 'Tracking ID is required'],
      trim: true,
      index: true,
    },
    submissionTitle: {
      type: String,
      default: 'Untitled',
    },
    requestedBy: {
      type: String,
      required: [true, 'Requested by name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    meetingPurpose: {
      type: String,
      required: [true, 'Meeting purpose is required'],
      enum: [
        'Project Discussion',
        'Progress Review',
        'Clarification',
        'Technical Discussion',
        'Demonstration',
        'Other'
      ],
    },
    preferredDate: {
      type: String, // Stored as ISO date string
      required: [true, 'Preferred date is required'],
    },
    preferredTime: {
      type: String, // Stored as time string (e.g. 11:00 AM)
      required: [true, 'Preferred time is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Rescheduled'],
      default: 'Pending Approval',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MeetingRequest', meetingRequestSchema);
