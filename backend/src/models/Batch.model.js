const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  committeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Committee',
    required: true
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  status: {
    type: String,
    enum: ['PENDING', 'EVALUATING', 'EMAIL_SENT', 'COMPLETED'],
    default: 'PENDING'
  },
  reviewToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
