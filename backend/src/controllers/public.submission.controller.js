const Submission = require('../models/Submission.model');
const AuditLog = require('../models/AuditLog.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const crypto = require('crypto');

// @desc    Get submission details for public review by token
// @route   GET /api/v1/public/reviews/:token
// @access  Public
exports.getReviewByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find submission by RM token
    const submission = await Submission.findOne({
      'workflow.rmReviewToken': token
    }).lean();

    if (!submission) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }

    const reviewData = submission.workflow.rmReview || {};

    // Extract public safe details
    const ans = submission.answers || {};

    let title = ans.title || ans.ideaTitle || ans.proposalTitle;
    let abstract = ans.abstract || ans.introduction || ans.description || ans.details || ans.ideaDetails;
    let benefits = ans.benefits || ans.benefit;
    let employeeName = ans.name || ans.employeeName || ans.fullName || ans.submitterName;
    let employeeCode = ans.employeeCode || ans.empCode || ans.code;
    let dept = ans.department || ans.dept;

    // Key-search fallbacks if properties are named differently
    const findVal = (keywords) => {
      for (const key of Object.keys(ans)) {
        const kLower = key.toLowerCase();
        if (keywords.some(kw => kLower.includes(kw))) {
          return ans[key];
        }
      }
      return null;
    };

    if (!title) title = findVal(['title']) || 'Untitled Proposal';
    if (!abstract) abstract = findVal(['abstract', 'introduction', 'description', 'details']) || 'No abstract provided';
    if (!benefits) benefits = findVal(['benefit']) || 'No benefits provided';
    if (!employeeName) employeeName = findVal(['name', 'fullname']) || 'Unknown';
    if (!employeeCode) employeeCode = findVal(['code', 'empcode']) || 'Unknown';
    if (!dept) dept = findVal(['department', 'dept']) || 'Unknown';

    const publicData = {
      submissionId: submission._id,
      stage: 'RM',
      status: submission.status,
      title,
      abstract,
      benefits,
      employeeName,
      employeeCode,
      department: dept,
      attachments: submission.attachments || [],
      existingReview: {
        decision: reviewData.decision,
        remarks: reviewData.remarks,
        timestamp: reviewData.timestamp
      }
    };

    res.status(200).json(new ApiResponse(200, { review: publicData }, 'Review details retrieved'));
  } catch (err) {
    next(err);
  }
};

// @desc    Submit public review decision
// @route   PATCH /api/v1/public/reviews/:token
// @access  Public
exports.submitReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { decision, remarks } = req.body;

    if (!['APPROVED', 'REJECTED', 'CLARIFICATION'].includes(decision)) {
      return next(new ApiError(400, 'Invalid decision'));
    }

    const submission = await Submission.findOne({
      'workflow.rmReviewToken': token
    });

    if (!submission) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }
    
    // Resolve names if available
    let reviewerName = '';
    let reviewerEmail = '';
    if (submission.answers) {
      reviewerName = submission.answers.managerName || submission.answers.reportingManagerName || submission.answers.rmName || '';
      reviewerEmail = submission.answers.managerEmail || submission.answers.reportingManagerEmail || submission.answers.rmEmail || '';
    }

    submission.workflow.rmReview.decision = decision;
    submission.workflow.rmReview.remarks = remarks;
    submission.workflow.rmReview.reviewerEmail = reviewerEmail;
    submission.workflow.rmReview.reviewerName = reviewerName;
    submission.workflow.rmReview.timestamp = new Date();
    
    if (decision === 'APPROVED') {
      submission.status = 'EVALUATION';
      submission.timeline.push({
        event: 'RM Approved',
        actor: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
        remarks: remarks || 'Reporting Manager approved the proposal.',
        timestamp: new Date()
      });
      submission.timeline.push({
        event: 'Evaluation Started',
        actor: 'System',
        remarks: 'Proposal moved to Evaluation Committee queue.',
        timestamp: new Date()
      });
    } else if (decision === 'REJECTED') {
      submission.status = 'REJECTED';
      submission.timeline.push({
        event: 'RM Rejected',
        actor: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
        remarks: remarks || 'Reporting Manager rejected the proposal.',
        timestamp: new Date()
      });
    } else if (decision === 'CLARIFICATION') {
      submission.status = 'REVIEWING'; // Send back to initial review queue
      submission.timeline.push({
        event: 'RM Clarification Requested',
        actor: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
        remarks: remarks || 'Reporting Manager requested clarification.',
        timestamp: new Date()
      });
    }

    await submission.save();

    // Log action (using 'SYSTEM' or 'PUBLIC_REVIEWER' as user since unauthenticated)
    await AuditLog.create({
      user: null, // Depending on schema, might need to make 'user' optional in AuditLog if unauth allowed, or map to a generic "System Admin" ID.
      action: 'PUBLIC_REVIEW_SUBMITTED',
      resource: 'Submission',
      details: {
        submissionId: submission._id,
        stage: isRmReview ? 'RM' : 'HOD',
        decision,
        remarks
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch(err => console.error("AuditLog save failed (might need valid user ID): ", err));

    res.status(200).json(new ApiResponse(200, { success: true, status: submission.status }, 'Review submitted successfully'));
  } catch (err) {
    next(err);
  }
};
