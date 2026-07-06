const Batch = require('../models/Batch.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getEvaluationByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find submission that has this token in its evaluators array
    const sub = await Submission.findOne({
      "workflow.evaluationReview.evaluators.token": token
    });
      
    if (!sub) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }

    const evaluator = sub.workflow.evaluationReview.evaluators.find(e => e.token === token);

    const ans = sub.answers || {};
    const findVal = (keywords) => {
      for (const key of Object.keys(ans)) {
        const kLower = key.toLowerCase();
        if (keywords.some(kw => kLower.includes(kw))) return ans[key];
      }
      return null;
    };

    const publicData = {
      id: sub._id,
      businessId: sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
      submissionType: sub.submissionType || findVal(['submissionType', 'SubmissionType']) || 'Idea',
      title: findVal(['title', 'proposaltitle']) || 'Untitled Proposal',
      abstract: findVal(['abstract', 'introduction', 'description']) || 'No abstract',
      benefits: findVal(['benefit']) || 'No benefits',
      employeeName: findVal(['name', 'fullname', 'submittername']) || 'Unknown',
      department: findVal(['department', 'dept']) || 'Unknown',
      estimatedBudget: findVal(['budget', 'cost', 'estimatedbudget', 'amount', 'budgetrequired']) || 'Not specified',
      answers: sub.answers || {},
      formData: sub.formData || {},
      attachments: sub.attachments || [],
      rmRemarks: sub.workflow?.rmReview?.remarks || '',
      rmDecision: sub.workflow?.rmReview?.decision || '',
      committeeName: sub.workflow.evaluationReview.committeeName,
      status: sub.status,
      evaluatorStatus: {
        submitted: evaluator.submitted,
        submittedDate: evaluator.submittedDate,
        scores: evaluator.scores,
        comments: evaluator.comments,
        decision: evaluator.decision
      }
    };

    res.status(200).json(new ApiResponse(200, { submission: publicData }, 'Evaluation details retrieved'));
  } catch (err) {
    next(err);
  }
};

exports.submitEvaluationReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { scores, comments, decision } = req.body; 

    if (!scores || !decision) {
      return next(new ApiError(400, 'Scores and decision are required.'));
    }

    const sub = await Submission.findOne({
      "workflow.evaluationReview.evaluators.token": token
    });

    if (!sub) {
      return next(new ApiError(404, 'Invalid or expired review token'));
    }

    if (sub.status !== 'EVALUATION') {
      return next(new ApiError(400, 'This proposal is no longer in the evaluation phase.'));
    }

    const evaluatorIndex = sub.workflow.evaluationReview.evaluators.findIndex(e => e.token === token);
    const evaluator = sub.workflow.evaluationReview.evaluators[evaluatorIndex];

    if (evaluator.submitted) {
      return next(new ApiError(400, 'You have already submitted your evaluation.'));
    }

    // Record the vote
    evaluator.submitted = true;
    evaluator.submittedDate = new Date();
    evaluator.scores = scores;
    evaluator.comments = comments || '';
    evaluator.decision = decision;

    sub.workflow.evaluationReview.status = 'UNDER_EVALUATION';

    // Log timeline
    sub.timeline.push({
      stage: 'Evaluation Vote Submitted',
      actionBy: evaluator.email,
      role: 'Evaluation Committee Member',
      remarks: `Evaluator submitted review. Decision: ${decision}`,
      timestamp: new Date()
    });

    // Run voting engine
    const allEvaluators = sub.workflow.evaluationReview.evaluators;
    const totalVotes = allEvaluators.filter(e => e.submitted).length;
    const approveVotes = allEvaluators.filter(e => e.submitted && e.decision === 'APPROVED').length;
    const rejectVotes = allEvaluators.filter(e => e.submitted && e.decision === 'REJECTED').length;

    if (approveVotes >= 4) {
      sub.status = 'FINANCE_APPROVED';
      sub.workflow.evaluationReview.status = 'PASSED_EVALUATION';
      sub.workflow.evaluationReview.decision = 'APPROVED';
      sub.timeline.push({
        stage: 'Evaluation Passed',
        actionBy: 'System',
        role: 'System',
        remarks: `Evaluation Passed (${approveVotes}/6 Votes). Proposal routed to Finance Approval queue.`,
        timestamp: new Date()
      });
    } else if (rejectVotes >= 3) {
      sub.status = 'EVALUATION_REJECTED';
      sub.workflow.evaluationReview.status = 'REJECTED_BY_COMMITTEE';
      sub.workflow.evaluationReview.decision = 'REJECTED';
      sub.timeline.push({
        stage: 'Evaluation Rejected',
        actionBy: 'System',
        role: 'System',
        remarks: `Evaluation Rejected (${rejectVotes} Rejections). Does not move to Finance.`,
        timestamp: new Date()
      });
    } else if (totalVotes === 6) {
      // Edge case: all 6 voted but neither 4 approvals nor 3 rejections? 
      // E.g. 3 Approves, 3 Rejects. The rule says "Min 4 Approve votes required". So 3 Approves is FAILED.
      // Wait, 3 Rejects already caught by the "rejectVotes >= 3" block! So this is redundant but safe.
      sub.status = 'EVALUATION_REJECTED';
      sub.workflow.evaluationReview.status = 'REJECTED_BY_COMMITTEE';
      sub.workflow.evaluationReview.decision = 'REJECTED';
      sub.timeline.push({
        stage: 'Evaluation Rejected',
        actionBy: 'System',
        role: 'System',
        remarks: `Evaluation Rejected (Final Tally: ${approveVotes} Approvals, ${rejectVotes} Rejections).`,
        timestamp: new Date()
      });
    }

    await sub.save();

    res.status(200).json(new ApiResponse(200, null, 'Evaluation review submitted successfully'));
  } catch (err) {
    next(err);
  }
};
