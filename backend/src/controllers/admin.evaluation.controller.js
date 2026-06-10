const Committee = require('../models/Committee.model');
const Batch = require('../models/Batch.model');
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
    
    // As per requirement: keep status as PENDING until reviewers take action
    // batch.status = 'EMAIL_SENT';
    // await batch.save();
    
    // Log timeline event for each submission
    const submissions = await Submission.find({ _id: { $in: batch.submissions } });
    for (const sub of submissions) {
      sub.timeline.push({
        event: 'Batch Assigned & Email Sent',
        actor: req.user?.email || 'Admin',
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

      // Log success
      await EmailLog.create({
        batchId: batch._id,
        recipients,
        status: 'SUCCESS'
      });

      res.status(200).json(new ApiResponse(200, { batch }, 'Batch email sent successfully'));
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      
      // Log failure
      await EmailLog.create({
        batchId: batch._id,
        recipients,
        status: 'FAILED',
        error: emailError.message
      });

      return next(new ApiError(500, 'Failed to send email. Batch remains in PENDING status.'));
    }
  } catch (err) {
    next(err);
  }
};
