const mongoose = require('mongoose');

/**
 * FinanceBatch — tracks a batch of proposals sent to finance reviewers.
 * Unlike the evaluation Batch (which ties to a Committee document),
 * this stores reviewer emails directly since finance reviewers are ad-hoc.
 */
const financeBatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  reviewerEmails: [{
    type: String,
    required: true
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  status: {
    type: String,
    enum: ['PENDING', 'EMAIL_SENT', 'COMPLETED'],
    default: 'EMAIL_SENT'
  },
  reviewToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FinanceBatch', financeBatchSchema);
