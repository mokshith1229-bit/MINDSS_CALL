const Submission = require('../models/Submission.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Helper to safely extract public-facing fields only.
 * STRICTLY NEVER returns submitter email, phone, employee code, internal tracking,
 * evaluation scores, committee remarks, budgets, workflow status, or attachments.
 */
const extractSafeIdea = (sub) => {
  const ans = sub.answers || {};
  const fd = sub.formData || {};

  const findVal = (keywords) => {
    if (fd && typeof fd === 'object') {
      for (const [label, meta] of Object.entries(fd)) {
        const lLower = label.toLowerCase().replace(/[_\-\s]/g, '');
        if (keywords.some(kw => lLower.includes(kw))) {
          const val = meta?.value ?? meta;
          if (val !== undefined && val !== null && val !== '') return val;
        }
      }
    }
    if (ans && typeof ans === 'object') {
      for (const key of Object.keys(ans)) {
        const kLower = key.toLowerCase().replace(/[_\-\s]/g, '');
        if (keywords.some(kw => kLower.includes(kw))) {
          const val = ans[key];
          if (val !== undefined && val !== null && val !== '') return val;
        }
      }
    }
    return '';
  };

  const title = sub.publicVisibility?.customTitle?.trim() ||
                findVal(['title', 'proposaltitle', 'ideatitle', 'projecttitle', 'projectname']) ||
                'Innovative Idea';

  const description = sub.publicVisibility?.customDescription?.trim() ||
                      findVal(['abstract', 'description', 'summary', 'ideadetails', 'overview', 'details']) ||
                      '';

  let category = findVal(['category', 'type', 'area', 'department', 'dept', 'subdepartment']) || 'General Innovation';
  if (category && typeof category === 'string') {
    category = category.charAt(0).toUpperCase() + category.slice(1);
  }
  const innovationType = findVal(['innovationtype']) || '';

  return {
    id: sub._id.toString(),
    title,
    description,
    category,
    innovationType: innovationType || null,
    submissionDate: sub.publicVisibility?.publishedAt || sub.createdAt,
    coverImage: sub.publicVisibility?.coverImageUrl || null,
    featured: !!sub.publicVisibility?.featured,
  };
};

// @desc    Get all published ideas for public portal
// @route   GET /api/v1/public/ideas
// @access  Public
exports.getPublicIdeas = async (req, res, next) => {
  try {
    const { category, innovationType, search } = req.query;

    // Count total idea submissions across the entire system
    const totalIdeaSubmissions = await Submission.countDocuments({
      status: { $ne: 'DELETED' }
    });

    // Submissions to display on public ideas portal:
    // Display all active innovation submissions UNLESS explicitly marked as Unpublished
    const query = {
      status: { $ne: 'DELETED' },
      'publicVisibility.status': { $ne: 'Unpublished' }
    };

    const rawSubmissions = await Submission.find(query)
      .sort({ 'publicVisibility.publishedAt': -1, createdAt: -1 })
      .lean();

    // Transform and sanitize strictly
    let safeIdeas = rawSubmissions.map(extractSafeIdea);

    // Extract dynamic categories & innovation types for filter UI
    const allCategories = Array.from(new Set(safeIdeas.map(i => i.category).filter(Boolean)));
    const allInnovationTypes = Array.from(new Set(safeIdeas.map(i => i.innovationType).filter(Boolean)));

    // Apply category filter if specified
    if (category && category !== 'all' && category !== 'All') {
      safeIdeas = safeIdeas.filter(i => 
        i.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply innovation type filter if specified
    if (innovationType && innovationType !== 'all' && innovationType !== 'All') {
      safeIdeas = safeIdeas.filter(i => 
        i.innovationType && i.innovationType.toLowerCase() === innovationType.toLowerCase()
      );
    }

    // Apply search filter if specified
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      safeIdeas = safeIdeas.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    res.status(200).json(new ApiResponse(200, {
      ideas: safeIdeas,
      categories: allCategories,
      innovationTypes: allInnovationTypes,
      total: safeIdeas.length,
      totalIdeaSubmissions,
    }, 'Public ideas retrieved successfully'));
  } catch (err) {
    next(err);
  }
};
