const express = require('express');
const proposalController = require('../controllers/proposal.controller');
const validate = require('../middlewares/validate.middleware');
const proposalValidation = require('../validations/proposal.validation');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.route('/')
  .post(
    upload.array('attachments', 5), // allow up to 5 attachments
    validate(proposalValidation.createProposal),
    auditLog('CREATE_PROPOSAL', 'Proposal'),
    proposalController.createProposal
  )
  .get(proposalController.getProposals);

router.route('/:id')
  .get(proposalController.getProposal);

router.route('/:id/status')
  .put(
    authorize('SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'HOD', 'FINANCE'),
    validate(proposalValidation.updateStatus),
    auditLog('UPDATE_STATUS', 'Proposal'),
    proposalController.updateStatus
  );

router.route('/:id/assign')
  .put(
    authorize('SUPER_ADMIN', 'ADMIN'),
    validate(proposalValidation.assignProposal),
    auditLog('ASSIGN_PROPOSAL', 'Proposal'),
    proposalController.assignProposal
  );

module.exports = router;
