const ApiError = require('../utils/ApiError');
const TestSchedule = require('../models/TestSchedule.model');
const Lab = require('../models/Lab.model');
const sendEmail = require('../utils/emailSender');
const AuditLog = require('../models/AuditLog.model');

// @desc    Get all test schedules (can filter by date range, lab, project, status)
// @route   GET /api/v1/test-schedules
// @access  Private
exports.getSchedules = async (req, res, next) => {
  try {
    const { startDate, endDate, lab, project, status } = req.query;
    let query = {};
    
    if (lab) query.lab = lab;
    if (project) query.project = project;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate) };
      query.endTime = { $lte: new Date(endDate) };
    } else if (startDate) {
      query.startTime = { $gte: new Date(startDate) };
    }
    
    const schedules = await TestSchedule.find(query)
      .populate('project', 'projectDetails.title proposalId')
      .populate('lab', 'name location')
      .populate('equipment', 'name')
      .populate('requestedBy', 'name email')
      .sort('startTime');
      
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check availability for a specific lab, equipment, and time slot
// @route   POST /api/v1/test-schedules/check-availability
// @access  Private
exports.checkAvailability = async (req, res, next) => {
  try {
    const { labId, equipmentIds, startTime, endTime } = req.body;
    
    if (!labId || !startTime || !endTime) {
      return next(new ApiError(400, 'Please provide lab, start time, and end time'));
    }
    
    const reqStart = new Date(startTime);
    const reqEnd = new Date(endTime);
    
    if (reqStart >= reqEnd) {
      return next(new ApiError(400, 'End time must be after start time'));
    }
    
    // 1. Check if the lab is active
    const lab = await Lab.findById(labId);
    if (!lab || !lab.isActive) {
      return res.status(200).json({ available: false, reason: 'Laboratory is not active or does not exist.' });
    }
    
    // 2. Check working days and hours (simplified check assuming local timezone for now)
    const dayOfWeek = reqStart.toLocaleString('en-US', { weekday: 'long' });
    if (!lab.workingDays.includes(dayOfWeek)) {
      return res.status(200).json({ available: false, reason: `Laboratory is closed on ${dayOfWeek}s.` });
    }
    
    // 3. Find any conflicting confirmed or in-progress schedules
    const overlappingSchedules = await TestSchedule.find({
      lab: labId,
      status: { $in: ['CONFIRMED', 'IN_PROGRESS'] },
      $or: [
        { startTime: { $lt: reqEnd }, endTime: { $gt: reqStart } }
      ]
    });
    
    if (overlappingSchedules.length > 0) {
      // Check if equipment overlap matters, or if the lab can handle multiple tests. 
      // For now, if same lab and same equipment OR if lab is exclusive, it's a conflict.
      // Let's assume strict conflict if any overlap exists in the same lab for simplicity.
      return res.status(200).json({ 
        available: false, 
        reason: 'SCHEDULING CONFLICT: The requested laboratory is already occupied during this time.',
        conflicts: overlappingSchedules.map(s => s._id)
      });
    }
    
    res.status(200).json({
      available: true,
      reason: 'The selected slot is available.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a new test schedule (Tentative)
// @route   POST /api/v1/test-schedules
// @access  Private
exports.requestSchedule = async (req, res, next) => {
  try {
    const { lab: labId, startTime, endTime } = req.body;
    
    // First, run availability check server-side
    const reqStart = new Date(startTime);
    const reqEnd = new Date(endTime);
    
    const overlappingSchedules = await TestSchedule.find({
      lab: labId,
      status: { $in: ['CONFIRMED', 'IN_PROGRESS'] },
      $or: [
        { startTime: { $lt: reqEnd }, endTime: { $gt: reqStart } }
      ]
    });
    
    if (overlappingSchedules.length > 0) {
      return next(new ApiError(409, 'SCHEDULING CONFLICT: The slot has already been taken.'));
    }
    
    req.body.requestedBy = req.user.id;
    req.body.status = 'PENDING_LAB_REVIEW';
    
    // Assign the lab manager from the lab master
    const labInfo = await Lab.findById(labId);
    if (labInfo) {
      req.body.labManager = labInfo.labManager;
    }
    
    const schedule = await TestSchedule.create(req.body);
    
    // Create Audit Log
    await AuditLog.create({
      action: 'TEST_SCHEDULE_REQUESTED',
      resource: 'TestSchedule',
      user: req.user.id,
      details: `Requested test schedule ${schedule.testName} for project ${schedule.project}`,
    });

    if (labInfo && labInfo.labManager) {
      await sendEmail({
        email: 'lab.manager@chtech.in', // In a real system, you'd populate labInfo.labManager.email
        subject: 'New Lab Schedule Request Pending Review',
        message: `A new test slot has been requested for ${schedule.testName}. Please log in to MINDScall to review it.`,
      }).catch(err => console.log('Email send failed but continuing'));
    }
    
    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('requestSchedule error:', error);
    next(error);
  }
};

// @desc    Lab Manager approves schedule
// @route   POST /api/v1/test-schedules/:id/approve
// @access  Private
exports.approveSchedule = async (req, res, next) => {
  try {
    const schedule = await TestSchedule.findById(req.params.id);
    
    if (!schedule) {
      return next(new ApiError(404, `Schedule not found`));
    }
    
    // Run conflict check one last time before confirming
    const overlappingSchedules = await TestSchedule.find({
      _id: { $ne: schedule._id },
      lab: schedule.lab,
      status: { $in: ['CONFIRMED', 'IN_PROGRESS'] },
      $or: [
        { startTime: { $lt: schedule.endTime }, endTime: { $gt: schedule.startTime } }
      ]
    });
    
    if (overlappingSchedules.length > 0) {
      return next(new ApiError(409, 'SCHEDULING CONFLICT: Another test was confirmed in this slot recently.'));
    }
    
    schedule.status = 'CONFIRMED';
    schedule.labManagerRemarks = req.body.remarks || '';
    await schedule.save();
    
    await AuditLog.create({
      action: 'TEST_SCHEDULE_APPROVED',
      resource: 'TestSchedule',
      user: req.user.id,
      details: `Approved test schedule ${schedule.testName}`,
    });

    await sendEmail({
      email: 'initiator@chtech.in', // Fallback for testing
      subject: 'Lab Schedule Confirmed',
      message: `Your requested test slot for ${schedule.testName} has been APPROVED and CONFIRMED.`,
    }).catch(err => console.log('Email error'));
    
    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject schedule
// @route   POST /api/v1/test-schedules/:id/reject
// @access  Private
exports.rejectSchedule = async (req, res, next) => {
  try {
    const schedule = await TestSchedule.findById(req.params.id);
    if (!schedule) {
      return next(new ApiError(404, `Schedule not found`));
    }
    
    schedule.status = 'REJECTED';
    schedule.labManagerRemarks = req.body.remarks;
    await schedule.save();
    
    await AuditLog.create({
      action: 'TEST_SCHEDULE_REJECTED',
      resource: 'TestSchedule',
      user: req.user.id,
      details: `Rejected test schedule ${schedule.testName}`,
    });
    
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Request changes
// @route   POST /api/v1/test-schedules/:id/request-changes
// @access  Private
exports.requestChanges = async (req, res, next) => {
  try {
    const schedule = await TestSchedule.findById(req.params.id);
    if (!schedule) return next(new ApiError(404, `Schedule not found`));
    
    schedule.status = 'CHANGES_REQUIRED';
    schedule.labManagerRemarks = req.body.remarks;
    await schedule.save();
    
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
