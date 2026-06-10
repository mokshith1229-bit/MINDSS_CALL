const mongoose = require('mongoose');

const committeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  members: [{
    type: String,
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Committee', committeeSchema);
