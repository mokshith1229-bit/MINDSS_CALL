const Submission = require('../models/Submission.model');
const AuditLog = require('../models/AuditLog.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');

const sendHodEmail = (submission) => {
  const hodEmail = submission.answers?.hodEmail || '';
  if (!hodEmail) return;
  const hodName = submission.answers?.hodName || 'HOD';
  const hodToken = submission.workflow?.hodReviewToken;
  if (!hodToken) return;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const reviewLink = `${frontendUrl}/public-review/${hodToken}`;
  const title = submission.answers?.title || submission.answers?.proposaltitle || submission.businessId || 'Untitled';
  const employeeName = submission.answers?.employeeName || submission.answers?.fullName || 'an employee';

  const hodEmailHtml = `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
      <h3 style="color: #1976D2;">MINDScall Proposal Review</h3>
      <p>Dear ${hodName},</p>
      <p>A new proposal by <b>${employeeName}</b> has been approved by the Reporting Manager and now requires your Head of Department approval.</p>
      <p><b>Proposal Title:</b> ${title}</p>
      <p>Please click the secure link below to access the review portal and submit your decision:</p>
      <div style="margin: 25px 0;">
        <a href="${reviewLink}" style="padding: 12px 24px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Proposal</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="color: #888;"><small>Best regards,<br>CubeTech Innovation Team</small></p>
    </div>
  `;
  
  sendEmail({
    email: hodEmail,
    subject: `MINDScall: Action Required - Proposal Needs HOD Approval`,
    html: hodEmailHtml
  }).catch(err => console.error('Failed to send HOD auto-assign email:', err));
};

