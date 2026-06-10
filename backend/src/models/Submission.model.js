const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    formVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FormVersion',
      required: true,
    },
    businessId: {
      type: String,
      unique: true,
      sparse: true,
    },
    submissionType: {
      type: String,
      enum: ['Idea', 'Proposal'],
    },
    // Maps field IDs to submitted values
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Stores the complete form data with labels, values, etc.
    formData: {
      type: mongoose.Schema.Types.Mixed,
    },
    submitterEmail: {
      type: String,
    },
    status: {
      type: String,
      enum: ['NEW', 'REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 'AWAITING_HOD_REVIEW', 'HOD_REVIEW', 'EVALUATION', 'FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED', 'REJECTED'],
      default: 'NEW',
    },
    workflow: {
      rmReviewToken: { type: String },
      hodReviewToken: { type: String },
      rmReview: {
        reviewerEmail: { type: String, default: null },
        reviewerName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      },
      hodReview: {
        reviewerEmail: { type: String, default: null },
        reviewerName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      },
      financeReview: {
        reviewerName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        decision: { type: String, enum: ['PENDING', 'APPROVABLE', 'NOT_APPROVABLE', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      }
    },
    timeline: [
      {
        event: { type: String, required: true },
        actor: { type: String },
        remarks: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
