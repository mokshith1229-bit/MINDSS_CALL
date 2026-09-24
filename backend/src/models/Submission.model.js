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
      enum: ['NEW', 'REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 'AWAITING_HOD_REVIEW', 'HOD_REVIEW', 'EVALUATION', 'EVALUATION_REJECTED', 'FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED', 'REJECTED', 'IMPLEMENTATION', 'COMPLETED'],
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
        decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null }
      },
      evaluationReview: {
        committeeName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION'], default: 'PENDING' },
        timestamp: { type: Date, default: null },
        evaluators: [{
          email: String,
          token: String,
          submitted: { type: Boolean, default: false },
          submittedDate: Date,
          scores: {
            innovation: Number,
            technicalFeasibility: Number,
            businessImpact: Number,
            scalability: Number,
            riskAssessment: Number
          },
          comments: String,
          decision: { type: String, enum: ['APPROVED', 'REJECTED'] }
        }],
        status: { type: String, enum: ['AWAITING_ASSIGNMENT', 'AWAITING_VOTES', 'UNDER_EVALUATION', 'PASSED_EVALUATION', 'REJECTED_BY_COMMITTEE'], default: 'AWAITING_ASSIGNMENT' }
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
        storageProvider: { type: String, default: 'local' },
        objectKey: String
      }
    ],
    projectDetails: {
      owner: { type: String, default: null },
      implementationStatus: { 
        type: String, 
        enum: ['Approved', 'Not Started', 'Planning', 'In Progress', 'Pilot Testing', 'Near Completion', 'Completed', 'On Hold'],
        default: 'Approved' 
      },
      progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
      updates: [{
        title: String,
        description: String,
        text: String, // Kept for backwards compatibility
        updatedBy: String,
        user: String, // Kept for backwards compatibility
        progressPercentage: Number,
        timestamp: { type: Date, default: Date.now },
        attachments: [{
          filename: String,
          url: String,
          mimetype: String,
          size: Number,
          storageProvider: { type: String, default: 'local' },
          objectKey: String
        }]
      }],
      meetings: [{
        title: String,
        agenda: String,
        date: String,
        time: String,
        duration: String,
        platform: String,
        link: String,
        participants: [String],
        notes: String,
        status: { type: String, enum: ['Scheduled', 'Completed'], default: 'Scheduled' },
        completionDetails: {
          attendees: String,
          discussionSummary: String,
          keyDecisions: String,
          actionItems: String,
          nextSteps: String,
          risksIdentified: String,
          nextMeetingDate: String,
          attachments: [{
            filename: String,
            url: String,
            mimetype: String,
            size: Number,
            storageProvider: { type: String, default: 'local' },
            objectKey: String
          }]
        }
      }],
      expectedBenefits: { type: String, default: '' },
      actualBenefits: { type: String, default: '' },
      objectives: [{
        name: String,
        description: String,
        responsiblePerson: String,
        targetDate: Date,
        status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'], default: 'Not Started' },
        completionPercentage: { type: Number, default: 0 }
      }],
      initiation: {
        startDate: Date,
        teamConfirmation: Boolean,
        workPlan: String,
        milestoneSchedule: String,
        resourceRequirements: String,
        procurementRequirements: String,
        ethicalApprovals: String,
        revisedBudget: Number,
        status: { type: String, enum: ['PENDING', 'UNDER REVIEW', 'STARTED'], default: 'PENDING' },
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: String
      },
      milestones: [{
        name: String,
        description: String,
        plannedStartDate: Date,
        plannedCompletionDate: Date,
        responsiblePerson: String,
        expectedDeliverable: String,
        completionPercentage: { type: Number, default: 0 },
        status: { type: String, enum: ['NOT STARTED', 'IN PROGRESS', 'COMPLETED', 'DELAYED'], default: 'NOT STARTED' },
        documents: [{
          filename: String,
          url: String,
          mimetype: String
        }],
        tasks: [{
          name: String,
          description: String,
          responsiblePerson: String,
          startDate: Date,
          dueDate: Date,
          status: { type: String, enum: ['NOT STARTED', 'IN PROGRESS', 'COMPLETED', 'DELAYED'], default: 'NOT STARTED' },
          completionPercentage: { type: Number, default: 0 },
          attachments: [{ filename: String, url: String, mimetype: String, storageProvider: { type: String, default: 'local' }, objectKey: String }],
          notes: String
        }]
      }],
      progressReports: [{
        reportingPeriod: String,
        summary: String,
        workCompleted: String,
        workInProgress: String,
        nextPeriodPlan: String,
        issues: String,
        risks: String,
        supportRequired: String,
        status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'REVISION REQUIRED', 'APPROVED'], default: 'DRAFT' },
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: String,
        comments: String,
        attachments: [{ filename: String, url: String, mimetype: String, storageProvider: { type: String, default: 'local' }, objectKey: String }]
      }],
      financials: {
        amountReleased: { type: Number, default: 0 },
        amountSpent: { type: Number, default: 0 },
        committedAmount: { type: Number, default: 0 },
        expenditures: [{
          category: String,
          amount: Number,
          description: String,
          date: { type: Date, default: Date.now },
          addedBy: String
        }]
      },
      documents: [{
        name: String,
        type: String,
        uploadedBy: String,
        uploadDate: { type: Date, default: Date.now },
        version: { type: String, default: '1.0' },
        approvalStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
        storageReference: String,
        filename: String,
        mimetype: String
      }],
      issues: [{
        issue: String,
        impact: String,
        proposedSolution: String,
        responsiblePerson: String,
        targetResolutionDate: Date,
        status: { type: String, enum: ['OPEN', 'IN PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
        reportedAt: { type: Date, default: Date.now },
        reportedBy: String
      }],
      changeRequests: [{
        type: String,
        description: String,
        requestedBy: String,
        requestedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'APPROVED', 'REJECTED'], default: 'SUBMITTED' },
        reviewedAt: Date,
        reviewedBy: String,
        comments: String
      }],
      projectReviews: [{
        reviewDate: { type: Date, default: Date.now },
        reviewer: String,
        overallProgress: Number,
        milestonesCompleted: Number,
        delayedMilestones: Number,
        budgetUtilization: Number,
        reportsSubmitted: Number,
        majorIssues: Number,
        deliverablesAchieved: String,
        remainingWork: String,
        outcome: { type: String, enum: ['CONTINUE', 'CONTINUE WITH CONDITIONS', 'CORRECTIVE ACTION REQUIRED', 'EXTENSION REQUIRED'] },
        comments: String
      }],
      finalReport: {
        summary: String,
        objectives: String,
        methodology: String,
        results: String,
        keyFindings: String,
        deliverablesAchieved: String,
        publications: String,
        patents: String,
        expenditure: String,
        deviations: String,
        futureWork: String,
        status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'REVISION REQUIRED', 'APPROVED'], default: 'DRAFT' },
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: String,
        supportingDocuments: [{ filename: String, url: String, mimetype: String }]
      }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

