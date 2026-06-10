const express = require('express');
const { createForm, getForms, updateFormMetadata, publishNewVersion, getFormVersions, restoreVersion, deleteForm } = require('../controllers/admin.form.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

// All routes are protected and restricted to Admins
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.route('/')
  .post(auditLog('CREATE_FORM', 'Form'), createForm)
  .get(getForms);

router.route('/:id')
  .patch(auditLog('UPDATE_FORM_METADATA', 'Form'), updateFormMetadata)
  .delete(auditLog('DELETE_FORM', 'Form'), deleteForm);

router.route('/:id/versions')
  .get(getFormVersions)
  .put(auditLog('PUBLISH_FORM_VERSION', 'FormVersion'), publishNewVersion);

router.route('/:id/versions/:version/restore')
  .post(auditLog('RESTORE_FORM_VERSION', 'FormVersion'), restoreVersion);

module.exports = router;
