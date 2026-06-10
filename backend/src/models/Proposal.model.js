const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_L1', 'EVALUATION', 'FINANCE_REVIEW', 'APPROVED', 'REJECTED', 'REWORK'],
    required: true,
  },
  note: {
    type: String,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const proposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Proposal title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    budgetRequired: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_L1', 'EVALUATION', 'FINANCE_REVIEW', 'APPROVED', 'REJECTED', 'REWORK'],
      default: 'PENDING_L1',
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
      }
    ],
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Proposal', proposalSchema);
