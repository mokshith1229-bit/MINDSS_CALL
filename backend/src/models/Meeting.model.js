const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Meeting name is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    attendees: [
      {
        type: String,
      }
    ],
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Upcoming', 'Completed'],
      default: 'Scheduled',
    },
    type: {
      type: String,
      required: [true, 'Meeting type is required'],
    },
    agenda: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    actionItems: [
      {
        type: String,
      }
    ],
    recommendations: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Meeting', meetingSchema);
