const mongoose = require('mongoose');

const rdCompletedImportSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimetype: {
      type: String,
      default: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    storageProvider: {
      type: String,
      enum: ['s3', 'local'],
      default: 'local'
    },
    objectKey: {
      type: String,
      default: ''
    },
    sheetName: {
      type: String,
      required: true,
      trim: true
    },
    availableSheets: [{
      type: String
    }],
    headers: [{
      type: String
    }],
    rows: [{
      type: mongoose.Schema.Types.Mixed
    }],
    rowCount: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'Admin' },
      email: { type: String, default: '' },
      role: { type: String, default: 'DEVELOPER' }
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

rdCompletedImportSchema.index({ uploadDate: -1 });

module.exports = mongoose.model('RDCompletedImport', rdCompletedImportSchema);
