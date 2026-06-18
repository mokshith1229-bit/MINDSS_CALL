const express = require('express');
const { getFinanceBatchByToken, submitFinanceBatchReview } = require('../controllers/public.finance.controller');

const router = express.Router();

// GET  /api/v1/public/finance-reviews/:token  — fetch proposals for review
router.get('/:token', getFinanceBatchByToken);

// PATCH /api/v1/public/finance-reviews/:token — submit finance decisions
router.patch('/:token', submitFinanceBatchReview);

module.exports = router;
