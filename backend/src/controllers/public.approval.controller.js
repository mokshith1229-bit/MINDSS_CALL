const ApprovalBatch = require('../models/ApprovalBatch.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/v1/public/approval-reviews/:token
 * Public — approval committee fetches batch details by token
 */
exports.getApprovalBatchByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const batch = await ApprovalBatch.findOne({ reviewToken: token }).populate('submissions');
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired approval review token'));
    }

    const publicData = {
      batchId: batch._id,
      batchName: batch.name,
      reviewerEmails: batch.reviewerEmails,
      status: batch.status,
      submissions: batch.submissions.map(sub => {
        const ans = sub.answers || {};

        const findVal = (keywords) => {
          for (const key of Object.keys(ans)) {
            const kLower = key.toLowerCase();
            if (keywords.some(kw => kLower.includes(kw))) return ans[key];
          }
          return null;
        };

        return {
          id: sub._id,
          businessId: sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
          submissionType: sub.submissionType || 'Idea',
          title: findVal(['title', 'proposaltitle']) || 'Untitled Proposal',
          abstract: findVal(['abstract', 'introduction', 'description']) || 'No abstract',
          benefits: findVal(['benefit']) || 'No benefits',
          employeeName: findVal(['name', 'fullname', 'submittername']) || 'Unknown',
          department: findVal(['department', 'dept']) || 'Unknown',
          estimatedBudget: findVal(['budget', 'cost', 'estimatedbudget', 'amount', 'budgetrequired']) || 'Not specified',
          answers: ans,
          formData: sub.formData || {},
          attachments: sub.attachments || [],
          status: sub.status,
          timeline: sub.timeline || [],
          rmRemarks: sub.workflow?.rmReview?.remarks || '',
          rmDecision: sub.workflow?.rmReview?.decision || '',
          evalRemarks: sub.workflow?.evaluationReview?.remarks || '',
          evalDecision: sub.workflow?.evaluationReview?.decision || '',
          evalCommittee: sub.workflow?.evaluationReview?.committeeName || '',
          existingFinanceReview: sub.workflow?.financeReview || null
        };
      })
    };

    res.status(200).json(new ApiResponse(200, { batch: publicData }, 'Approval batch details retrieved'));
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/public/approval-reviews/:token
 * Public — approval committee member submits their decisions
 * Body: { reviews: [{ submissionId, decision, remarks, reviewerName }] }
 * decision: 'APPROVED' | 'REJECTED'
 */
exports.submitApprovalBatchReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { reviews, reviewerName } = req.body;

    const batch = await ApprovalBatch.findOne({ reviewToken: token });
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired approval review token'));
    }

    if (batch.status === 'COMPLETED') {
      return next(new ApiError(400, 'Approval batch review already completed'));
    }

    for (const review of reviews) {
      const { submissionId, decision, remarks } = review;

      const sub = await Submission.findById(submissionId);
      if (!sub || sub.status !== 'APPROVAL_COMMITTEE') continue;

      if (decision === 'APPROVED') {
        sub.status = 'APPROVED';
        sub.timeline.push({
          stage: 'Final Approval',
          actionBy: reviewerName || 'Approval Committee Member',
          role: 'Admin',
          remarks: remarks || 'Proposal granted final approval.',
          timestamp: new Date()
        });
      } else if (decision === 'REJECTED') {
        sub.status = 'REJECTED';
        sub.timeline.push({
          stage: 'Rejected',
          actionBy: reviewerName || 'Approval Committee Member',
          role: 'Admin',
          remarks: remarks || 'Submission rejected during final approval.',
          timestamp: new Date()
        });
      }

      await sub.save();
    }

    batch.status = 'COMPLETED';
    await batch.save();

    res.status(200).json(new ApiResponse(200, null, 'Approval batch reviews submitted successfully'));
  } catch (err) {
    next(err);
  }
};
