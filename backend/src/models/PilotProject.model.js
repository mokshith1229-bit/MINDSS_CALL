const mongoose = require('mongoose');

const pilotProjectSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true,
    },
    currentPhase: {
      type: String,
      enum: [
        'Approved',
        'Planning',
        'Requirement Gathering',
        'Design',
        'Development',
        'Testing',
        'Pilot Study',
        'Pilot Successful',
        'Documentation',
        'Final Project Report',
        'Completed',
      ],
      default: 'Approved',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timelineUpdates: [
      {
        title: String,
        description: String,
        progressPercentage: Number,
        phase: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now },
        attachments: [
          {
            filename: String,
            url: String,
            mimetype: String,
            size: Number,
          },
        ],
      },
    ],
    documents: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
        documentType: String,
        uploadedBy: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    pilotStudy: {
      startDate: Date,
      endDate: Date,
      location: String,
      observations: String,
      challenges: String,
      result: String,
      lessonsLearned: String,
      recommendations: String,
      media: [
        {
          filename: String,
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
    },
    finalReport: {
      executiveSummary: String,
      implementationDetails: String,
      actualCost: String,
      actualBenefits: String,
      roi: String,
      lessonsLearned: String,
      futureImprovements: String,
      approvalDate: Date,
      completionDate: Date,
      attachments: [
        {
          filename: String,
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
    },
    activityLog: [
      {
        action: String,
        user: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PilotProject', pilotProjectSchema);
