const ApiError = require('../utils/ApiError');
const Lab = require('../models/Lab.model');
const Equipment = require('../models/Equipment.model');

// @desc    Get all labs
// @route   GET /api/v1/labs
// @access  Private
exports.getLabs = async (req, res, next) => {
  try {
    const labs = await Lab.find().populate('labManager', 'name email');
    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lab
// @route   GET /api/v1/labs/:id
// @access  Private
exports.getLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id).populate('labManager', 'name email');
    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: lab,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lab
// @route   POST /api/v1/labs
// @access  Private/Admin
exports.createLab = async (req, res, next) => {
  try {
    const lab = await Lab.create(req.body);
    res.status(201).json({
      success: true,
      data: lab,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab
// @route   PUT /api/v1/labs/:id
// @access  Private/Admin
exports.updateLab = async (req, res, next) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lab) {
      return next(new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: lab,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get equipment for a lab
// @route   GET /api/v1/labs/:id/equipment
// @access  Private
exports.getEquipmentByLab = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ lab: req.params.id, isActive: true });
    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create equipment
// @route   POST /api/v1/labs/:id/equipment
// @access  Private/Admin
exports.createEquipment = async (req, res, next) => {
  try {
    req.body.lab = req.params.id;
    const equipment = await Equipment.create(req.body);
    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};
