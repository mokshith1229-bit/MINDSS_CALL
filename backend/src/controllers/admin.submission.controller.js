const Submission = require('../models/Submission.model');
const Form = require('../models/Form.model');
const Batch = require('../models/Batch.model');
const FinanceBatch = require('../models/FinanceBatch.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Parser } = require('json2csv');
const AuditLog = require('../models/AuditLog.model');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');
const fs = require('fs');
const path = require('path');

// @desc    Get all submissions (with filtering)
// @route   GET /api/v1/admin/submissions
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getSubmissions = async (req, res, next) => {
  try {
    const { formId, status, search } = req.query;

    let query = {};
    if (formId) query.form = formId;
    if (status) {
      // Support comma-separated statuses: ?status=EVALUATION,FINANCE_APPROVED
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        query.status = statuses[0];
      } else if (statuses.length > 1) {
        query.status = { $in: statuses };
      }
    }
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
        stage: eventName,
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
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
          stage: 'RM Approved',
          actionBy: reviewerName ? `${reviewerName} (${reviewerEmail})` : reviewerEmail,
          role: 'Reporting Manager',
          remarks: remarks || 'Reporting Manager approved the proposal.',
          timestamp: new Date()
        });
        submission.timeline.push({
          stage: 'Evaluation Started',
          actionBy: 'System',
          role: 'System',
          remarks: 'Proposal moved to Evaluation Committee queue.',
          timestamp: new Date()
        });
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

    // Delete associated files
    if (submission.attachments && submission.attachments.length > 0) {
      submission.attachments.forEach(file => {
        if (file.url) {
          const filePath = path.join(__dirname, '../../', file.url);
          fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
              console.error(`Failed to delete file ${filePath}:`, err);
            }
          });
        }
      });
    }

    // Remove this submission from any Batches or FinanceBatches
    await Batch.updateMany(
      { submissions: submission._id },
      { $pull: { submissions: submission._id } }
    );
    await FinanceBatch.updateMany(
      { submissions: submission._id },
      { $pull: { submissions: submission._id } }
    );

    // ── After deletion: reset counter to highest remaining seq ─────────────
    // This ensures the gap-filling logic in submitForm works correctly
    if (submission.businessId) {
      const parts = submission.businessId.split('-');
      const counterId = parts[0]; // 'IDEA' or 'PROP'
      if (counterId === 'IDEA' || counterId === 'PROP') {
        const remaining = await Submission.find(
          { businessId: { $regex: `^${counterId}-` } },
          { businessId: 1, _id: 0 }
        ).lean();
        const maxSeq = remaining.reduce((max, s) => {
          const n = parseInt((s.businessId?.split('-') || [])[1], 10);
          return !isNaN(n) && n > max ? n : max;
        }, 0);
        await require('../models/Counter.model').findByIdAndUpdate(
          { _id: counterId },
          { $set: { seq: maxSeq } },
          { upsert: true }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────

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
    const { decision, remarks, reviewerName, reviewers, approvedBudget } = req.body;
    
    if (!['APPROVED', 'REJECTED', 'CLARIFICATION'].includes(decision)) {
      return next(new ApiError(400, 'Invalid decision. Must be APPROVED, REJECTED, or CLARIFICATION'));
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
      reviewers,
      remarks,
      approvedBudget: approvedBudget !== undefined && approvedBudget !== null ? Number(approvedBudget) : null,
      decision,
      timestamp: new Date()
    };

    let eventName = '';
    let statusUpdate = '';

    if (decision === 'APPROVED') {
      statusUpdate = 'APPROVAL_COMMITTEE';
      eventName = 'Finance Approved';
    } else if (decision === 'REJECTED') {
      statusUpdate = 'REJECTED';
      eventName = 'Finance Rejected';
    } else if (decision === 'CLARIFICATION') {
      statusUpdate = 'REVIEWING';
      eventName = 'Needs Revision';
      
      // Send email to selected reviewers
      if (reviewers && reviewers.length > 0) {
        const title = (submission.answers && (submission.answers.title || submission.answers.proposaltitle)) || 'Untitled Proposal';
        const businessId = submission.businessId || `SUB-${submission._id.toString().substring(18).toUpperCase()}`;
        const emailSubject = `Clarification Requested for Proposal: ${businessId}`;
        
        const ans = submission.answers || {};
        const findVal = (keywords) => {
          for (const key of Object.keys(ans)) {
            const kLower = key.toLowerCase();
            if (keywords.some(kw => kLower.includes(kw))) return ans[key];
          }
          return null;
        };

        const userBudget = findVal(['budget', 'amount', 'cost', 'capex', 'opex']) || 'Not Specified';
        const committeeBudget = submission.workflow?.financeReview?.approvedBudget 
          ? `₹ ${Number(submission.workflow.financeReview.approvedBudget).toLocaleString('en-IN')}` 
          : 'Not Allotted';

        let detailsHtml = '';
        Object.entries(ans).forEach(([key, value]) => {
           if (typeof value !== 'object' && value !== '' && value != null) {
              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              detailsHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">${formattedKey}</td><td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${value}</td></tr>`;
           }
        });

        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
            <h3 style="color: #1976D2;">MINDScall Finance Clarification</h3>
            <p>Hello,</p>
            <p>Clarification has been requested for the following proposal during Finance Review:</p>
            
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Proposal ID</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${businessId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Title</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">User Estimated Budget</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userBudget}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Committee Allotted Budget</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>${committeeBudget}</b></td>
              </tr>
            </table>

            <p style="font-weight: bold; color: #E65100; margin-top: 20px;">Clarification Remarks from Finance:</p>
            <blockquote style="border-left: 4px solid #E65100; padding-left: 15px; margin-left: 0; color: #333; background-color: #FFF3E0; padding: 10px; border-radius: 4px;">
              ${remarks || 'No remarks provided.'}
            </blockquote>
            
            <h4 style="margin-top: 30px; border-bottom: 2px solid #1976D2; padding-bottom: 5px;">Detailed Proposal Information</h4>
            <table style="border-collapse: collapse; width: 100%; text-align: left; font-size: 14px;">
              <tbody>
                ${detailsHtml}
              </tbody>
            </table>

            <p style="margin-top: 30px;">Please review the proposal in the MINDScall system and provide the necessary details by replying or logging into the portal.</p>
            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
            <p style="color: #888;"><small>This is an automated message from MINDScall.</small></p>
          </div>
        `;
        
        await sendEmail({
          email: reviewers.join(', '),
          subject: emailSubject,
          html: emailHtml
        }).catch(err => console.error('Failed to send finance clarification email:', err));
      }
    }

    submission.status = statusUpdate;
    const actorStr = reviewers && reviewers.length > 0 ? reviewers.join(', ') : (reviewerName || req.user?.email || 'Finance Reviewer');
    submission.timeline.push({
      stage: eventName,
      actionBy: actorStr,
      role: 'Finance Committee',
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
      stage: 'RM Assigned',
      actionBy: req.user?.email || 'Admin',
      role: 'Admin',
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

// @desc    Auto assign all pending proposals to an RM and send one email
// @route   POST /api/v1/admin/submissions/auto-assign-rm
// @access  Private (SUPER_ADMIN, ADMIN)
exports.autoAssignRM = async (req, res, next) => {
  try {
    const { email, managerName, proposalIds } = req.body;
    
    if (!email || !proposalIds || proposalIds.length === 0) {
      return next(new ApiError(400, 'Email and proposalIds are required'));
    }

    const submissions = await Submission.find({ _id: { $in: proposalIds } });
    
    if (submissions.length === 0) {
      return next(new ApiError(404, 'No valid submissions found to assign'));
    }

    const links = [];
    
    // Generate ONE master token for this entire batch of assignments
    const masterToken = crypto.randomBytes(24).toString('hex');

    for (const sub of submissions) {
      sub.status = 'AWAITING_RM_REVIEW';
      if (!sub.workflow) sub.workflow = {};
      sub.workflow.rmMasterToken = masterToken; // Set the master token
      
      // We can also generate a distinct RM review token per submission just in case individual processing is still used,
      // but for RM batch review we rely on rmMasterToken.
      sub.workflow.rmReviewToken = crypto.randomBytes(24).toString('hex');

      sub.timeline.push({
        stage: 'RM Assigned (Auto Batch)',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Auto-assigned to RM: ${managerName || email} (${email}) in batch`,
        timestamp: new Date()
      });

      // --- HOD Auto Assignment ---
      const hodToken = crypto.randomBytes(24).toString('hex');
      sub.workflow.hodReviewToken = hodToken;
      const hodEmail = sub.answers?.hodEmail || '';
      const hodName = sub.answers?.hodName || 'HOD';

      sub.timeline.push({
        stage: 'HOD Assigned (Auto)',
        actionBy: req.user?.email || 'Admin',
        role: 'Admin',
        remarks: `Auto-assigned to HOD: ${hodName} (${hodEmail}) alongside RM`,
        timestamp: new Date()
      });

      await sub.save();
      
      // Dispatch HOD email immediately (as requested by user)
      if (hodEmail) {
        const hodReviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/review/${hodToken}`;
        const hodEmailHtml = `
          <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
            <h3 style="color: #1976D2;">MINDScall Proposal Review</h3>
            <p>Dear ${hodName},</p>
            <p>A new proposal <b>${sub.answers?.title || sub.answers?.proposaltitle || 'Untitled'}</b> has been submitted and requires your review.</p>
            <div style="margin: 25px 0;">
              <a href="${hodReviewLink}" style="padding: 12px 24px; background-color: #F57C00; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Proposal</a>
            </div>
            <p>Please note that this proposal was auto-assigned.</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="color: #888;"><small>Best regards,<br>CubeTech Innovation Team</small></p>
          </div>
        `;
        
        sendEmail({
          email: hodEmail,
          subject: `MINDScall: Action Required - Proposal Needs HOD Approval`,
          html: hodEmailHtml
        }).catch(err => console.error('Failed to send HOD auto-assign email:', err));
      }
      
      links.push(`<li style="margin-bottom: 5px;">
        <b>${sub.businessId || 'Proposal'}</b> - ${sub.answers?.title || sub.answers?.proposaltitle || 'Untitled'}
      </li>`);
    }
    
    const masterReviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/rm-batch-review/${masterToken}`;

    // Send email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
        <h3 style="color: #1976D2;">MINDScall Proposal Review</h3>
        <p>Dear ${managerName || 'Manager'},</p>
        <p>You have been assigned <b>${submissions.length} new proposal(s)</b> to review.</p>
        <p>Please click the secure Master Link below to access the review portal and process all your proposals:</p>
        
        <div style="margin: 25px 0;">
          <a href="${masterReviewLink}" style="padding: 12px 24px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">Open Review Portal</a>
        </div>
        
        <p>Proposals included in this batch:</p>
        <ul style="padding-left: 20px;">
          ${links.join('')}
        </ul>
        <br>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="color: #888;"><small>Best regards,<br>CubeTech Innovation Team</small></p>
      </div>
    `;

    await sendEmail({
      email,
      subject: `MINDScall: Action Required - ${submissions.length} Proposals Assigned for Review`,
      html: emailHtml
    });

    res.status(200).json(new ApiResponse(200, { assignedCount: submissions.length, masterToken }, 'Auto-assigned successfully and master email sent.'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update project details
// @route   PATCH /api/v1/admin/submissions/:id/project-details
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateProjectDetails = async (req, res, next) => {
  try {
    const { owner, implementationStatus, progressPercentage, updateText, expectedBenefits, actualBenefits } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.projectDetails) {
      submission.projectDetails = {};
    }

    if (owner !== undefined) submission.projectDetails.owner = owner;
    if (implementationStatus !== undefined) submission.projectDetails.implementationStatus = implementationStatus;
    if (progressPercentage !== undefined) submission.projectDetails.progressPercentage = Number(progressPercentage);
    if (expectedBenefits !== undefined) submission.projectDetails.expectedBenefits = expectedBenefits;
    if (actualBenefits !== undefined) submission.projectDetails.actualBenefits = actualBenefits;

    if (updateText) {
      if (!submission.projectDetails.updates) submission.projectDetails.updates = [];
      submission.projectDetails.updates.push({
        text: updateText,
        user: req.user?.name || req.user?.email || 'Admin',
        timestamp: new Date()
      });
    }

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Project details updated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Add a project update with attachments
// @route   POST /api/v1/admin/submissions/:id/project-updates
// @access  Private (SUPER_ADMIN, ADMIN)
exports.addProjectUpdate = async (req, res, next) => {
  try {
    const { title, description, progressPercentage } = req.body;
    const progressNum = Number(progressPercentage) || 0;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    if (!submission.projectDetails) {
      submission.projectDetails = {};
    }
    if (!submission.projectDetails.updates) {
      submission.projectDetails.updates = [];
    }

    const updatedBy = req.user?.name || req.user?.email || 'Admin';

    const newUpdate = {
      title: title || 'Project Update',
      description,
      progressPercentage: progressNum,
      updatedBy,
      timestamp: new Date(),
      attachments: files,
    };

    // Add to beginning of updates array so it's intrinsically reverse chronological or let frontend handle it
    // Usually backend pushes and frontend reverses. We will just push.
    submission.projectDetails.updates.push(newUpdate);
    submission.projectDetails.progressPercentage = progressNum;

    // Calculate implementation status based on progress
    let newStatus = 'Approved';
    if (progressNum === 0) newStatus = 'Approved';
    else if (progressNum > 0 && progressNum <= 25) newStatus = 'Planning';
    else if (progressNum > 25 && progressNum <= 75) newStatus = 'In Progress';
    else if (progressNum > 75 && progressNum < 100) newStatus = 'Near Completion';
    else if (progressNum === 100) newStatus = 'Completed';

    submission.projectDetails.implementationStatus = newStatus;

    // Add timeline event
    submission.timeline.push({
      stage: 'Project Update',
      actionBy: updatedBy,
      role: 'Project Owner / Admin',
      remarks: `Progress updated to ${progressNum}%. Status is now ${newStatus}. ${title ? `(${title})` : ''}`,
      timestamp: new Date()
    });

    await submission.save();

    res.status(201).json(new ApiResponse(201, { submission }, 'Project update added successfully'));
  } catch (err) {
    next(err);
  }
};


// @desc    Schedule a review meeting for an ongoing project
// @route   POST /api/v1/admin/submissions/:id/schedule-meeting
// @access  Private (SUPER_ADMIN, ADMIN)
exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { title, agenda, date, time, duration, platform, link, participants, notes } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.projectDetails) {
      submission.projectDetails = {};
    }
    if (!submission.projectDetails.meetings) {
      submission.projectDetails.meetings = [];
    }
    if (!submission.projectDetails.updates) {
      submission.projectDetails.updates = [];
    }

    const meeting = {
      title,
      agenda,
      date,
      time,
      duration,
      platform,
      link,
      participants: Array.isArray(participants) ? participants : participants.split(',').map(p => p.trim()),
      notes,
      status: 'Scheduled'
    };

    submission.projectDetails.meetings.push(meeting);

    // Add timeline update
    submission.timeline.push({
      stage: 'Meeting Scheduled',
      actionBy: req.user?.email || 'Admin',
      role: 'System',
      remarks: `Meeting "${title}" scheduled for ${date} at ${time}.`
    });
    
    // R&D ongoing projects also uses 'updates' array for timeline
    submission.projectDetails.updates.push({
      title: 'Meeting Scheduled',
      description: `Meeting "${title}" has been scheduled for ${date} at ${time} via ${platform}.`,
      updatedBy: req.user?.email || 'Admin',
      progressPercentage: submission.projectDetails.progressPercentage || 0
    });

    await submission.save();

    // Send emails to participants
    const subject = `Meeting Invitation: ${title} - ${submission.businessId || 'Project'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0078D4;">Meeting Invitation</h2>
        <p>You have been invited to a review meeting for an ongoing R&D project.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0078D4; margin: 20px 0;">
          <p><strong>Project Name:</strong> ${submission.formData && typeof submission.formData === 'object' && !Array.isArray(submission.formData) ? (Object.entries(submission.formData).find(([k]) => k.toLowerCase().includes('title'))?.[1] || 'N/A') : (Array.isArray(submission.formData) ? submission.formData.find(f => f.label?.toLowerCase().includes('title'))?.value : 'N/A')}</p>
          <p><strong>Project ID:</strong> ${submission.businessId || 'N/A'}</p>
          <p><strong>Meeting Title:</strong> ${title}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time} (${duration})</p>
          <p><strong>Platform:</strong> ${platform}</p>
          <p><strong>Agenda:</strong> ${agenda || 'No agenda provided.'}</p>
        </div>
        ${link ? `
        <div style="text-align: center; margin-top: 30px;">
          <a href="${link}" style="background-color: #0078D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Join Meeting</a>
        </div>
        ` : ''}
        <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated message from the MINDScall System. Please do not reply directly to this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: meeting.participants,
        subject,
        html,
        message: `Meeting Scheduled: ${title} on ${date} at ${time}`
      });
    } catch (emailErr) {
      console.error('Failed to send meeting invites:', emailErr);
      // We don't fail the request if email fails, but we should probably inform
    }

    res.status(200).json(new ApiResponse(200, { submission }, 'Meeting scheduled and invites sent'));
  } catch (err) {
    next(err);
  }
};

