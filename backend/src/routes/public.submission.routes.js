const express = require('express');
const { getReviewByToken, submitReview, getRmBatch, submitRmBatch } = require('../controllers/public.submission.controller');

const router = express.Router();

router.route('/rm-batch/:token')
  .get(getRmBatch)
  .post(submitRmBatch);

router.route('/:token')
  .get(getReviewByToken)
  .patch(submitReview);

module.exports = router;
