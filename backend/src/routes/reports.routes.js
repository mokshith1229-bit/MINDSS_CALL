const express = require('express');
const { exportExcel, exportCSV, getSummary } = require('../controllers/reports.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

// KPI summary for the Reports dashboard
router.get('/summary', getSummary);

// Export endpoints
router.get('/export/excel', auditLog('EXPORT_EXCEL', 'Report'), exportExcel);
router.get('/export/csv',   auditLog('EXPORT_CSV',   'Report'), exportCSV);

module.exports = router;
