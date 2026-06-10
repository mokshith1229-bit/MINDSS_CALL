const Notification = require('../models/Notification.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get all notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { notifications }, 'Notifications retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Create a notification
// @route   POST /api/v1/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
  try {
    const { text, time } = req.body;
    const notification = await Notification.create({ text, time });
    res.status(201).json(new ApiResponse(201, { notification }, 'Notification created successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }

    res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
  } catch (err) {
    next(err);
  }
};
