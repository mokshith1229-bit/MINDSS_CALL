const express = require('express');
const {
  getSchedules,
  checkAvailability,
  requestSchedule,
  approveSchedule,
  rejectSchedule,
  requestChanges,
} = require('../controllers/admin.schedule.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(getSchedules)
  .post(requestSchedule);

router.route('/check-availability')
  .post(checkAvailability);

// Lab Manager Actions
router.route('/:id/approve')
  .post(authorize('SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'HOD'), approveSchedule);

router.route('/:id/reject')
  .post(authorize('SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'HOD'), rejectSchedule);

router.route('/:id/request-changes')
  .post(authorize('SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'HOD'), requestChanges);

module.exports = router;
