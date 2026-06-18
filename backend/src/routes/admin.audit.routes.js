const express = require('express');
const { getAuditLogs } = require('../controllers/admin.audit.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', getAuditLogs);

module.exports = router;
