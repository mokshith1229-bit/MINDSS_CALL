const express = require('express');
const { getAdminIdeas, updateIdeaVisibility } = require('../controllers/admin.publicIdeas.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

router.use(protect);

const allInternalRoles = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'];

router.route('/')
  .get(authorize(...allInternalRoles), getAdminIdeas);

router.route('/:id/visibility')
  .patch(authorize(...allInternalRoles), auditLog('UPDATE_IDEA_VISIBILITY', 'Submission'), updateIdeaVisibility);

module.exports = router;
