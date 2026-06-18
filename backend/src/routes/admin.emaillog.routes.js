const express = require('express');
const { getEmailLogs } = require('../controllers/admin.emaillog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', getEmailLogs);

module.exports = router;
