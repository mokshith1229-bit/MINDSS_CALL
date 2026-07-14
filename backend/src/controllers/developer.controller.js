const FeatureVisibility = require('../models/FeatureVisibility.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// All known roles (except DEVELOPER itself — it always has full access)
const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'];

// ── Default seed data ─────────────────────────────────────────────────────────
const DEFAULT_FEATURES = [
  // ── Modules ──────────────────────────────────────────────────────────────
  {
    featureKey: 'module.dashboard',
    label: 'Dashboard',
    module: 'Dashboard',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
  },
  {
    featureKey: 'module.form_upload',
    label: 'Form Upload',
    module: 'Innovation',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.rd_review',
    label: 'R&D Review',
    module: 'Innovation',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.auto_assign_email',
    label: 'Auto Assign Email',
    module: 'Workflow',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.evaluation',
    label: 'Evaluation Committee',
    module: 'Workflow',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'DEVELOPER'],
  },
  {
    featureKey: 'module.finance_review',
    label: 'Finance Review',
    module: 'Workflow',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'DEVELOPER'],
  },
  {
    featureKey: 'module.approval',
    label: 'Approval Committee',
    module: 'Workflow',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.rd_ongoing_projects',
    label: 'R&D Ongoing Projects',
    module: 'Projects',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
  },
  {
    featureKey: 'module.reports',
    label: 'Reports',
    module: 'Analytics',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.user_management',
    label: 'User Management',
    module: 'Administration',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.settings',
    label: 'Settings',
    module: 'Administration',
    type: 'module',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'module.feature_management',
    label: 'Feature Management',
    module: 'Administration',
    type: 'module',
    defaultRoles: ['DEVELOPER'],
  },
  // ── Dashboard Sections ───────────────────────────────────────────────────
  {
    featureKey: 'section.dashboard.kpi_cards',
    label: 'KPI Cards',
    module: 'Dashboard',
    type: 'section',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
  },
  {
    featureKey: 'section.dashboard.charts',
    label: 'Charts',
    module: 'Dashboard',
    type: 'section',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'section.dashboard.recent_activity',
    label: 'Recent Activity',
    module: 'Dashboard',
    type: 'section',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
  },
  // ── Report Sections ──────────────────────────────────────────────────────
  {
    featureKey: 'section.reports.export_buttons',
    label: 'Export Buttons (Excel/CSV)',
    module: 'Analytics',
    type: 'section',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'section.reports.executive_dashboard',
    label: 'Executive Dashboard Tab',
    module: 'Analytics',
    type: 'section',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  // ── Action Buttons ───────────────────────────────────────────────────────
  {
    featureKey: 'button.export_excel',
    label: 'Export Excel',
    module: 'Analytics',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'button.export_csv',
    label: 'Export CSV',
    module: 'Analytics',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'button.delete_submission',
    label: 'Delete Submission',
    module: 'Innovation',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'button.create_form',
    label: 'Create / Edit Form',
    module: 'Innovation',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'button.assign_evaluator',
    label: 'Assign Evaluator',
    module: 'Workflow',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
  },
  {
    featureKey: 'button.approve_reject',
    label: 'Approve / Reject',
    module: 'Workflow',
    type: 'button',
    defaultRoles: ['SUPER_ADMIN', 'ADMIN', 'EVALUATOR', 'HOD', 'FINANCE', 'DEVELOPER'],
  },
];

