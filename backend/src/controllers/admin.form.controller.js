const Form = require('../models/Form.model');
const FormVersion = require('../models/FormVersion.model');
const Submission = require('../models/Submission.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new form with an initial version
// @route   POST /api/v1/admin/forms
// @access  Private (SUPER_ADMIN, ADMIN)
exports.createForm = async (req, res, next) => {
  try {
    const { title, description, slug, schema, category, linkSettings } = req.body;

    const existingForm = await Form.findOne({ slug });
    if (existingForm) {
      return next(new ApiError(400, 'A form with this slug already exists'));
    }

    const form = await Form.create({
      title,
      description,
      slug,
      status: 'PUBLISHED',
      category: category || 'Innovation',
      linkSettings: linkSettings || {},
      createdBy: req.user._id,
    });

    const formVersion = await FormVersion.create({
      form: form._id,
      versionNumber: 1,
      schema: schema || [],
      isActive: true,
    });

    res.status(201).json(new ApiResponse(201, { form, activeVersion: formVersion }, 'Form created successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all forms
// @route   GET /api/v1/admin/forms
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getForms = async (req, res, next) => {
  try {
    const forms = await Form.find().sort('-createdAt').populate('createdBy', 'name email').lean();
    
    // For each form, find its active version and attach schema/sections to the form object
    const formsWithSchema = await Promise.all(forms.map(async (form) => {
      const activeVersion = await FormVersion.findOne({ form: form._id, isActive: true }).lean();
      return {
        ...form,
        sections: activeVersion ? activeVersion.schema : [],
        currentVersion: activeVersion ? activeVersion.versionNumber : 1
      };
    }));

    res.status(200).json(new ApiResponse(200, { forms: formsWithSchema }, 'Forms retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update form metadata
// @route   PATCH /api/v1/admin/forms/:id
// @access  Private (SUPER_ADMIN, ADMIN)
exports.updateFormMetadata = async (req, res, next) => {
  try {
    const { title, description, slug, status, category, linkSettings } = req.body;

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { title, description, slug, status, category, linkSettings },
      { new: true, runValidators: true }
    );

    if (!form) {
      return next(new ApiError(404, 'Form not found'));
    }

    res.status(200).json(new ApiResponse(200, { form }, 'Form updated successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Publish a new form version
// @route   PUT /api/v1/admin/forms/:id/versions
// @access  Private (SUPER_ADMIN, ADMIN)
exports.publishNewVersion = async (req, res, next) => {
  try {
    const { schema } = req.body;

    const form = await Form.findById(req.params.id);
    if (!form) {
      return next(new ApiError(404, 'Form not found'));
    }

    // Set all previous versions to inactive
    await FormVersion.updateMany({ form: form._id }, { isActive: false });

    // Find the latest version number
    const latestVersion = await FormVersion.findOne({ form: form._id }).sort('-versionNumber');
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const newVersion = await FormVersion.create({
      form: form._id,
      versionNumber: newVersionNumber,
      schema: schema,
      isActive: true,
    });

    res.status(200).json(new ApiResponse(200, { activeVersion: newVersion }, 'New version published successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Get all versions of a form
// @route   GET /api/v1/admin/forms/:id/versions
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getFormVersions = async (req, res, next) => {
  try {
    const versions = await FormVersion.find({ form: req.params.id }).sort('-versionNumber');
    res.status(200).json(new ApiResponse(200, { versions }, 'Form versions retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Restore a form version
// @route   POST /api/v1/admin/forms/:id/versions/:version/restore
// @access  Private (SUPER_ADMIN, ADMIN)
exports.restoreVersion = async (req, res, next) => {
  try {
    const { version } = req.params;
    const formId = req.params.id;

    const targetVersion = await FormVersion.findOne({ form: formId, versionNumber: parseInt(version) });
    if (!targetVersion) {
      return next(new ApiError(404, 'Version not found'));
    }

    await FormVersion.updateMany({ form: formId }, { isActive: false });

    targetVersion.isActive = true;
    await targetVersion.save();

    res.status(200).json(new ApiResponse(200, { activeVersion: targetVersion }, 'Version restored successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a form and its versions
// @route   DELETE /api/v1/admin/forms/:id
// @access  Private (SUPER_ADMIN, ADMIN)
exports.deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return next(new ApiError(404, 'Form not found'));
    }
    // Delete associated versions and submissions (Cascade Delete)
    await FormVersion.deleteMany({ form: form._id });
    await Submission.deleteMany({ form: form._id });
    res.status(200).json(new ApiResponse(200, {}, 'Form deleted successfully'));
  } catch (err) {
    next(err);
  }
};
