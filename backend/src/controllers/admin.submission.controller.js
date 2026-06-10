const Submission = require('../models/Submission.model');
const Form = require('../models/Form.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Parser } = require('json2csv');
const AuditLog = require('../models/AuditLog.model');
const crypto = require('crypto');

// @desc    Get all submissions (with filtering)
// @route   GET /api/v1/admin/submissions
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getSubmissions = async (req, res, next) => {
  try {
    const { formId, status, search } = req.query;

    let query = {};
    if (formId) query.form = formId;
    if (status) query.status = status;
    if (search) {
      query.businessId = { $regex: search, $options: 'i' };
    }

    const submissions = await Submission.find(query)
      .populate('form', 'title slug')
      .populate('formVersion', 'schema')
      .sort('-createdAt');

    res.status(200).json(new ApiResponse(200, { submissions }, 'Submissions retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single submission
// @route   GET /api/v1/admin/submissions/:id
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('form', 'title description')
      .populate('formVersion', 'schema');

    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    res.status(200).json(new ApiResponse(200, { submission }, 'Submission retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update submission status
// @route   PATCH /api/v1/admin/submissions/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateSubmissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    submission.status = status;

    // Log timeline event
    let eventName = null;
    let remarksText = `Status updated to ${status}.`;
    if (status === 'REVIEWING') {
      eventName = 'R&D Reviewed';
      remarksText = 'Submission marked as reviewing by R&D team.';
    } else if (status === 'EVALUATION') {
      eventName = 'Evaluation Started';
      remarksText = 'Moved to Evaluation Committee queue.';
    } else if (status === 'APPROVED') {
      eventName = 'Final Approval';
      remarksText = 'Proposal granted final approval.';
    } else if (status === 'FINANCE_APPROVED') {
      eventName = 'Finance Approved';
      remarksText = 'Approved by Finance CFO.';
    } else if (status === 'REJECTED') {
      eventName = 'Rejected';
      remarksText = 'Submission rejected.';
    }

    if (eventName) {
      submission.timeline.push({
        event: eventName,
        actor: req.user?.email || 'Admin',
        remarks: remarksText,
        timestamp: new Date()
      });
    }

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Submission status updated'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update submission review (RM/HOD)
// @route   PATCH /api/v1/admin/submissions/:id/review
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateSubmissionReview = async (req, res, next) => {
  try {
    const { stage, decision, remarks, reviewerEmail } = req.body;
    // stage should be 'RM' or 'HOD'

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.workflow) {
      submission.workflow = {};
    }

    // Resolve names if available
    let reviewerName = '';
    if (submission.answers) {
      reviewerName = submission.answers.managerName || submission.answers.reportingManagerName || submission.answers.rmName || '';
    }

    if (stage === 'RM') {
      submission.workflow.rmReview = {
        reviewerEmail,
        reviewerName,
        remarks,
        decision,
        timestamp: new Date()
      };
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
        submission.status = 'REVIEWING';
        submission.timeline.push({
          event: 'RM Clarification Requested',
          actor: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          remarks: remarks || 'Reporting Manager requested clarification.',
          timestamp: new Date()
        });
      }
    }

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Submission review updated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Export submissions to CSV
// @route   GET /api/v1/admin/submissions/export/:formId
// @access  Private (SUPER_ADMIN, ADMIN)
exports.exportSubmissionsCSV = async (req, res, next) => {
  try {
    const { formId } = req.params;
    
    const form = await Form.findById(formId);
    if (!form) {
      return next(new ApiError(404, 'Form not found'));
    }

    const submissions = await Submission.find({ form: formId }).lean();

    if (submissions.length === 0) {
      return next(new ApiError(404, 'No submissions found for this form'));
    }

    // Flatten the answers JSON into columns
    const flatData = submissions.map(sub => {
      const row = {
        BusinessID: sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
        Type: sub.submissionType || 'Idea',
        InternalID: sub._id.toString(),
        Status: sub.status,
        SubmitterEmail: sub.submitterEmail || 'N/A',
        SubmittedAt: sub.createdAt,
      };

      // Spread the answers dynamically
      if (sub.answers && typeof sub.answers === 'object') {
        Object.keys(sub.answers).forEach(key => {
          row[key] = sub.answers[key];
        });
      }

      // Concatenate attachment URLs if any
      if (sub.attachments && sub.attachments.length > 0) {
        row.Attachments = sub.attachments.map(att => att.url).join(', ');
      } else {
        row.Attachments = '';
      }

      return row;
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(flatData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${form.slug}-submissions.csv`);
    return res.send(csv);

  } catch (err) {
    next(err);
  }
};

// @desc    Delete a submission
// @route   DELETE /api/v1/admin/submissions/:id
// @access  Private (SUPER_ADMIN, ADMIN)
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }
    res.status(200).json(new ApiResponse(200, null, 'Submission deleted successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update finance review decision
// @route   PATCH /api/v1/admin/submissions/:id/finance-review
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateFinanceReview = async (req, res, next) => {
  try {
    const { decision, remarks, reviewerName } = req.body;
    
    if (!['APPROVABLE', 'NOT_APPROVABLE', 'CLARIFICATION'].includes(decision)) {
      return next(new ApiError(400, 'Invalid decision'));
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.workflow) {
      submission.workflow = {};
    }

    submission.workflow.financeReview = {
      reviewerName,
      remarks,
      decision,
      timestamp: new Date()
    };

    let eventName = '';
    let statusUpdate = '';

    if (decision === 'APPROVABLE') {
      statusUpdate = 'APPROVAL_COMMITTEE';
      eventName = 'Finance Review: Approvable';
    } else if (decision === 'NOT_APPROVABLE') {
      statusUpdate = 'REJECTED';
      eventName = 'Finance Review: Not Approvable';
    } else if (decision === 'CLARIFICATION') {
      statusUpdate = 'REVIEWING';
      eventName = 'Finance Review: Clarification Requested';
    }

    submission.status = statusUpdate;
    submission.timeline.push({
      event: eventName,
      actor: reviewerName || req.user?.email || 'Finance Reviewer',
      remarks: remarks || `Finance marked budget as ${decision}`,
      timestamp: new Date()
    });

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Finance review submitted successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Assign email and log action
// @route   PATCH /api/v1/admin/submissions/:id/assign-email
// @access  Private (SUPER_ADMIN, ADMIN)
exports.assignSubmissionEmail = async (req, res, next) => {
  try {
    const { stage, email } = req.body || { stage: 'RM' };
    const token = crypto.randomBytes(24).toString('hex');
    
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    let managerName = 'Manager';
    let managerEmail = email || '';
    if (submission.answers) {
      managerName = submission.answers.managerName || submission.answers.reportingManagerName || submission.answers.rmName || 'Reporting Manager';
      if (!managerEmail) {
        managerEmail = submission.answers.managerEmail || submission.answers.reportingManagerEmail || submission.answers.rmEmail || '';
      }
    }

    submission.status = 'AWAITING_RM_REVIEW';
    submission.workflow.rmReviewToken = token;
    submission.timeline.push({
      event: 'RM Assigned',
      actor: req.user?.email || 'Admin',
      remarks: `Assigned to RM: ${managerName} (${managerEmail})`,
      timestamp: new Date()
    });

    await submission.save();

    // Log the assignment action
    await AuditLog.create({
      user: req.user._id,
      action: 'EMAIL_ASSIGNED',
      resource: 'Submission',
      details: {
        submissionId: submission._id,
        status: submission.status,
        stage
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(new ApiResponse(200, { submission, token }, 'Email assigned and logged successfully'));
  } catch (err) {
    next(err);
  }
};
