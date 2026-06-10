const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Notification text is required'],
      trim: true,
    },
    time: {
      type: String,
      default: 'Just now',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