// @desc    Complete a review meeting
// @route   POST /api/v1/admin/submissions/:id/complete-meeting
// @access  Private (SUPER_ADMIN, ADMIN)
exports.completeMeeting = async (req, res, next) => {
  try {
    const { meetingId, attendees, discussionSummary, keyDecisions, actionItems, nextSteps, risksIdentified, nextMeetingDate } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    const meeting = submission.projectDetails.meetings.id(meetingId);
    if (!meeting) {
      return next(new ApiError(404, 'Meeting not found'));
    }

    meeting.status = 'Completed';
    meeting.completionDetails = {
      attendees,
      discussionSummary,
      keyDecisions,
      actionItems,
      nextSteps,
      risksIdentified,
      nextMeetingDate
    };

    // Format description for the timeline update
    let timelineDesc = '';
    if (discussionSummary) timelineDesc += `*Discussion Summary:*\n${discussionSummary}\n\n`;
    if (keyDecisions) timelineDesc += `*Key Decisions:*\n${keyDecisions}\n\n`;
    if (actionItems) timelineDesc += `*Action Items:*\n${actionItems}\n\n`;
    if (nextMeetingDate) timelineDesc += `*Next Meeting Date:* ${nextMeetingDate}`;

    submission.projectDetails.updates.push({
      title: `Meeting Completed: ${meeting.title}`,
      description: timelineDesc.trim() || 'Meeting completed with no notes.',
      updatedBy: req.user?.email || 'Admin',
      progressPercentage: submission.projectDetails.progressPercentage || 0,
      attachments: []
    });

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Meeting marked as completed'));
  } catch (err) {
    next(err);
  }
};
