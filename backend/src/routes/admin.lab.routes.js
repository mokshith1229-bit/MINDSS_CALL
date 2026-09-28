const express = require('express');
const {
  getLabs,
  getLab,
  createLab,
  updateLab,
  getEquipmentByLab,
  createEquipment,
} = require('../controllers/admin.lab.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(getLabs)
  .post(authorize('SUPER_ADMIN', 'ADMIN'), createLab);

router.route('/:id')
  .get(getLab)
  .put(authorize('SUPER_ADMIN', 'ADMIN'), updateLab);

router.route('/:id/equipment')
  .get(getEquipmentByLab)
  .post(authorize('SUPER_ADMIN', 'ADMIN'), createEquipment);

module.exports = router;
