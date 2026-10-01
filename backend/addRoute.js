const fs = require('fs');
const path = './src/controllers/public.form.controller.js';
let content = fs.readFileSync(path, 'utf8');

const appendContent = `

// @desc    Add attachments to a submission
// @route   POST /api/v1/public/forms/track/:trackingId/attachments
// @access  Public
exports.addAttachments = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const submission = await Submission.findOne({ trackingId });
    if (!submission) return next(new ApiError(404, 'Submission not found'));

    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, 'No files provided'));
    }

    const files = req.files.map((file) => ({
      filename: file.originalname,
      url: file.location ? file.location : \`/uploads/\${file.filename}\`,
      mimetype: file.mimetype,
      size: file.size,
      storageProvider: file.location ? 's3' : 'local',
      objectKey: file.key || null
    }));

    submission.attachments.push(...files);
    
    submission.timeline.push({
      stage: 'Attachment Added',
      actionBy: 'Submitter',
      role: 'Submitter',
      remarks: 'Additional attachment uploaded via tracking portal.',
      timestamp: new Date()
    });

    await submission.save();

    res.status(200).json(new ApiResponse(200, null, 'Attachments added successfully'));
  } catch (err) {
    next(err);
  }
};
`;

if (!content.includes('exports.addAttachments')) {
  fs.writeFileSync(path, content + appendContent);
}
console.log('Added addAttachments.');
