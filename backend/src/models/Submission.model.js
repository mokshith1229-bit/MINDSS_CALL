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
    trackingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    wbsCode: {
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
      rmMasterToken: { type: String },
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
        approvedBudget: { type: Number, default: null },
        decision: { type: String, enum: ['PENDING', 'APPROVABLE', 'NOT_APPROVABLE', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      },
      evaluationReview: {
        committeeName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      }
    },
    timeline: [
      {
        stage: { type: String },
        event: { type: String }, // For legacy records
        actionBy: { type: String },
        actor: { type: String }, // For legacy records
        role: { type: String },
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
    projectDetails: {
      owner: { type: String, default: null },
      implementationStatus: { 
        type: String, 
        enum: ['Approved', 'Not Started', 'In Progress', 'Pilot Testing', 'Completed', 'On Hold'],
        default: 'Approved' 
      },
      progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
      updates: [{
        text: String,
        user: String,
        timestamp: { type: Date, default: Date.now }
      }],
      expectedBenefits: { type: String, default: '' },
      actualBenefits: { type: String, default: '' }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
