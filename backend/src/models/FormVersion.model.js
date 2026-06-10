const mongoose = require('mongoose');

const formVersionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    // Schema defines the fields inside the form (drag and drop builder data)
    // Mixed allows us to store the dynamic array of field objects
    schema: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FormVersion', formVersionSchema);
