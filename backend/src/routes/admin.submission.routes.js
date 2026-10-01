const express = require('express');
const { getSubmissions, getSubmission, updateSubmissionStatus, updateSubmissionReview, exportSubmissionsCSV, deleteSubmission, assignSubmissionEmail, updateFinanceReview, updateProjectDetails, addProjectUpdate, scheduleMeeting, completeMeeting, addTestMatrix, addSample, updateTestMatrixStatus } = require('../controllers/admin.submission.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');
const upload = require('../middlewares/upload.middleware');
const { uploadToS3 } = require('../middlewares/s3.middleware');

const router = express.Router();

router.use(protect);

const allInternalRoles = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'];
const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'];

router.route('/')
  .get(authorize(...allInternalRoles), getSubmissions);

router.route('/export/:formId')
  .get(authorize(...adminRoles), auditLog('EXPORT_SUBMISSIONS_CSV', 'Submission'), exportSubmissionsCSV);

router.route('/auto-assign-rm')
  .post(authorize(...adminRoles), auditLog('AUTO_ASSIGN_RM', 'Submission'), require('../controllers/admin.submission.controller').autoAssignRM);

router.route('/:id')
  .get(authorize(...allInternalRoles), getSubmission)
  .delete(authorize(...adminRoles), auditLog('DELETE_SUBMISSION', 'Submission'), deleteSubmission);

router.route('/:id/status')
  .patch(authorize(...adminRoles), auditLog('UPDATE_SUBMISSION_STATUS', 'Submission'), updateSubmissionStatus);

router.route('/:id/review')
  .patch(authorize(...allInternalRoles), auditLog('UPDATE_SUBMISSION_REVIEW', 'Submission'), updateSubmissionReview);

router.route('/:id/assign-email')
  .patch(authorize(...adminRoles), auditLog('ASSIGN_SUBMISSION_EMAIL', 'Submission'), assignSubmissionEmail);

router.route('/:id/finance-review')
  .patch(authorize(...allInternalRoles), auditLog('UPDATE_FINANCE_REVIEW', 'Submission'), updateFinanceReview);

router.route('/:id/project-details')
  .patch(authorize(...allInternalRoles), auditLog('UPDATE_PROJECT_DETAILS', 'Submission'), updateProjectDetails);

router.route('/:id/project-updates')
  .post(
    authorize(...allInternalRoles),
    auditLog('ADD_PROJECT_UPDATE', 'Submission'),
    upload.array('attachments', 5),
    uploadToS3,
    addProjectUpdate
  );

router.route('/:id/test-matrix')
  .post(
    authorize(...allInternalRoles),
    auditLog('ADD_TEST_MATRIX', 'Submission'),
    upload.array('attachments', 5),
    uploadToS3,
    addTestMatrix
  );

router.route('/:id/test-matrix/:testId/status')
  .patch(
    authorize(...allInternalRoles),
    auditLog('UPDATE_TEST_MATRIX_STATUS', 'Submission'),
    updateTestMatrixStatus
  );

router.route('/:id/samples')
  .post(
    authorize(...allInternalRoles),
    auditLog('ADD_SAMPLE', 'Submission'),
    upload.array('attachments', 5),
    uploadToS3,
    addSample
  );

router.route('/:id/schedule-meeting')
  .post(authorize(...allInternalRoles), auditLog('SCHEDULE_MEETING', 'Submission'), scheduleMeeting);

router.route('/:id/complete-meeting')
  .post(authorize(...allInternalRoles), auditLog('COMPLETE_MEETING', 'Submission'), completeMeeting);

module.exports = router;
