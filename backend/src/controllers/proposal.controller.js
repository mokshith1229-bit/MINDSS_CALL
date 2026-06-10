const Proposal = require('../models/Proposal.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create new proposal
// @route   POST /api/v1/proposals
// @access  Private (EMPLOYEE, ADMIN)
exports.createProposal = async (req, attachments, res, next) => {
  try {
    const { title, description, category, department, budgetRequired, status } = req.body;
    
    // Attachments come from multer
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`, // Assuming static serving
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    const initialStatus = status || 'PENDING_L1';

    const proposal = await Proposal.create({
      title,
      description,
      category,
      department,
      budgetRequired,
      status: initialStatus,
      submitter: req.user._id,
      attachments: files,
      statusHistory: [{
        status: initialStatus,
        note: 'Initial submission',
        changedBy: req.user._id,
      }],
    });

    res.status(201).json(new ApiResponse(201, { proposal }, 'Proposal submitted successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all proposals (with filtering)
// @route   GET /api/v1/proposals
// @access  Private
exports.getProposals = async (req, res, next) => {
  try {
    const { status, category, department, assignedTo } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (assignedTo) query.assignedTo = assignedTo;

    // If regular employee, only show their own proposals
    if (req.user.role === 'EMPLOYEE') {
      query.submitter = req.user._id;
    }

    const proposals = await Proposal.find(query)
      .populate('submitter', 'name email department')
      .populate('assignedTo', 'name email role')
      .sort('-createdAt');

    res.status(200).json(new ApiResponse(200, { proposals }, 'Proposals retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get single proposal by ID
// @route   GET /api/v1/proposals/:id
// @access  Private
exports.getProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('submitter', 'name email department')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name role');

    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    // Access control: Employee can only view their own
    if (req.user.role === 'EMPLOYEE' && proposal.submitter._id.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to view this proposal'));
    }

    res.status(200).json(new ApiResponse(200, { proposal }, 'Proposal retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update proposal status (Workflow Engine)
// @route   PUT /api/v1/proposals/:id/status
// @access  Private (ADMIN, EVALUATOR, HOD, FINANCE)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    // Update status
    proposal.status = status;
    
    // Add to history
    proposal.statusHistory.push({
      status,
      note,
      changedBy: req.user._id,
    });

    await proposal.save();

    res.status(200).json(new ApiResponse(200, { proposal }, 'Status updated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Assign proposal to evaluator/HOD/Finance
// @route   PUT /api/v1/proposals/:id/assign
// @access  Private (ADMIN)
exports.assignProposal = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role');

    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    // Add to history to track assignment
    proposal.statusHistory.push({
      status: proposal.status,
      note: `Assigned to user ID: ${assignedTo}`,
      changedBy: req.user._id,
    });
    
    await proposal.save();

    res.status(200).json(new ApiResponse(200, { proposal }, 'Proposal assigned successfully'));
  } catch (err) {
    next(err);
  }
};
