const mongoose = require('mongoose');
const Submission = require('../models/Submission.model');
const AuditLog = require('../models/AuditLog.model');

/**
 * @desc    Get all tracking links and calculate KPIs for Tracking Management Module
 * @route   GET /api/v1/developer/tracking
 * @access  Private (Developer Only)
 */
exports.getAllTrackingLinks = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .select('trackingId submissionType status createdAt answers wbsCode submitterEmail projectDetails')
      .sort({ createdAt: -1 })
      .lean();

    // Map the raw submission data to the format required by the frontend
    const trackingData = submissions.map((sub) => {
      // Legacy compatibility for title/department
      const submissionTitle = sub.answers?.submissionTitle || sub.answers?.ideaTitle || 'Untitled';
      const employeeName = sub.answers?.name || sub.answers?.employeeName || 'Unknown';
      const employeeId = sub.answers?.employeeId || '';
      const department = sub.answers?.department || sub.answers?.departmentName || 'N/A';

      // Current workflow stage determination logic based on status
      let workflowStage = 'Submitted';
      if (['AWAITING_RM_REVIEW', 'RM_REVIEW'].includes(sub.status)) workflowStage = 'RM Review';
      else if (['AWAITING_HOD_REVIEW', 'HOD_REVIEW'].includes(sub.status)) workflowStage = 'HOD Review';
      else if (sub.status === 'REVIEWING') workflowStage = 'Under Review';
      else if (sub.status === 'EVALUATION') workflowStage = 'Evaluation Committee';
      else if (sub.status === 'APPROVAL_COMMITTEE') workflowStage = 'Approval Committee';
      else if (sub.status === 'FINANCE_APPROVED') workflowStage = 'Finance Review Completed';
      else if (sub.status === 'IMPLEMENTATION') workflowStage = 'R&D Ongoing';
      else if (sub.status === 'COMPLETED') workflowStage = 'Completed';
      else if (sub.status === 'REJECTED') workflowStage = 'Rejected';
      else if (sub.status === 'APPROVED') workflowStage = 'Approved';

      return {
        _id: sub._id.toString(),
        trackingId: sub.trackingId,
        submissionType: sub.submissionType || 'Idea',
        submissionTitle,
        employeeName,
        employeeId,
        submitterEmail: sub.submitterEmail || sub.answers?.email || '',
        department,
        wbsCode: sub.wbsCode || 'N/A',
        workflowStage,
        status: sub.status,
        createdAt: sub.createdAt,
      };
    });

    // Calculate KPIs
    const totalTrackingIds = trackingData.length;
    
    const activeStatuses = [
      'NEW', 'REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 
      'AWAITING_HOD_REVIEW', 'HOD_REVIEW', 'EVALUATION', 
      'APPROVAL_COMMITTEE', 'IMPLEMENTATION'
    ];
    
    const activeSubmissions = trackingData.filter(sub => activeStatuses.includes(sub.status)).length;
    const completedSubmissions = trackingData.filter(sub => sub.status === 'COMPLETED' || sub.status === 'APPROVED' || sub.status === 'FINANCE_APPROVED').length;
    const archivedSubmissions = trackingData.filter(sub => sub.status === 'REJECTED' || sub.status === 'EVALUATION_REJECTED').length;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalTrackingIds,
          activeSubmissions,
          completedSubmissions,
          archivedSubmissions
        },
        trackingData
      }
    });
  } catch (error) {
    console.error('Error fetching tracking links:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Log a developer's action on a tracking link
 * @route   POST /api/v1/developer/tracking/log
 * @access  Private (Developer Only)
 */
exports.logTrackingAction = async (req, res) => {
  try {
    const { trackingId, action } = req.body;

    if (!trackingId || !action) {
      return res.status(400).json({ success: false, message: 'Missing trackingId or action' });
    }

    // Valid actions: 'Copied Tracking Link', 'Opened Tracking Page', 'Viewed Submission'
    await AuditLog.create({
      user: req.user._id,
      action: action,
      resource: 'Tracking Management',
      details: {
        trackingId: trackingId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({ success: true, message: 'Action logged successfully' });
  } catch (error) {
    console.error('Error logging tracking action:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
