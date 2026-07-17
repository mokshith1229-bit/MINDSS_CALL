const express = require('express');
const {
  getAllPilotProjects,
  getPilotProjectById,
  updatePilotProject,
  addTimelineUpdate,
  addDocument,
  completeProject
} = require('../controllers/admin.pilot.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes (assuming admin protection is needed)
// If there's an admin specific middleware, apply that as well. Currently using 'protect'
router.use(protect);

router.route('/')
  .get(getAllPilotProjects);

router.route('/:id')
  .get(getPilotProjectById)
  .patch(updatePilotProject);

router.post('/:id/timeline', addTimelineUpdate);
router.post('/:id/documents', addDocument);
router.post('/:id/complete', completeProject);

module.exports = router;
