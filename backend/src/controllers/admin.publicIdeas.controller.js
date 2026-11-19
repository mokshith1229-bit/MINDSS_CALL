const Submission = require('../models/Submission.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Extract display metadata for admin listing
 */
const formatAdminIdea = (sub) => {
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

  const subType = sub.submissionType || findVal(['submissiontype']) || 'Idea';
  if (subType.toString().toLowerCase().includes('prop')) {
    return null;
  }

  const title = findVal(['title', 'proposaltitle', 'ideatitle', 'projecttitle', 'projectname']) || 'Untitled Submission';
  const abstract = findVal(['abstract', 'description', 'summary', 'ideadetails', 'overview', 'details']) || '';
  const category = findVal(['category', 'type', 'area', 'department', 'dept']) || 'General Innovation';
  const innovationType = findVal(['innovationtype']) || '';
  const employeeName = findVal(['name', 'fullname', 'employeename', 'submittername']) || 'Employee';

  return {
    id: sub._id.toString(),
    businessId: sub.businessId || '',
    trackingId: sub.trackingId || '',
    submissionType: sub.submissionType || 'Idea',
    title,
    abstract,
    category,
    innovationType,
    submitterName: employeeName,
    submitterEmail: sub.submitterEmail || '',
    status: sub.status || 'NEW',
    createdAt: sub.createdAt,
    publicVisibility: {
      status: sub.publicVisibility?.status || 'Draft',
      publishedAt: sub.publicVisibility?.publishedAt || null,
      publishedBy: sub.publicVisibility?.publishedBy || null,
      customTitle: sub.publicVisibility?.customTitle || '',
      customDescription: sub.publicVisibility?.customDescription || '',
      coverImageUrl: sub.publicVisibility?.coverImageUrl || '',
      featured: !!sub.publicVisibility?.featured,
    }
  };
};

// @desc    Get all ideas for public engagement management
// @route   GET /api/v1/admin/public-ideas
// @access  Private (Internal roles)
exports.getAdminIdeas = async (req, res, next) => {
  try {
    const { status, search, type } = req.query;

    // ONLY Idea submissions appear in Public Ideas (strictly excluding any proposals)
    const query = {
      submissionType: { $not: /proposal/i }
    };

    if (status && status !== 'all' && status !== 'All') {
      query['publicVisibility.status'] = status;
    }

    const rawSubmissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .lean();

    let ideas = rawSubmissions.map(formatAdminIdea).filter(Boolean);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      ideas = ideas.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.abstract.toLowerCase().includes(q) ||
        i.submitterName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.trackingId && i.trackingId.toLowerCase().includes(q))
      );
    }

    const total = ideas.length;
    const publishedCount = ideas.filter(i => i.publicVisibility.status === 'Published').length;
    const draftCount = ideas.filter(i => i.publicVisibility.status === 'Draft').length;
    const unpublishedCount = ideas.filter(i => i.publicVisibility.status === 'Unpublished').length;

    res.status(200).json(new ApiResponse(200, {
      ideas,
      counts: {
        total,
        published: publishedCount,
        draft: draftCount,
        unpublished: unpublishedCount
      }
    }, 'Admin ideas retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

// @desc    Update idea public visibility & publication status
// @route   PATCH /api/v1/admin/public-ideas/:id/visibility
// @access  Private (Internal roles)
exports.updateIdeaVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, customTitle, customDescription, coverImageUrl, featured } = req.body;

    if (status && !['Draft', 'Published', 'Unpublished'].includes(status)) {
      return next(new ApiError(400, 'Invalid publication status. Must be Draft, Published, or Unpublished.'));
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.publicVisibility) {
      submission.publicVisibility = {
        status: 'Draft',
        publishedAt: null,
        publishedBy: null,
        customTitle: '',
        customDescription: '',
        coverImageUrl: '',
        featured: false,
      };
    }

    const previousStatus = submission.publicVisibility.status;

    if (status) {
      submission.publicVisibility.status = status;
      if (status === 'Published' && (!submission.publicVisibility.publishedAt || previousStatus !== 'Published')) {
        submission.publicVisibility.publishedAt = new Date();
      }
      submission.publicVisibility.publishedBy = req.user?.email || req.user?.name || 'Admin';
    }

    if (customTitle !== undefined) {
      submission.publicVisibility.customTitle = customTitle.trim();
    }

    if (customDescription !== undefined) {
      submission.publicVisibility.customDescription = customDescription.trim();
    }

    if (coverImageUrl !== undefined) {
      submission.publicVisibility.coverImageUrl = coverImageUrl.trim();
    }

    if (featured !== undefined) {
      submission.publicVisibility.featured = !!featured;
    }

    // Add timeline entry
    submission.timeline.push({
      stage: 'Public Ideas Visibility',
      actionBy: req.user?.name || req.user?.email || 'Admin',
      role: req.user?.role || 'Admin',
      remarks: `Idea public status set to ${submission.publicVisibility.status}`,
      timestamp: new Date()
    });

    await submission.save();

    res.status(200).json(new ApiResponse(200, {
      submission: formatAdminIdea(submission)
    }, 'Idea visibility updated successfully'));
  } catch (err) {
    next(err);
  }
};
