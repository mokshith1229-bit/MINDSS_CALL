const express = require('express');
const { getPublicIdeas } = require('../controllers/public.ideas.controller');

const router = express.Router();

// Public endpoint - No authentication required
router.route('/')
  .get(getPublicIdeas);

module.exports = router;