// ── Helper: build roles array from defaultRoles list ─────────────────────────
function buildRolesArray(defaultRoles) {
  return ALL_ROLES.map(role => ({
    role,
    visible: defaultRoles.includes(role),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get full visibility config (used by ALL authenticated users for context)
// @route   GET /api/v1/developer/visibility
// @access  Private (all authenticated — needed for sidebar/context)
// ─────────────────────────────────────────────────────────────────────────────
exports.getVisibility = async (req, res, next) => {
  try {
    let features = await FeatureVisibility.find({}).lean();

    // Auto-seed if collection is empty
    if (features.length === 0) {
      await seedFeaturesIntoDB();
      features = await FeatureVisibility.find({}).lean();
    }

    // Build a flat map: { [featureKey]: { [role]: visible } }
    const visibilityMap = {};
    features.forEach(f => {
      visibilityMap[f.featureKey] = {};
      f.roles.forEach(r => {
        visibilityMap[f.featureKey][r.role] = r.visible;
      });
      // DEVELOPER always has access to everything
      visibilityMap[f.featureKey]['DEVELOPER'] = true;
    });

    res.status(200).json(new ApiResponse(200, { features, visibilityMap }, 'Visibility config fetched'));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update visibility for a feature+role pair
// @route   PUT /api/v1/developer/visibility/:featureKey
// @access  Private (DEVELOPER only)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateVisibility = async (req, res, next) => {
  try {
    const { featureKey } = req.params;
    const { role, visible } = req.body;

    if (!role || visible === undefined) {
      return next(new ApiError(400, 'role and visible fields are required'));
    }

    // Prevent disabling DEVELOPER's own access
    if (role === 'DEVELOPER') {
      return next(new ApiError(400, 'Cannot modify DEVELOPER role visibility — Developer always has full access'));
    }

    const feature = await FeatureVisibility.findOne({ featureKey });
    if (!feature) {
      return next(new ApiError(404, `Feature "${featureKey}" not found`));
    }

    const roleEntry = feature.roles.find(r => r.role === role);
    if (roleEntry) {
      roleEntry.visible = visible;
    } else {
      feature.roles.push({ role, visible });
    }

    feature.updatedBy = req.user?.email || 'Developer';
    await feature.save();

    res.status(200).json(new ApiResponse(200, { feature }, 'Visibility updated successfully'));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk update multiple feature+role pairs at once
// @route   PUT /api/v1/developer/visibility/bulk
// @access  Private (DEVELOPER only)
// ─────────────────────────────────────────────────────────────────────────────
exports.bulkUpdateVisibility = async (req, res, next) => {
  try {
    // updates: [{ featureKey, role, visible }]
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return next(new ApiError(400, 'updates array is required'));
    }

    const updatedBy = req.user?.email || 'Developer';
    const results = [];

    for (const { featureKey, role, visible } of updates) {
      if (role === 'DEVELOPER') continue; // Skip — always visible
      const feature = await FeatureVisibility.findOne({ featureKey });
      if (!feature) continue;
      const roleEntry = feature.roles.find(r => r.role === role);
      if (roleEntry) roleEntry.visible = visible;
      else feature.roles.push({ role, visible });
      feature.updatedBy = updatedBy;
      await feature.save();
      results.push(featureKey);
    }

    res.status(200).json(new ApiResponse(200, { updated: results.length }, 'Bulk visibility updated'));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Seed default visibility rules
// @route   POST /api/v1/developer/visibility/seed
// @access  Private (DEVELOPER only)
// ─────────────────────────────────────────────────────────────────────────────
exports.seedDefaults = async (req, res, next) => {
  try {
    await seedFeaturesIntoDB();
    const features = await FeatureVisibility.find({}).lean();
    res.status(200).json(new ApiResponse(200, { count: features.length }, 'Default visibility seeded'));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset all features to defaults
// @route   POST /api/v1/developer/visibility/reset
// @access  Private (DEVELOPER only)
// ─────────────────────────────────────────────────────────────────────────────
exports.resetDefaults = async (req, res, next) => {
  try {
    await FeatureVisibility.deleteMany({});
    await seedFeaturesIntoDB();
    res.status(200).json(new ApiResponse(200, {}, 'All visibility settings reset to defaults'));
  } catch (err) {
    next(err);
  }
};

// ── Internal: seed all defaults using upsert ─────────────────────────────────
async function seedFeaturesIntoDB() {
  const ops = DEFAULT_FEATURES.map(f => ({
    updateOne: {
      filter: { featureKey: f.featureKey },
      update: {
        $setOnInsert: {
          featureKey: f.featureKey,
          label: f.label,
          module: f.module,
          type: f.type,
          roles: buildRolesArray(f.defaultRoles),
          updatedBy: 'system',
        },
      },
      upsert: true,
    },
  }));
  await FeatureVisibility.bulkWrite(ops);
}
