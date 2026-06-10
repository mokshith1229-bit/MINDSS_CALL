const express = require('express');
const { getNotifications, createNotification, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/:id/read')
  .patch(markAsRead);

module.exports = router;
