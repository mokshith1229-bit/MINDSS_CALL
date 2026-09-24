const { generatePresignedDownloadUrl } = require('../services/s3.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get a presigned download URL for a file
// @route   POST /api/v1/files/download
// @access  Private (or Public for certain tracking routes - requires logic or specific tokens)
exports.getDownloadUrl = async (req, res, next) => {
  try {
    const { objectKey } = req.body;
    
    if (!objectKey) {
      return next(new ApiError(400, 'objectKey is required'));
    }

    // Generate a presigned URL valid for 1 hour
    const downloadUrl = await generatePresignedDownloadUrl(objectKey, 3600);
    
    if (!downloadUrl) {
      return next(new ApiError(500, 'Failed to generate download URL'));
    }

    res.status(200).json(new ApiResponse(200, { downloadUrl }, 'Download URL generated successfully'));
  } catch (err) {
    next(err);
  }
};