submissionSchema.virtual('sla').get(function () {
  const status = this.status || 'NEW';
  
  let target = null;
  let entryDate = this.createdAt;
  
  const managerReviewStatuses = ['NEW', 'REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 'AWAITING_HOD_REVIEW', 'HOD_REVIEW'];
  const evaluationStatuses = ['EVALUATION'];
  const approvalStatuses = ['APPROVAL_COMMITTEE'];
  
  if (managerReviewStatuses.includes(status)) {
    target = 4;
    entryDate = this.createdAt;
  } else if (evaluationStatuses.includes(status)) {
    target = 4;
    // Find when it entered evaluation by searching timeline backwards
    if (this.timeline && this.timeline.length > 0) {
      const evalEvent = [...this.timeline].reverse().find(t => 
        (t.stage && t.stage.toLowerCase().includes('evaluation')) || 
        (t.remarks && t.remarks.toLowerCase().includes('evaluation'))
      );
      if (evalEvent && evalEvent.timestamp) entryDate = evalEvent.timestamp;
      else entryDate = this.updatedAt || this.createdAt;
    }
  } else if (approvalStatuses.includes(status)) {
    target = 5;
    // Find when it entered approval
    if (this.timeline && this.timeline.length > 0) {
      const appEvent = [...this.timeline].reverse().find(t => 
        (t.stage && t.stage.toLowerCase().includes('approval committee')) || 
        (t.remarks && t.remarks.toLowerCase().includes('approval committee'))
      );
      if (appEvent && appEvent.timestamp) entryDate = appEvent.timestamp;
      else entryDate = this.updatedAt || this.createdAt;
    }
  } else {
    // Stage doesn't have an active SLA target (e.g. APPROVED, REJECTED, COMPLETED, FINANCE_APPROVED)
    return null;
  }

  const elapsedDays = Math.floor((Date.now() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = target - elapsedDays;
  
  return {
    target,
    elapsedDays,
    daysLeft
  };
});

module.exports = mongoose.model('Submission', submissionSchema);
