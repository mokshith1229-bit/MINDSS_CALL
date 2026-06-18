const EmailLog = require('../models/EmailLog.model');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all email logs
// @route   GET /api/v1/admin/email-logs
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getEmailLogs = async (req, res, next) => {
  try {
    const logs = await EmailLog.find()
      .sort('-createdAt')
      .limit(1000)
      .lean();

    res.status(200).json(new ApiResponse(200, { logs }, 'Email logs retrieved successfully'));
  } catch (err) {
    next(err);
  }
};
