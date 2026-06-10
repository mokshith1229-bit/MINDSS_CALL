const Meeting = require('../models/Meeting.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get all meetings
// @route   GET /api/v1/meetings
// @access  Private
exports.getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { meetings }, 'Meetings retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new meeting
// @route   POST /api/v1/meetings
// @access  Private (SUPER_ADMIN, ADMIN)
exports.createMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.create(req.body);
    res.status(201).json(new ApiResponse(201, { meeting }, 'Meeting scheduled successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update a meeting (status, recap notes, details)
// @route   PATCH /api/v1/meetings/:id
// @access  Private
exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!meeting) {
      return next(new ApiError(404, 'Meeting not found'));
    }

    res.status(200).json(new ApiResponse(200, { meeting }, 'Meeting updated successfully'));
  } catch (err) {
    next(err);
  }
};
