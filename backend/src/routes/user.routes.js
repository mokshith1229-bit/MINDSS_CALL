const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const userValidation = require('../validations/user.validation');
const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.get('/me', userController.getMe);

// Restrict following routes to SUPER_ADMIN and ADMIN
router.use(authorize('SUPER_ADMIN'));

router.route('/')
  .get(userController.getUsers)
  .post(
    validate(userValidation.createUser),
    auditLog('CREATE_USER', 'User'),
    userController.createUser
  );

router.route('/:id/role')
  .put(
    validate(userValidation.updateUserRole),
    auditLog('UPDATE_USER_ROLE', 'User'),
    userController.updateUserRole
  );

router.route('/:id/reactivate')
  .patch(
    auditLog('REACTIVATE_USER', 'User'),
    userController.reactivateUser
  );

router.route('/:id')
  .delete(
    validate(userValidation.deleteUser),
    auditLog('DEACTIVATE_USER', 'User'),
    userController.deleteUser
  );

module.exports = router;
