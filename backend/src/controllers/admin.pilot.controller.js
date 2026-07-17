const PilotProject = require('../models/PilotProject.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const AuditLog = require('../models/AuditLog.model');

// Helper to log activity
const logActivity = async (projectId, action, user) => {
  await PilotProject.findByIdAndUpdate(projectId, {
    $push: {
      activityLog: {
        action,
        user,
        timestamp: new Date()
      }
    }
  });
};

// @desc    Get all pilot projects (Approved or Completed Submissions)
// @route   GET /api/v1/admin/pilot-projects
// @access  Private (Admin)
exports.getAllPilotProjects = async (req, res, next) => {
  try {
    // 1. Get all submissions that are APPROVED or COMPLETED
    const submissions = await Submission.find({
      status: { $in: ['APPROVED', 'COMPLETED'] }
    });

    // 2. Ensure PilotProject documents exist for all of them
    const subIds = submissions.map(s => s._id);
    const existingPilots = await PilotProject.find({ submissionId: { $in: subIds } });
    const existingMap = new Set(existingPilots.map(p => p.submissionId.toString()));

    const newPilotsToCreate = submissions
      .filter(s => !existingMap.has(s._id.toString()))
      .map(s => ({
        submissionId: s._id,
        currentPhase: s.status === 'COMPLETED' ? 'Completed' : 'Approved',
        progress: s.status === 'COMPLETED' ? 100 : 0
      }));

    if (newPilotsToCreate.length > 0) {
      await PilotProject.insertMany(newPilotsToCreate);
    }

    // 3. Fetch all again and populate submission data
    const allPilots = await PilotProject.find().populate({
      path: 'submissionId',
      select: 'businessId submissionType answers formData status createdAt'
    });

    res.status(200).json(new ApiResponse(200, { projects: allPilots }, 'Pilot projects retrieved'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get a specific pilot project by ID
// @route   GET /api/v1/admin/pilot-projects/:id
// @access  Private (Admin)
exports.getPilotProjectById = async (req, res, next) => {
  try {
    const project = await PilotProject.findById(req.params.id).populate({
      path: 'submissionId',
      select: 'businessId submissionType answers formData status attachments createdAt'
    });

    if (!project) {
      return next(new ApiError(404, 'Pilot project not found'));
    }

    res.status(200).json(new ApiResponse(200, { project }, 'Pilot project retrieved'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update a pilot project (General fields, pilot study, final report)
// @route   PATCH /api/v1/admin/pilot-projects/:id
// @access  Private (Admin)
exports.updatePilotProject = async (req, res, next) => {
  try {
    const { currentPhase, progress, pilotStudy, finalReport } = req.body;
    const project = await PilotProject.findById(req.params.id);

    if (!project) {
      return next(new ApiError(404, 'Pilot project not found'));
    }

    if (currentPhase) project.currentPhase = currentPhase;
    if (progress !== undefined) project.progress = progress;
    if (pilotStudy) project.pilotStudy = { ...project.pilotStudy, ...pilotStudy };
    if (finalReport) project.finalReport = { ...project.finalReport, ...finalReport };

    await project.save();
    
    await logActivity(project._id, 'Project updated', req.user?.email || 'Admin');

    // Also check completion
    if (project.progress === 100 && project.finalReport?.executiveSummary) {
      project.currentPhase = 'Completed';
      await project.save();
      await Submission.findByIdAndUpdate(project.submissionId, { status: 'COMPLETED' });
    }

    res.status(200).json(new ApiResponse(200, { project }, 'Pilot project updated'));
  } catch (err) {
    next(err);
  }
};

// @desc    Add a timeline update
// @route   POST /api/v1/admin/pilot-projects/:id/timeline
// @access  Private (Admin)
exports.addTimelineUpdate = async (req, res, next) => {
  try {
    const { title, description, progressPercentage, phase, attachments } = req.body;
    
    if (!title || !description) {
      return next(new ApiError(400, 'Title and description are required'));
    }

    const project = await PilotProject.findById(req.params.id);
    if (!project) {
      return next(new ApiError(404, 'Pilot project not found'));
    }

    project.timelineUpdates.unshift({
      title,
      description,
      progressPercentage: progressPercentage !== undefined ? progressPercentage : project.progress,
      phase: phase || project.currentPhase,
      updatedBy: req.user?.email || 'Admin',
      attachments: attachments || []
    });

    if (progressPercentage !== undefined) project.progress = progressPercentage;
    if (phase) project.currentPhase = phase;

    await project.save();
    await logActivity(project._id, `Timeline updated: ${title}`, req.user?.email || 'Admin');

    res.status(201).json(new ApiResponse(201, { project }, 'Timeline update added'));
  } catch (err) {
    next(err);
  }
};

// @desc    Add a document
// @route   POST /api/v1/admin/pilot-projects/:id/documents
// @access  Private (Admin)
exports.addDocument = async (req, res, next) => {
  try {
    const { filename, url, mimetype, size, documentType } = req.body;
    
    const project = await PilotProject.findById(req.params.id);
    if (!project) {
      return next(new ApiError(404, 'Pilot project not found'));
    }

    project.documents.unshift({
      filename,
      url,
      mimetype,
      size,
      documentType,
      uploadedBy: req.user?.email || 'Admin'
    });

    await project.save();
    await logActivity(project._id, `Document uploaded: ${filename}`, req.user?.email || 'Admin');

    res.status(201).json(new ApiResponse(201, { project }, 'Document uploaded'));
  } catch (err) {
    next(err);
  }
};

// @desc    Mark project as complete
// @route   POST /api/v1/admin/pilot-projects/:id/complete
// @access  Private (Admin)
exports.completeProject = async (req, res, next) => {
  try {
    const project = await PilotProject.findById(req.params.id);
    if (!project) {
      return next(new ApiError(404, 'Pilot project not found'));
    }

    if (project.progress < 100) {
      return next(new ApiError(400, 'Progress must be 100% to complete project'));
    }

    project.currentPhase = 'Completed';
    await project.save();

    await Submission.findByIdAndUpdate(project.submissionId, { status: 'COMPLETED' });
    await logActivity(project._id, 'Project marked as COMPLETED', req.user?.email || 'Admin');

    res.status(200).json(new ApiResponse(200, { project }, 'Project completed'));
  } catch (err) {
    next(err);
  }
};
