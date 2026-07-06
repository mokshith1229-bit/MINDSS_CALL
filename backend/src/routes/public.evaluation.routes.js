const express = require('express');
const { getEvaluationByToken, submitEvaluationReview } = require('../controllers/public.evaluation.controller');

const router = express.Router();

router.get('/:token', getEvaluationByToken);
router.patch('/:token', submitEvaluationReview);

module.exports = router;