// @desc    Get submission details for public review by token
// @route   GET /api/v1/public/reviews/:token
// @access  Public
exports.getReviewByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find submission by RM token or HOD token
    const submission = await Submission.findOne({
      $or: [
        { 'workflow.rmReviewToken': token },
        { 'workflow.hodReviewToken': token }
      ]
    }).lean();

    if (!submission) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }

    const isHodReview = submission.workflow.hodReviewToken === token;
    const reviewData = isHodReview ? (submission.workflow.hodReview || {}) : (submission.workflow.rmReview || {});

    // Extract public safe details
    const ans = submission.answers || {};

    let title = ans.title || ans.projectTitle || ans.proposalTitle || ans.ideaTitle;
    let abstract = ans.abstract || ans.executiveSummary || ans.introduction || ans.description || ans.details || ans.ideaDetails;
    let benefits = ans.benefits || ans.benefit;
    let employeeName = ans.employeeName || ans.name || ans.fullName || ans.submitterName;
    let employeeCode = ans.employeeId || ans.employeeCode || ans.empCode || ans.code;
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
      stage: isHodReview ? 'HOD' : 'RM',
      status: submission.status,
      title,
      abstract,
      benefits,
      employeeName,
      employeeCode,
      department: dept,
      attachments: submission.attachments || [],
      existingReview: {
        decision: reviewData.decision || 'PENDING',
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
      $or: [
        { 'workflow.rmReviewToken': token },
        { 'workflow.hodReviewToken': token }
      ]
    });

    if (!submission) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }
    
    const isHodReview = submission.workflow.hodReviewToken === token;

    if (!isHodReview) {
      // RM REVIEW LOGIC
      let reviewerName = '';
      let reviewerEmail = '';
      if (submission.answers) {
        reviewerName = submission.answers.rmName || submission.answers.managerName || submission.answers.reportingManagerName || '';
        reviewerEmail = submission.answers.rmEmail || submission.answers.managerEmail || submission.answers.reportingManagerEmail || '';
      }

      submission.workflow.rmReview.decision = decision;
      submission.workflow.rmReview.remarks = remarks;
      submission.workflow.rmReview.reviewerEmail = reviewerEmail;
      submission.workflow.rmReview.reviewerName = reviewerName;
      submission.workflow.rmReview.timestamp = new Date();
      
      if (decision === 'APPROVED') {
        const hodApproved = submission.workflow?.hodReview?.decision === 'APPROVED';
        
        if (hodApproved) {
          submission.status = 'EVALUATION';
          submission.timeline.push({
            stage: 'RM Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Reporting Manager',
            remarks: remarks || 'Reporting Manager approved the proposal. Both RM and HOD have now approved.',
            timestamp: new Date()
          });
          submission.timeline.push({
            stage: 'Evaluation Started',
            actionBy: 'System',
            role: 'System',
            remarks: 'Proposal moved to Evaluation Committee queue.',
            timestamp: new Date()
          });
        } else {
          submission.status = 'AWAITING_HOD_REVIEW';
          submission.timeline.push({
            stage: 'RM Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Reporting Manager',
            remarks: remarks || 'Reporting Manager approved the proposal. Awaiting HOD Review.',
            timestamp: new Date()
          });
          sendHodEmail(submission);
        }

      } else if (decision === 'REJECTED') {
        submission.status = 'REJECTED';
        submission.timeline.push({
          stage: 'RM Rejected',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Reporting Manager',
          remarks: remarks || 'Reporting Manager rejected the proposal.',
          timestamp: new Date()
        });
      } else if (decision === 'CLARIFICATION') {
        submission.status = 'REVIEWING'; // Send back to initial review queue
        submission.timeline.push({
          stage: 'RM Clarification Requested',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Reporting Manager',
          remarks: remarks || 'Reporting Manager requested clarification.',
          timestamp: new Date()
        });
      }
    } else {
      // HOD REVIEW LOGIC
      let reviewerName = '';
      let reviewerEmail = '';
      if (submission.answers) {
        reviewerName = submission.answers.hodName || 'HOD';
        reviewerEmail = submission.answers.hodEmail || '';
      }

      if (!submission.workflow.hodReview) submission.workflow.hodReview = {};
      submission.workflow.hodReview.decision = decision;
      submission.workflow.hodReview.remarks = remarks;
      submission.workflow.hodReview.reviewerEmail = reviewerEmail;
      submission.workflow.hodReview.reviewerName = reviewerName;
      submission.workflow.hodReview.timestamp = new Date();

      if (decision === 'APPROVED') {
        const rmApproved = submission.workflow?.rmReview?.decision === 'APPROVED';

        if (rmApproved) {
          submission.status = 'EVALUATION';
          submission.timeline.push({
            stage: 'HOD Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Head of Department',
            remarks: remarks || 'Head of Department approved the proposal. Both RM and HOD have now approved.',
            timestamp: new Date()
          });
          submission.timeline.push({
            stage: 'Evaluation Started',
            actionBy: 'System',
            role: 'System',
            remarks: 'Proposal moved to Evaluation Committee queue.',
            timestamp: new Date()
          });
        } else {
          submission.status = 'AWAITING_RM_REVIEW';
          submission.timeline.push({
            stage: 'HOD Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Head of Department',
            remarks: remarks || 'Head of Department approved the proposal. Awaiting RM Review.',
            timestamp: new Date()
          });
        }
      } else if (decision === 'REJECTED') {
        submission.status = 'REJECTED';
        submission.timeline.push({
          stage: 'HOD Rejected',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Head of Department',
          remarks: remarks || 'Head of Department rejected the proposal.',
          timestamp: new Date()
        });
      } else if (decision === 'CLARIFICATION') {
        submission.status = 'REVIEWING';
        submission.timeline.push({
          stage: 'HOD Clarification Requested',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Head of Department',
          remarks: remarks || 'Head of Department requested clarification.',
          timestamp: new Date()
        });
      }
    }

    await submission.save();

    // Log action (using 'SYSTEM' or 'PUBLIC_REVIEWER' as user since unauthenticated)
    await AuditLog.create({
      user: null, // Depending on schema, might need to make 'user' optional in AuditLog if unauth allowed, or map to a generic "System Admin" ID.
      action: 'PUBLIC_REVIEW_SUBMITTED',
      resource: 'Submission',
      details: {
        submissionId: submission._id,
        stage: 'RM',
        decision,
        remarks
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch(err => console.error("AuditLog save failed (might need valid user ID): ", err));

    res.status(200).json(new ApiResponse(200, { submission }, 'Review submitted successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all submissions for an RM batch review
// @route   GET /api/v1/public/submissions/rm-batch/:token
// @access  Public
exports.getRmBatch = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ 'workflow.rmMasterToken': req.params.token })
      .populate('form', 'title description')
      .populate('formVersion', 'schema');

    if (!submissions || submissions.length === 0) {
      return next(new ApiError(404, 'Batch not found or link expired'));
    }

    res.status(200).json(new ApiResponse(200, { submissions }, 'RM batch retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Submit reviews for an RM batch
// @route   POST /api/v1/public/submissions/rm-batch/:token
// @access  Public
exports.submitRmBatch = async (req, res, next) => {
  try {
    const { reviews } = req.body; // reviews: { [submissionId]: { decision, remarks } }
    
    if (!reviews || typeof reviews !== 'object') {
      return next(new ApiError(400, 'Invalid reviews format'));
    }

    const submissions = await Submission.find({ 'workflow.rmMasterToken': req.params.token });
    
    if (!submissions || submissions.length === 0) {
      return next(new ApiError(404, 'Batch not found or link expired'));
    }

    for (const submission of submissions) {
      const reviewData = reviews[submission._id.toString()];
      if (!reviewData || !reviewData.decision) continue;

      const { decision, remarks } = reviewData;
      
      if (!submission.workflow) submission.workflow = {};
      if (!submission.workflow.rmReview) submission.workflow.rmReview = {};

      let reviewerName = 'Manager';
      let reviewerEmail = 'RM';
      if (submission.answers) {
        reviewerName = submission.answers.rmName || submission.answers.managerName || submission.answers.reportingManagerName || '';
        reviewerEmail = submission.answers.rmEmail || submission.answers.managerEmail || submission.answers.reportingManagerEmail || '';
      }

      submission.workflow.rmReview.decision = decision;
      submission.workflow.rmReview.remarks = remarks;
      submission.workflow.rmReview.reviewerEmail = reviewerEmail;
      submission.workflow.rmReview.reviewerName = reviewerName;
      submission.workflow.rmReview.timestamp = new Date();
      
      if (decision === 'APPROVED') {
        const hodApproved = submission.workflow?.hodReview?.decision === 'APPROVED';
        
        if (hodApproved) {
          submission.status = 'EVALUATION';
          submission.timeline.push({
            stage: 'RM Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Reporting Manager',
            remarks: remarks || 'Reporting Manager approved the proposal. Both RM and HOD have now approved.',
            timestamp: new Date()
          });
          submission.timeline.push({
            stage: 'Evaluation Started',
            actionBy: 'System',
            role: 'System',
            remarks: 'Proposal moved to Evaluation Committee queue.',
            timestamp: new Date()
          });
        } else {
          submission.status = 'AWAITING_HOD_REVIEW';
          submission.timeline.push({
            stage: 'RM Approved',
            actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
            role: 'Reporting Manager',
            remarks: remarks || 'Reporting Manager approved the proposal. Awaiting HOD Review.',
            timestamp: new Date()
          });
          sendHodEmail(submission);
        }

      } else if (decision === 'REJECTED') {
        submission.status = 'REJECTED';
        submission.timeline.push({
          stage: 'RM Rejected',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Reporting Manager',
          remarks: remarks || 'Reporting Manager rejected the proposal.',
          timestamp: new Date()
        });
      } else if (decision === 'CLARIFICATION') {
        submission.status = 'REVIEWING';
        submission.timeline.push({
          stage: 'RM Clarification Requested',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Reporting Manager',
          remarks: remarks || 'Reporting Manager requested clarification.',
          timestamp: new Date()
        });
      }
      
      // Token removal disabled so links remain accessible for 48-72+ hours for RM review
      // submission.workflow.rmMasterToken = null;
      // submission.workflow.rmReviewToken = null;

      await submission.save();
    }

    res.status(200).json(new ApiResponse(200, null, 'Batch reviews submitted successfully'));
  } catch (err) {
    next(err);
  }
};
