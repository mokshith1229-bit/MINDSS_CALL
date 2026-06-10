const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  recipients: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  error: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', emailLogSchema);
