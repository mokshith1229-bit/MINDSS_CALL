const express = require('express');
const { getSubmissions, getSubmission, updateSubmissionStatus, updateSubmissionReview, exportSubmissionsCSV, deleteSubmission, assignSubmissionEmail, updateFinanceReview } = require('../controllers/admin.submission.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.route('/')
  .get(getSubmissions);

router.route('/export/:formId')
  .get(auditLog('EXPORT_SUBMISSIONS_CSV', 'Submission'), exportSubmissionsCSV);

router.route('/:id')
  .get(getSubmission)
  .delete(auditLog('DELETE_SUBMISSION', 'Submission'), deleteSubmission);

router.route('/:id/status')
  .patch(auditLog('UPDATE_SUBMISSION_STATUS', 'Submission'), updateSubmissionStatus);

router.route('/:id/review')
  .patch(auditLog('UPDATE_SUBMISSION_REVIEW', 'Submission'), updateSubmissionReview);

router.route('/:id/assign-email')
  .patch(auditLog('ASSIGN_SUBMISSION_EMAIL', 'Submission'), assignSubmissionEmail);

router.route('/:id/finance-review')
  .patch(auditLog('UPDATE_FINANCE_REVIEW', 'Submission'), updateFinanceReview);

module.exports = router;
