const express = require('express');
const {
  createMeetingRequest,
  getMeetingRequestStatus,
  getAllMeetingRequests,
  updateMeetingRequestStatus
} = require('../controllers/meetingRequest.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// --- PUBLIC ROUTES (No auth required) ---
// Note: We use a specific prefix in server.js for these to avoid auth issues,
// but we define them here in the same file for logical grouping.
// /api/v1/public/meeting-requests
router.post('/public', upload.single('attachment'), createMeetingRequest);
router.get('/public/:trackingId', getMeetingRequestStatus);

// --- ADMIN ROUTES (Auth required) ---
// /api/v1/admin/meeting-requests
router.get('/admin', protect, authorize('SUPER_ADMIN', 'ADMIN'), getAllMeetingRequests);
router.patch('/admin/:id/status', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateMeetingRequestStatus);

module.exports = router;
