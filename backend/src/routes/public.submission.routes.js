const express = require('express');
const { getReviewByToken, submitReview } = require('../controllers/public.submission.controller');

const router = express.Router();

router.route('/:token')
  .get(getReviewByToken)
  .patch(submitReview);

module.exports = router;
