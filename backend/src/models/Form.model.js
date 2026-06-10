const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Form slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    category: {
      type: String,
      default: 'Innovation',
    },
    linkSettings: {
      expiryDate: { type: String, default: '' },
      maxResponses: { type: Number, default: null },
      onePerUser: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Form', formSchema);
