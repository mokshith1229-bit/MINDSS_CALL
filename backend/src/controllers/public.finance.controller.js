const FinanceBatch = require('../models/FinanceBatch.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/v1/public/finance-reviews/:token
 * Public — finance reviewer fetches batch details by token
 */
exports.getFinanceBatchByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const batch = await FinanceBatch.findOne({ reviewToken: token }).populate('submissions');
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired finance review token'));
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

    res.status(200).json(new ApiResponse(200, { batch: publicData }, 'Finance batch details retrieved'));
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/public/finance-reviews/:token
 * Public — finance reviewer submits their decisions
 * Body: { reviews: [{ submissionId, decision, remarks, approvedBudget, reviewerName }] }
 * decision: 'APPROVABLE' | 'NOT_APPROVABLE' | 'CLARIFICATION'
 */
exports.submitFinanceBatchReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { reviews, reviewerName } = req.body;

    const batch = await FinanceBatch.findOne({ reviewToken: token });
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired finance review token'));
    }

    if (batch.status === 'COMPLETED') {
      return next(new ApiError(400, 'Finance batch review already completed'));
    }

    for (const review of reviews) {
      const { submissionId, decision, remarks, approvedBudget } = review;

      const sub = await Submission.findById(submissionId);
      if (!sub || sub.status !== 'FINANCE_APPROVED') continue;

      // Save finance review data
      sub.workflow = sub.workflow || {};
      sub.workflow.financeReview = {
        reviewerName: reviewerName || 'Finance Reviewer',
        remarks,
        approvedBudget: approvedBudget ? Number(approvedBudget) : null,
        decision,
        timestamp: new Date()
      };

      let eventName = '';
      let newStatus = '';

      if (decision === 'APPROVABLE') {
        newStatus = 'APPROVAL_COMMITTEE';
        eventName = 'Finance Approved';
        sub.timeline.push({
          stage: 'Finance Approved',
          actionBy: reviewerName || 'Finance Reviewer',
          role: 'Finance Committee',
          remarks: remarks || 'Finance committee approved the budget.',
          timestamp: new Date()
        });
        sub.timeline.push({
          stage: 'Sent to Approval Committee',
          actionBy: 'System',
          role: 'System',
          remarks: 'Proposal routed to Approval Committee queue.',
          timestamp: new Date()
        });
      } else if (decision === 'NOT_APPROVABLE') {
        newStatus = 'REJECTED';
        eventName = 'Finance Rejected';
        sub.timeline.push({
          stage: 'Finance Rejected',
          actionBy: reviewerName || 'Finance Reviewer',
          role: 'Finance Committee',
          remarks: remarks || 'Finance committee rejected the budget.',
          timestamp: new Date()
        });
      } else if (decision === 'CLARIFICATION') {
        newStatus = 'FINANCE_APPROVED'; // stays in finance queue for revision
        eventName = 'Finance Clarification';
        sub.timeline.push({
          stage: 'Finance Clarification Requested',
          actionBy: reviewerName || 'Finance Reviewer',
          role: 'Finance Committee',
          remarks: remarks || 'Finance reviewer requested clarification.',
          timestamp: new Date()
        });
      }

      if (newStatus) sub.status = newStatus;
      await sub.save();
    }

    batch.status = 'COMPLETED';
    await batch.save();

    res.status(200).json(new ApiResponse(200, null, 'Finance batch reviews submitted successfully'));
  } catch (err) {
    next(err);
  }
};
