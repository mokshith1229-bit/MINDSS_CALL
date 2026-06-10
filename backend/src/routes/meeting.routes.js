const express = require('express');
const { getMeetings, createMeeting, updateMeeting } = require('../controllers/meeting.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.route('/')
  .get(getMeetings)
  .post(
    authorize('SUPER_ADMIN', 'ADMIN'),
    auditLog('SCHEDULE_MEETING', 'Meeting'),
    createMeeting
  );

router.route('/:id')
  .patch(
    authorize('SUPER_ADMIN', 'ADMIN'),
    auditLog('UPDATE_MEETING', 'Meeting'),
    updateMeeting
  );

module.exports = router;
