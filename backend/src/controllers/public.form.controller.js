const Form = require('../models/Form.model');
const FormVersion = require('../models/FormVersion.model');
const Submission = require('../models/Submission.model');
const Counter = require('../models/Counter.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

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

    const counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const businessId = `${counterId}-${String(counter.seq).padStart(3, '0')}`;

    const submission = await Submission.create({
      form: form._id,
      formVersion: activeVersion._id,
      businessId,
      submissionType,
      answers: parsedAnswers,
      submitterEmail: submitterEmail || '',
      attachments: files,
      timeline: [
        {
          event: 'Submitted',
          actor: submitterEmail || parsedAnswers.name || parsedAnswers.fullName || 'Employee',
          remarks: 'Proposal submitted successfully.'
        }
      ]
    });

    res.status(201).json(new ApiResponse(201, { submissionId: submission._id }, 'Submission successful'));
  } catch (err) {
    next(err);
  }
};
