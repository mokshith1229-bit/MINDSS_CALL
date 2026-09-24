const { uploadFile } = require('../services/s3.service');
const path = require('path');
const fs = require('fs');

const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }

    const filesToUpload = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

    const { trackingId, businessId, projectId, slug } = req.body || req.params || {};
    // Use an identifier for the folder structure, default to a timestamp if none available
    const folderId = trackingId || businessId || projectId || slug || Date.now().toString();

    for (const file of filesToUpload) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Create a safe object key
      const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectKey = `uploads/${folderId}/${uniqueSuffix}-${safeOriginalName}`;
      
      await uploadFile(file.path, objectKey, file.mimetype);
      
      // Augment the file object with S3 metadata
      file.storageProvider = 's3';
      file.objectKey = objectKey;
      
      // Delete the local file
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting local file ${file.path}:`, err);
      });
    }

    next();
  } catch (error) {
    // If S3 upload fails, we should still delete any local files
    const filesToDelete = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);
    filesToDelete.forEach(file => {
      if (file.path) {
        fs.unlink(file.path, () => {});
      }
    });
    console.error("S3 Upload Error:", error);
    next(error);
  }
};

module.exports = { uploadToS3 };
