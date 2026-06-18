const Committee = require('../models/Committee.model');
const Batch = require('../models/Batch.model');
const FinanceBatch = require('../models/FinanceBatch.model');
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
    const { name, members } = req.body;
    const committee = await Committee.create({ name, members });
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
    const { name, members } = req.body;
    const committee = await Committee.findByIdAndUpdate(
      req.params.id,
      { name, members },
      { new: true, runValidators: true }
    );
    if (!committee) {
      return next(new ApiError(404, 'Committee not found'));
    }
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

// =========================
// BATCH MANAGEMENT
// =========================

exports.createBatch = async (req, res, next) => {
  try {
    const { name, committeeId, submissionIds } = req.body;
    
    // Validate committee exists
    const committee = await Committee.findById(committeeId);
    if (!committee) {
      return next(new ApiError(404, 'Committee not found'));
    }

    const reviewToken = crypto.randomBytes(24).toString('hex');

    const batch = await Batch.create({
      name,
      committeeId,
      submissions: submissionIds || [],
      reviewToken
    });

    res.status(201).json(new ApiResponse(201, { batch }, 'Batch created successfully'));
  } catch (err) {
    next(err);
  }
};

exports.getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find()
      .populate('committeeId', 'name members')
      .populate('submissions')
      .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { batches }, 'Batches retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

exports.sendBatchEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id).populate('committeeId');
    
    if (!batch) {
      return next(new ApiError(404, 'Batch not found'));
    }
    
    if (!batch.committeeId) {
      return next(new ApiError(400, 'Committee associated with this batch was not found.'));
    }
    
    // Update status so that the "Send Email" button is disabled on the frontend
    batch.status = 'EMAIL_SENT';
    await batch.save();
    
    // Log timeline event for each submission
    const submissions = await Submission.find({ _id: { $in: batch.submissions } });
    for (const sub of submissions) {
      sub.timeline.push({
        stage: 'Evaluation Assigned',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to ${batch.committeeId?.name || 'Committee'} in Batch: ${batch.name}`,
        timestamp: new Date()
      });
      await sub.save();
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const reviewLink = `${frontendUrl}/batch-review/${batch.reviewToken}`;
    const recipients = batch.committeeId.members;
    
    const emailSubject = `MINDScall: Evaluation Required for Batch ${batch.name}`;
    const emailHtml = `
      <h3>MINDScall Proposal Evaluation</h3>
      <p>Hello Committee Members (${batch.committeeId.name}),</p>
      <p>You have been assigned to evaluate a new batch of proposals.</p>
      <ul>
        <li><b>Batch Name:</b> ${batch.name}</li>
        <li><b>Proposals to Review:</b> ${batch.submissions.length}</li>
      </ul>
      <p>Please click the secure link below to access the review portal:</p>
      <a href="${reviewLink}" style="padding: 10px 15px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 4px;">Start Evaluation</a>
      <br><br>
      <p>Or copy this link into your browser: <br>${reviewLink}</p>
      <hr />
      <p><small>This is an automated message from MINDScall.</small></p>
    `;

    try {
      await sendEmail({
        email: recipients.join(', '),
        subject: emailSubject,
        html: emailHtml
      });

      res.status(200).json(new ApiResponse(200, { batch }, 'Batch email sent successfully'));
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      
      return next(new ApiError(500, 'Failed to send email. Batch remains in PENDING status.'));
    }
  } catch (err) {
    next(err);
  }
};

// =========================
// AUTO ASSIGN COMMITTEE
// =========================

exports.autoAssignCommittee = async (req, res, next) => {
  try {
    const { committeeId, submissionIds, batchName } = req.body;

    if (!committeeId || !submissionIds || submissionIds.length === 0) {
      return next(new ApiError(400, 'committeeId and submissionIds are required'));
    }

    const committee = await Committee.findById(committeeId);
    if (!committee) {
      return next(new ApiError(404, 'Committee not found'));
    }

    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found'));
    }

    // Create a batch for this assignment
    const reviewToken = crypto.randomBytes(24).toString('hex');
    const resolvedBatchName = batchName || `Auto-Batch ${new Date().toLocaleDateString('en-IN')}`;
    const batch = await Batch.create({
      name: resolvedBatchName,
      committeeId,
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
      sub.workflow.evaluationReview.committeeName = committee.name;
      sub.timeline.push({
        stage: 'Sent to Evaluation Committee',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Assigned to committee: ${committee.name} in batch: ${resolvedBatchName}`,
        timestamp: new Date()
      });
      await sub.save();

      const title = sub.answers?.title || sub.answers?.proposaltitle || sub.businessId || 'Untitled';
      links.push(`<li style="margin-bottom:5px;"><b>${sub.businessId || 'Proposal'}</b> – ${title}</li>`);
    }

    // Send email to all committee members
    const emailSubject = `MINDScall: Evaluation Required for Batch ${resolvedBatchName}`;
    const emailHtml = `
      <h3>MINDScall Proposal Evaluation</h3>
      <p>Hello Committee Members (${committee.name}),</p>
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
      email: committee.members.join(', '),
      subject: emailSubject,
      html: emailHtml
    });

  
  res.status(200).json(new ApiResponse(200, { batch, assignedCount: submissions.length }, 'Auto-assigned to committee and email sent successfully.'));
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
