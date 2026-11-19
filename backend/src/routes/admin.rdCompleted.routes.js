const express = require('express');
const {
  getImports,
  getImportById,
  createImport,
  deleteImport,
  updateImport,
  downloadImportFile,
} = require('../controllers/admin.rdCompleted.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// All routes require authentication and appropriate role
router.use(protect);
router.use(authorize('DEVELOPER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/', getImports);
router.get('/:id', getImportById);
router.put('/:id', auditLog('UPDATE_RD_COMPLETED_IMPORT', 'RDCompletedImport'), updateImport);
router.get('/:id/download', downloadImportFile);

router.post(
  '/import',
  upload.single('file'),
  auditLog('IMPORT_RD_COMPLETED_EXCEL', 'RDCompletedImport'),
  createImport
);

router.delete(
  '/:id',
  auditLog('DELETE_RD_COMPLETED_IMPORT', 'RDCompletedImport'),
  deleteImport
);

module.exports = router;
