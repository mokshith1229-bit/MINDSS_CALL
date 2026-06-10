const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');
const { protect } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  validate(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshToken
);

router.post(
  '/logout',
  protect,
  auditLog('LOGOUT', 'User'),
  authController.logout
);

module.exports = router;
