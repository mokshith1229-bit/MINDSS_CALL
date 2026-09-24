const express = require('express');
const { getApprovalBatchByToken, submitApprovalBatchReview } = require('../controllers/public.approval.controller');

const router = express.Router();

// GET /api/v1/public/approval-reviews/:token — fetch batch details
router.get('/:token', getApprovalBatchByToken);

// PATCH /api/v1/public/approval-reviews/:token — submit approval decisions
router.patch('/:token', submitApprovalBatchReview);

module.exports = router;
