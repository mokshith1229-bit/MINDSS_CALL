const MeetingRequest = require('../models/MeetingRequest.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Submit a new meeting request
// @route   POST /api/v1/public/meeting-requests
// @access  Public
exports.createMeetingRequest = async (req, res, next) => {
  try {
    const { trackingId, submissionTitle, requestedBy, email, meetingPurpose, preferredDate, preferredTime, description } = req.body;
    
    if (!trackingId || !requestedBy || !email || !meetingPurpose || !preferredDate || !preferredTime) {
      return next(new ApiError(400, 'Missing required fields for meeting request'));
    }

    let attachmentUrl = '';
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const newRequest = await MeetingRequest.create({
      trackingId: trackingId.trim().toUpperCase(),
      submissionTitle,
      requestedBy,
      email,
      meetingPurpose,
      preferredDate,
      preferredTime,
      description,
      attachmentUrl
    });

    res.status(201).json(new ApiResponse(201, { meetingRequest: newRequest }, 'Meeting request submitted successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get meeting request status for a specific tracking ID
// @route   GET /api/v1/public/meeting-requests/:trackingId
// @access  Public
exports.getMeetingRequestStatus = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    
    // Find the most recent meeting request for this tracking ID
    const meetingRequest = await MeetingRequest.findOne({ trackingId: trackingId.trim().toUpperCase() }).sort({ createdAt: -1 }).lean();
    
    if (!meetingRequest) {
      return res.status(200).json(new ApiResponse(200, { meetingRequest: null }, 'No meeting requests found'));
    }

    // Return safe data for public view
    const safeData = {
      status: meetingRequest.status,
      preferredDate: meetingRequest.preferredDate,
      preferredTime: meetingRequest.preferredTime,
    };

    res.status(200).json(new ApiResponse(200, { meetingRequest: safeData }, 'Meeting request status retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all meeting requests (Admin)
// @route   GET /api/v1/admin/meeting-requests
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getAllMeetingRequests = async (req, res, next) => {
  try {
    const meetingRequests = await MeetingRequest.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(new ApiResponse(200, { meetingRequests }, 'Meeting requests retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update meeting request status (Approve, Reject, Reschedule)
// @route   PATCH /api/v1/admin/meeting-requests/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateMeetingRequestStatus = async (req, res, next) => {
  try {
    const { status, preferredDate, preferredTime } = req.body;
    
    const meetingRequest = await MeetingRequest.findById(req.params.id);
    if (!meetingRequest) {
      return next(new ApiError(404, 'Meeting request not found'));
    }

    if (status) meetingRequest.status = status;
    if (preferredDate) meetingRequest.preferredDate = preferredDate;
    if (preferredTime) meetingRequest.preferredTime = preferredTime;

    await meetingRequest.save();

    res.status(200).json(new ApiResponse(200, { meetingRequest }, 'Meeting request status updated successfully'));
  } catch (err) {
    next(err);
  }
};
