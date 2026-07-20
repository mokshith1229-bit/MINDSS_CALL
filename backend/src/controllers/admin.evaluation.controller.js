const Committee = require('../models/Committee.model');
const Batch = require('../models/Batch.model');
const FinanceBatch = require('../models/FinanceBatch.model');
const ApprovalBatch = require('../models/ApprovalBatch.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');
const EmailLog = require('../models/EmailLog.model');

// =========================
// COMMITTEE MANAGEMENT
// =========================

exports.createCommittee = async (req, res, next) => {
  try {
    const { name, description, active, members } = req.body;
    if (!members || members.length !== 6) {
      return next(new ApiError(400, 'A committee must have exactly 6 members.'));
    }
    const auditHistory = [{
      members,
      updatedBy: req.user?.email || 'Admin',
      updatedAt: new Date()
    }];
    const committee = await Committee.create({ name, description, active, members, auditHistory });
    res.status(201).json(new ApiResponse(201, { committee }, 'Committee created successfully'));
  } catch (err) {
    next(err);
  }
};

exports.getCommittees = async (req, res, next) => {
  try {
    const committees = await Committee.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { committees }, 'Committees retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

exports.updateCommittee = async (req, res, next) => {
  try {
    const { name, description, active, members } = req.body;
    if (members && members.length !== 6) {
      return next(new ApiError(400, 'A committee must have exactly 6 members.'));
    }
    const committee = await Committee.findById(req.params.id);
    if (!committee) {
      return next(new ApiError(404, 'Committee not found'));
    }
    if (name !== undefined) committee.name = name;
    if (description !== undefined) committee.description = description;
    if (active !== undefined) committee.active = active;
    if (members) {
      committee.members = members;
      committee.auditHistory.push({
        members,
        updatedBy: req.user?.email || 'Admin',
        updatedAt: new Date()
      });
    }
    await committee.save();
    res.status(200).json(new ApiResponse(200, { committee }, 'Committee updated successfully'));
  } catch (err) {
    next(err);
  }
};

exports.deleteCommittee = async (req, res, next) => {
  try {
    const committee = await Committee.findByIdAndDelete(req.params.id);
    if (!committee) {
      return next(new ApiError(404, 'Committee not found'));
    }
    // Also delete or unassign associated batches if necessary
    res.status(200).json(new ApiResponse(200, null, 'Committee deleted successfully'));
  } catch (err) {
    next(err);
  }
};

// Removed Batch Management (Replaced by Voting Engine)

// =========================
// AUTO ASSIGN COMMITTEE
// =========================

exports.autoAssignCommittee = async (req, res, next) => {
  try {
    const { evaluatorEmails, submissionIds } = req.body;

    if (!evaluatorEmails || !Array.isArray(evaluatorEmails) || evaluatorEmails.length !== 6) {
      return next(new ApiError(400, 'Exactly 6 evaluator emails are required'));
    }
    if (!submissionIds || submissionIds.length === 0) {
      return next(new ApiError(400, 'submissionIds are required'));
    }

    const uniqueEmails = [...new Set(evaluatorEmails.map(e => e.trim().toLowerCase()))];
    if (uniqueEmails.length !== 6) {
       return next(new ApiError(400, 'All 6 evaluator emails must be unique.'));
    }

    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found'));
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    for (const sub of submissions) {
      sub.status = 'EVALUATION';
      if (!sub.workflow) sub.workflow = {};
      sub.workflow.evaluationReview = sub.workflow.evaluationReview || {};
      sub.workflow.evaluationReview.committeeName = 'Custom Evaluation Committee';
      sub.workflow.evaluationReview.status = 'AWAITING_VOTES';
      
      // Assign the 6 evaluators
      const evaluators = uniqueEmails.map(email => ({
        email,
        token: crypto.randomBytes(24).toString('hex'),
        submitted: false
      }));
      sub.workflow.evaluationReview.evaluators = evaluators;

      sub.timeline.push({
        stage: 'Assigned To Evaluation Committee',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to 6 individual evaluators`,
        timestamp: new Date()
      });
      await sub.save();

      const title = sub.answers?.title || sub.answers?.proposaltitle || sub.businessId || 'Untitled';

      // Send individual emails to each of the 6 evaluators
      for (const ev of evaluators) {
        const reviewLink = `${frontendUrl}/evaluator-review/${ev.token}`;
        const emailSubject = `MINDScall: Evaluation Required for Proposal ${sub.businessId}`;
        const emailHtml = `
          <h3>MINDScall Proposal Evaluation</h3>
          <p>Hello Committee Member,</p>
          <p>You have been assigned to evaluate the following proposal:</p>
          <ul>
            <li><b>Tracking ID:</b> ${sub.businessId}</li>
            <li><b>Title:</b> ${title}</li>
            <li><b>Proposer:</b> ${sub.answers?.employeeName || 'N/A'}</li>
          </ul>
          <p>Please click the secure link below to access your unique review portal:</p>
          <a href="${reviewLink}" style="padding: 10px 15px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 4px;">Evaluate Proposal</a>
          <br><br>
          <p>Or copy this link into your browser: <br>${reviewLink}</p>
          <hr />
          <p><small>This is an automated message from MINDScall.</small></p>
        `;
        
        // Asynchronously send email to avoid blocking the whole loop if one fails
        sendEmail({
          email: ev.email,
          subject: emailSubject,
          html: emailHtml
        }).catch(err => console.error('Failed to send evaluator email to', ev.email, err));
      }
    }
  
    res.status(200).json(new ApiResponse(200, { assignedCount: submissions.length }, 'Assigned to committee and secure links sent to evaluators successfully.'));
  } catch (err) {
    next(err);
  }
};

// ==========================================
// AUTO ASSIGN EVAL BY EMAIL (no fixed committee)
// ==========================================

exports.autoAssignEvalByEmail = async (req, res, next) => {
  try {
    const { evaluatorEmails, submissionIds, batchName } = req.body;

    if (!evaluatorEmails || evaluatorEmails.length === 0 || !submissionIds || submissionIds.length === 0) {
      return next(new ApiError(400, 'evaluatorEmails and submissionIds are required'));
    }

    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found'));
    }

    // Create a batch with reviewer emails (no committeeId)
    const reviewToken = crypto.randomBytes(24).toString('hex');
    const resolvedBatchName = batchName || `Eval-Batch-${Date.now()}`;

    const batch = await Batch.create({
      name: resolvedBatchName,
      committeeId: null,
      reviewerEmails: evaluatorEmails,
      submissions: submissionIds,
      reviewToken,
      status: 'EMAIL_SENT'
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const reviewLink = `${frontendUrl}/batch-review/${reviewToken}`;

    const links = [];
    // Update each submission status to EVALUATION and log timeline
    for (const sub of submissions) {
      sub.status = 'EVALUATION';
      if (!sub.workflow) sub.workflow = {};
      sub.workflow.evaluationReview = sub.workflow.evaluationReview || {};
      sub.workflow.evaluationReview.committeeName = evaluatorEmails.join(', ');
      sub.timeline.push({
        stage: 'Sent to Evaluation Committee',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to evaluators: ${evaluatorEmails.join(', ')} in batch: ${resolvedBatchName}`,
        timestamp: new Date()
      });
      await sub.save();

      const title = sub.answers?.title || sub.answers?.proposaltitle || sub.businessId || 'Untitled';
      links.push(`<li style="margin-bottom:5px;"><b>${sub.businessId || 'Proposal'}</b> – ${title}</li>`);
    }

    // Send email to all evaluator addresses
    const emailSubject = `MINDScall: Evaluation Required for Batch ${resolvedBatchName}`;
    const emailHtml = `
      <h3>MINDScall Proposal Evaluation</h3>
      <p>Hello Committee Members (Email Assignees),</p>
      <p>You have been assigned to evaluate a new batch of proposals.</p>
      <ul>
        <li><b>Batch Name:</b> ${resolvedBatchName}</li>
        <li><b>Proposals to Review:</b> ${submissions.length}</li>
      </ul>
      <p>Please click the secure link below to access the review portal:</p>
      <a href="${reviewLink}" style="padding: 10px 15px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 4px;">Start Evaluation</a>
      <br><br>
      <p>Or copy this link into your browser: <br>${reviewLink}</p>
      <hr />
      <p><small>This is an automated message from MINDScall.</small></p>
    `;

    await sendEmail({
      email: evaluatorEmails.join(', '),
      subject: emailSubject,
      html: emailHtml
    });

    res.status(200).json(new ApiResponse(200, { batch, assignedCount: submissions.length }, 'Evaluators assigned and email sent successfully.'));
  } catch (err) {
    next(err);
  }
};



// ==========================================
// AUTO ASSIGN FINANCE REVIEWERS
// ==========================================

exports.autoAssignFinance = async (req, res, next) => {
  try {
    const { reviewerEmails, submissionIds, batchName } = req.body;

    if (!reviewerEmails || reviewerEmails.length === 0 || !submissionIds || submissionIds.length === 0) {
      return next(new ApiError(400, 'reviewerEmails and submissionIds are required'));
    }

    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found'));
    }

    // Ensure all submissions are in FINANCE_APPROVED state (eval committee approved)
    const validSubs = submissions.filter(s => s.status === 'FINANCE_APPROVED');
    if (validSubs.length === 0) {
      return next(new ApiError(400, 'No submissions in FINANCE_APPROVED status. Only evaluation-approved proposals can be assigned to finance.'));
    }

    // Generate a secure review token for this finance batch
    const reviewToken = crypto.randomBytes(24).toString('hex');
    const resolvedBatchName = batchName || `Finance-Batch-${Date.now()}`;

    const financeBatch = await FinanceBatch.create({
      name: resolvedBatchName,
      reviewerEmails,
      submissions: validSubs.map(s => s._id),
      reviewToken,
      status: 'EMAIL_SENT'
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const reviewLink = `${frontendUrl}/finance-review/${reviewToken}`;

    const links = [];
    // Log timeline for each valid submission
    for (const sub of validSubs) {
      sub.timeline.push({
        stage: 'Sent To Finance',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to finance reviewers: ${reviewerEmails.join(', ')} in batch: ${resolvedBatchName}`,
        timestamp: new Date()
      });
      await sub.save();

      const title = sub.answers?.title || sub.answers?.proposaltitle || sub.businessId || 'Untitled';
      links.push(`<li style="margin-bottom:5px;"><b>${sub.businessId || 'Proposal'}</b> – ${title}</li>`);
    }

    // Send email to all finance reviewers
    const emailSubject = `MINDScall: Finance Review Required for Batch ${resolvedBatchName}`;
    const emailHtml = `
      <h3>MINDScall Finance Approval</h3>
      <p>Hello Finance Committee,</p>
      <p>You have been assigned to evaluate a new batch of proposals for finance approval.</p>
      <ul>
        <li><b>Batch Name:</b> ${resolvedBatchName}</li>
        <li><b>Proposals to Review:</b> ${validSubs.length}</li>
      </ul>
      <p>Please click the secure link below to access the review portal:</p>
      <a href="${reviewLink}" style="padding: 10px 15px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 4px;">Start Evaluation</a>
      <br><br>
      <p>Or copy this link into your browser: <br>${reviewLink}</p>
      <hr />
      <p><small>This is an automated message from MINDScall.</small></p>
    `;

    await sendEmail({
      email: reviewerEmails.join(', '),
      subject: emailSubject,
      html: emailHtml
    });

    res.status(200).json(new ApiResponse(200, { financeBatch, assignedCount: validSubs.length }, 'Finance reviewers assigned and email sent successfully.'));
  } catch (err) {
    next(err);
  }
};

// Get finance batches list
exports.getFinanceBatches = async (req, res, next) => {
  try {
    const batches = await FinanceBatch.find().populate('submissions').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { batches }, 'Finance batches retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// ==========================================
// AUTO ASSIGN APPROVAL COMMITTEE
// ==========================================

exports.autoAssignApproval = async (req, res, next) => {
  try {
    const { reviewerEmails, submissionIds, batchName } = req.body;

    if (!reviewerEmails || reviewerEmails.length === 0 || !submissionIds || submissionIds.length === 0) {
      return next(new ApiError(400, 'reviewerEmails and submissionIds are required'));
    }

    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found'));
    }

    // Ensure all submissions are in FINANCE_APPROVED state
    const validSubs = submissions.filter(s => s.status === 'FINANCE_APPROVED' || s.status === 'APPROVAL_COMMITTEE');
    if (validSubs.length === 0) {
      return next(new ApiError(400, 'No eligible submissions found for Approval Committee assignment.'));
    }

    // Generate a secure review token for this approval batch
    const reviewToken = crypto.randomBytes(24).toString('hex');
    const resolvedBatchName = batchName || `Approval-Batch-${Date.now()}`;

    const approvalBatch = await ApprovalBatch.create({
      name: resolvedBatchName,
      reviewerEmails,
      submissions: validSubs.map(s => s._id),
      reviewToken,
      status: 'EMAIL_SENT'
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const reviewLink = `${frontendUrl}/approval-review/${reviewToken}`;

    const links = [];
    // Log timeline for each valid submission and update status
    for (const sub of validSubs) {
      sub.status = 'APPROVAL_COMMITTEE';
      sub.timeline.push({
        stage: 'Sent To Approval Committee',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to approval committee: ${reviewerEmails.join(', ')} in batch: ${resolvedBatchName}`,
        timestamp: new Date()
      });
      await sub.save();

      const title = sub.answers?.title || sub.answers?.proposaltitle || sub.businessId || 'Untitled';
      links.push(`<li style="margin-bottom:5px;"><b>${sub.businessId || 'Proposal'}</b> – ${title}</li>`);
    }

    // Send email to all approval reviewers
    const emailSubject = `MINDScall: Approval Committee Review Required for Batch ${resolvedBatchName}`;
    const emailHtml = `
      <h3>MINDScall Approval Committee</h3>
      <p>Dear Approval Committee Member,</p>
      <p>You have been assigned to evaluate a new batch of proposals for final approval.</p>
      <ul>
        <li><b>Batch Name:</b> ${resolvedBatchName}</li>
        <li><b>Proposals to Review:</b> ${validSubs.length}</li>
      </ul>
      <p>Please click the secure link below to access the review portal:</p>
      <a href="${reviewLink}" style="padding: 10px 15px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 4px;">Start Evaluation</a>
      <br><br>
      <p>Or copy this link into your browser: <br>${reviewLink}</p>
      <hr />
      <p><small>This is an automated message from MINDScall.</small></p>
    `;

    // Send email to all approval reviewers - don't fail if email fails
    try {
      await sendEmail({
        email: reviewerEmails,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Approval email failed (non-fatal):', emailErr.message);
    }

    res.status(200).json(new ApiResponse(200, { approvalBatch, assignedCount: validSubs.length }, 'Approval Committee assigned and email sent successfully.'));
  } catch (err) {
    next(err);
  }
};
