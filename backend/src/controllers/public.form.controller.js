const Form = require('../models/Form.model');
const FormVersion = require('../models/FormVersion.model');
const Submission = require('../models/Submission.model');
const Counter = require('../models/Counter.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');

// @desc    Get form schema for public access
// @route   GET /api/v1/public/forms/:slug
// @access  Public
exports.getPublicForm = async (req, res, next) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug, status: 'PUBLISHED' });
    
    if (!form) {
      return next(new ApiError(404, 'Form not found or is not published'));
    }

    const activeVersion = await FormVersion.findOne({ form: form._id, isActive: true });

    if (!activeVersion) {
      return next(new ApiError(404, 'No active version found for this form'));
    }

    res.status(200).json(new ApiResponse(200, { form, schema: activeVersion.schema }, 'Form retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Submit answers to a form
// @route   POST /api/v1/public/forms/:slug/submit
// @access  Public
exports.submitForm = async (req, res, next) => {
  try {
    const { answers, submitterEmail } = req.body; // Expecting answers as a JSON string or object depending on frontend

    const form = await Form.findOne({ slug: req.params.slug, status: 'PUBLISHED' });
    if (!form) {
      return next(new ApiError(404, 'Form not found or is not published'));
    }

    const activeVersion = await FormVersion.findOne({ form: form._id, isActive: true });
    if (!activeVersion) {
      return next(new ApiError(404, 'No active version found to submit against'));
    }

    // Handle file uploads
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    // Parse answers if they come as string (due to multipart form data)
    let parsedAnswers = answers;
    if (typeof answers === 'string') {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (e) {
        return next(new ApiError(400, 'Invalid JSON format for answers'));
      }
    }

    // Determine submission type and generate businessId
    const subTypeRaw = parsedAnswers.submissionType || parsedAnswers.SubmissionType || 'Idea';
    const submissionType = subTypeRaw.toLowerCase().includes('prop') ? 'Proposal' : 'Idea';
    const counterId = submissionType === 'Proposal' ? 'PROP' : 'IDEA';

    // Resolve submitter email from new field names
    const resolvedSubmitterEmail = submitterEmail || parsedAnswers.officialEmail || parsedAnswers.managerEmail || '';

    const counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const businessId = `${counterId}-${String(counter.seq).padStart(3, '0')}`;

    // Generate dynamic tracking ID prefix from organization details
    const getAnswerValue = (answers, possibleKeys) => {
      if (!answers) return null;
      for (const key of possibleKeys) {
        if (answers[key]) return answers[key];
        const foundKey = Object.keys(answers).find(k => k.toLowerCase() === key.toLowerCase() || k.replace(/\s+/g, '').toLowerCase() === key.toLowerCase());
        if (foundKey && answers[foundKey]) return answers[foundKey];
      }
      return null;
    };

    const getFirstLetter = (str) => {
      if (typeof str !== 'string' || !str.trim()) return 'X';
      return str.trim().charAt(0).toUpperCase();
    };

    const deptVal = getAnswerValue(parsedAnswers, ['department', 'Department']);
    const subDeptVal = getAnswerValue(parsedAnswers, ['subDepartment', 'Sub Department', 'subCategory']);
    const subSubDeptVal = getAnswerValue(parsedAnswers, ['subSubDepartment', 'Sub Sub Department', 'category']);

    let trackingPrefix = `${getFirstLetter(deptVal)}${getFirstLetter(subDeptVal)}${getFirstLetter(subSubDeptVal)}`;
    
    // Fallback if none are found
    if (trackingPrefix === 'XXX') {
      trackingPrefix = submissionType === 'Proposal' ? 'MCP' : 'MCI';
    }

    const trackingId = `${trackingPrefix}-${String(counter.seq).padStart(3, '0')}`;

    // Build formData with labels from schema for downstream modules
    const formData = {};
    if (activeVersion.schema && Array.isArray(activeVersion.schema)) {
      for (const section of activeVersion.schema) {
        if (section.fields && Array.isArray(section.fields)) {
          for (const field of section.fields) {
            // Try matching by field ID first, then by label (camelCase)
            const labelKey = field.label ? field.label.replace(/\s+/g, '') : '';
            const labelCamel = labelKey.charAt(0).toLowerCase() + labelKey.slice(1);
            const val = parsedAnswers[field.id] ?? parsedAnswers[field.label] ?? parsedAnswers[labelCamel] ?? null;
            if (val !== null && val !== undefined && val !== '') {
              formData[field.label] = {
                fieldId: field.id,
                value: val,
                type: field.type || 'text',
                section: section.title || ''
              };
            }
          }
        }
      }
    }

    // Resolve employee name from new or legacy field keys
    const employeeName = parsedAnswers.employeeName || parsedAnswers.name || parsedAnswers.fullName || 'Employee';

    const submission = await Submission.create({
      form: form._id,
      formVersion: activeVersion._id,
      businessId,
      trackingId,
      submissionType,
      answers: parsedAnswers,
      formData,
      submitterEmail: resolvedSubmitterEmail,
      attachments: files,
      timeline: [
        {
          stage: 'Submission Created',
          actionBy: employeeName,
          role: 'Submitter',
          remarks: `${submissionType} submitted successfully.`
        }
      ]
    });

    // Send confirmation email if submitter email is available
    if (resolvedSubmitterEmail) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
          <h3 style="color: #1976D2;">MINDScall Submission Received</h3>
          <p>Dear ${employeeName},</p>
          <p>Thank you for your ${submissionType.toLowerCase()} submission.</p>
          <p>Your tracking ID is: <b>${trackingId}</b></p>
          <p>Your WBS Code is: <b>${businessId}</b></p>
          <p>You can track the progress of your submission at any time using the Public Tracking Portal.</p>
          <div style="margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track?id=${trackingId}" style="padding: 12px 24px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Track Submission</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="color: #888;"><small>Best regards,<br>CubeTech Innovation Team</small></p>
        </div>
      `;
      await sendEmail({
        email: resolvedSubmitterEmail,
        subject: `Submission Received: ${trackingId}`,
        html: emailHtml
      }).catch(err => console.error('Failed to send submission confirmation email:', err));
    }

    res.status(201).json(new ApiResponse(201, { submissionId: submission._id, trackingId, businessId }, 'Submission successful'));
  } catch (err) {
    next(err);
  }
};

// @desc    Track a submission by tracking ID
// @route   GET /api/v1/public/track/:trackingId
// @access  Public
exports.trackSubmission = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const submission = await Submission.findOne({ trackingId }).lean();
    
    if (!submission) {
      return next(new ApiError(404, 'No submission found with this Tracking ID'));
    }

    // Expose only necessary fields, hide ObjectIDs and sensitive info
    const safeData = {
      trackingId: submission.trackingId,
      title: submission.answers?.title || submission.answers?.projectTitle || submission.answers?.proposalTitle || submission.answers?.proposaltitle || submission.answers?.IdeaTitle || 'Untitled',
      submissionType: submission.submissionType,
      status: submission.status,
      createdAt: submission.createdAt,
      timeline: submission.timeline.map(t => ({
        stage: t.stage,
        actionBy: t.actionBy,
        role: t.role,
        remarks: t.remarks,
        timestamp: t.timestamp
      })),
      workflow: {
        rmReview: submission.workflow?.rmReview ? {
          reviewerName: submission.workflow.rmReview.reviewerName,
          decision: submission.workflow.rmReview.decision,
          remarks: submission.workflow.rmReview.remarks,
          timestamp: submission.workflow.rmReview.timestamp
        } : null,
        evaluationReview: submission.workflow?.evaluationReview ? {
          committeeName: submission.workflow.evaluationReview.committeeName,
          decision: submission.workflow.evaluationReview.decision,
          remarks: submission.workflow.evaluationReview.remarks,
          timestamp: submission.workflow.evaluationReview.timestamp
        } : null,
        financeReview: submission.workflow?.financeReview ? {
          reviewerName: submission.workflow.financeReview.reviewerName,
          decision: submission.workflow.financeReview.decision,
          remarks: submission.workflow.financeReview.remarks,
          timestamp: submission.workflow.financeReview.timestamp
        } : null
      },
      projectDetails: null
    };

    // If approved, expose R&D details
    if (['APPROVED', 'FINANCE_APPROVED', 'APPROVAL_COMMITTEE'].includes(submission.status)) {
      safeData.projectDetails = {
        owner: submission.projectDetails?.owner,
        implementationStatus: submission.projectDetails?.implementationStatus,
        progressPercentage: submission.projectDetails?.progressPercentage,
        latestUpdate: submission.projectDetails?.updates && submission.projectDetails.updates.length > 0 
          ? submission.projectDetails.updates[submission.projectDetails.updates.length - 1] 
          : null
      };
    }

    res.status(200).json(new ApiResponse(200, { tracking: safeData }, 'Tracking info retrieved successfully'));
  } catch (err) {
    next(err);
  }
};
