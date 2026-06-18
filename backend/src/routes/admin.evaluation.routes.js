const express = require('express');
const {
  createCommittee,
  getCommittees,
  updateCommittee,
  deleteCommittee,
  createBatch,
  getBatches,
  sendBatchEmail,
  autoAssignCommittee,
  autoAssignEvalByEmail,
  autoAssignFinance,
  getFinanceBatches
} = require('../controllers/admin.evaluation.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply auth middlewares to all routes
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

// Committee Routes
router.post('/committees', createCommittee);
router.get('/committees', getCommittees);
router.patch('/committees/:id', updateCommittee);
router.delete('/committees/:id', deleteCommittee);

// Batch Routes
router.post('/batches', createBatch);
router.get('/batches', getBatches);
router.post('/batches/:id/send-email', sendBatchEmail);

// Auto-Assign Committee (creates batch + sends email + updates submission statuses)
router.post('/auto-assign-committee', autoAssignCommittee);

// Auto-Assign Eval by Email (no fixed committee — user enters emails manually)
router.post('/auto-assign-eval-by-email', autoAssignEvalByEmail);

// Finance Assignment Routes
router.post('/auto-assign-finance', autoAssignFinance);
router.get('/finance-batches', getFinanceBatches);

module.exports = router;
