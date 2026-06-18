const AuditLog = require('../models/AuditLog.model');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .limit(1000)
      .lean();

    res.status(200).json(new ApiResponse(200, { logs }, 'Audit logs retrieved successfully'));
  } catch (err) {
    next(err);
  }
};
