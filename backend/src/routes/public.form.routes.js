const express = require('express');
const { getPublicForm, submitForm, trackSubmission, previewWbsCode } = require('../controllers/public.form.controller');
const upload = require('../middlewares/upload.middleware');
const { uploadToS3 } = require('../middlewares/s3.middleware');

const router = express.Router();

// No protect/authorize middleware needed, these are public

router.route('/track/:trackingId')
  .get(trackSubmission);

router.route('/wbs/preview')
  .get(previewWbsCode);

router.route('/:slug')
  .get(getPublicForm);

router.route('/:slug/submit')
  .post(
    upload.array('attachments', 10), // Allow up to 10 files
    uploadToS3,
    submitForm
  );

module.exports = router;
