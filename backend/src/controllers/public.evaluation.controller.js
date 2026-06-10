const Batch = require('../models/Batch.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getBatchByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const batch = await Batch.findOne({ reviewToken: token })
      .populate('committeeId', 'name')
      .populate('submissions');
      
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired batch token'));
    }

    const publicData = {
      batchId: batch._id,
      batchName: batch.name,
      committeeName: batch.committeeId?.name,
      status: batch.status,
      submissions: batch.submissions.map(sub => {
        const ans = sub.answers || {};
        
        // Key-search fallbacks
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
          submissionType: sub.submissionType || findVal(['submissionType', 'SubmissionType']) || 'Idea',
          title: findVal(['title', 'proposaltitle']) || 'Untitled Proposal',
          abstract: findVal(['abstract', 'introduction', 'description']) || 'No abstract',
          benefits: findVal(['benefit']) || 'No benefits',
          employeeName: findVal(['name', 'fullname', 'submittername']) || 'Unknown',
          department: findVal(['department', 'dept']) || 'Unknown',
          attachments: sub.attachments || [],
          rmRemarks: sub.workflow?.rmReview?.remarks || '',
          rmDecision: sub.workflow?.rmReview?.decision || '',
          timeline: sub.timeline || [],
          status: sub.status
        };
      })
    };

    res.status(200).json(new ApiResponse(200, { batch: publicData }, 'Batch details retrieved'));
  } catch (err) {
    next(err);
  }
};

exports.submitBatchReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { reviews } = req.body; // Array of { submissionId, decision, remarks }

    const batch = await Batch.findOne({ reviewToken: token }).populate('committeeId');
    if (!batch) {
      return next(new ApiError(404, 'Invalid or expired batch token'));
    }

    if (batch.status === 'COMPLETED') {
      return next(new ApiError(400, 'Batch review already completed'));
    }

    const committeeName = batch.committeeId?.name || 'Evaluation Committee';

    for (const review of reviews) {
      const { submissionId, decision, remarks } = review;
      const sub = await Submission.findById(submissionId);
      if (sub && sub.status === 'EVALUATION') {
        if (decision === 'APPROVED') {
          sub.status = 'FINANCE_APPROVED';
          sub.timeline.push({
            event: 'Evaluation Approved',
            actor: committeeName,
            remarks: remarks || 'Committee approved the proposal.',
            timestamp: new Date()
          });
        } else if (decision === 'REJECTED') {
          sub.status = 'REJECTED';
          sub.timeline.push({
            event: 'Evaluation Rejected',
            actor: committeeName,
            remarks: remarks || 'Committee rejected the proposal.',
            timestamp: new Date()
          });
        } else if (decision === 'CLARIFICATION') {
          sub.status = 'REVIEWING'; // sends back
          sub.timeline.push({
            event: 'Evaluation Clarification',
            actor: committeeName,
            remarks: remarks || 'Committee requested clarification.',
            timestamp: new Date()
          });
        }
        await sub.save();
      }
    }

    batch.status = 'COMPLETED';
    await batch.save();

    res.status(200).json(new ApiResponse(200, null, 'Batch reviews submitted successfully'));
  } catch (err) {
    next(err);
  }
};
