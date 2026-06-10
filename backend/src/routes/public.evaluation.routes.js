const express = require('express');
const { getBatchByToken, submitBatchReview } = require('../controllers/public.evaluation.controller');

const router = express.Router();

router.get('/:token', getBatchByToken);
router.patch('/:token', submitBatchReview);

module.exports = router;
