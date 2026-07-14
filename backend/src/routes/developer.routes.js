const express = require('express');
const {
  getVisibility,
  updateVisibility,
  bulkUpdateVisibility,
  seedDefaults,
  resetDefaults,
} = require('../controllers/developer.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET visibility config — available to ALL authenticated users (needed for sidebar)
router.get('/visibility', protect, getVisibility);

// All write operations — DEVELOPER only
router.put('/visibility/bulk',  protect, authorize('DEVELOPER'), bulkUpdateVisibility);
router.put('/visibility/:featureKey', protect, authorize('DEVELOPER'), updateVisibility);
router.post('/visibility/seed',  protect, authorize('DEVELOPER'), seedDefaults);
router.post('/visibility/reset', protect, authorize('DEVELOPER'), resetDefaults);

module.exports = router;
