require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Submission = require('../src/models/Submission.model');
const Form = require('../src/models/Form.model');
const FormVersion = require('../src/models/FormVersion.model');
const Counter = require('../src/models/Counter.model');
const PilotProject = require('../src/models/PilotProject.model');
const AuditLog = require('../src/models/AuditLog.model');

const projectsData = [
  {
    title: 'Impact of weather changes on maintenance of Indian Highways Roads',
    description: 'Not Available',
    projectOwner: 'Not Available',
    teamMembers: 'Ashok Sharma\nSippy Kumar'
  },
  {
    title: 'Bridge Monitoring System',
    description: 'Not Available',
    projectOwner: 'Not Available',
    teamMembers: 'Vuggirala Ananth Kumar\nMVS Reddy'
  },
  {
    title: 'Project Green Binder - Sustainable Bio-Bitumen Development Initiative',
    description: 'Not Available',
    projectOwner: 'Not Available',
    teamMembers: 'Vishal Katariya\nVipul Jain'
  },
  {
    title: 'Study on Rubind-Modified Binder: Laboratory Performance Characterization and Field Validation',
    description: 'Rubind is an activated crumb rubber–based bitumen modifier developed by Andrey Vorobiev to enhance binder performance by improving the softening point, viscosity, rutting resistance, and Performance Grade (PG).\n\nThe objective of this study is to comprehensively evaluate the engineering and performance characteristics of Rubind-modified binders and bituminous mixtures through laboratory testing and validate their field performance using a pilot test section under actual traffic loading and environmental conditions.\n\nThe study aims to establish the effectiveness and reliability of Rubind in upgrading conventional base bitumen into a high-performance modified binder suitable for durable pavement applications.',
    projectOwner: 'Guduru Shravan Kumar',
    teamMembers: 'Geddada Niranjan\nKamlesh Gupta\nJaya Sathya Sandeep Innamuri'
  }
];

const importProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database');

    // 1. Fetch form
    let form = await Form.findOne({ title: /Proposal/i });
    if (!form) {
      form = await Form.findOne();
    }
    if (!form) {
      console.log('No form found in DB. Please create a form first.');
      process.exit(1);
    }
    let formVersion = await FormVersion.findOne({ form: form._id, isActive: true });
    if (!formVersion) {
      formVersion = await FormVersion.findOne({ form: form._id });
    }
    
    console.log(`Using Form: ${form.title}`);

    let importedCount = 0;
    
    for (const data of projectsData) {
      console.log(`\nImporting: ${data.title}`);

      // Generate Business ID
      const counterId = 'PROP';
      const existing = await Submission.find(
        { businessId: { $regex: `^${counterId}-` } },
        { businessId: 1, _id: 0 }
      ).lean();
      
      const usedNums = new Set(
        existing.map((s) => {
          const parts = s.businessId?.split('-');
          return parts && parts[1] ? parseInt(parts[1], 10) : null;
        }).filter((n) => n !== null && !isNaN(n))
      );
      
      let nextSeq = 1;
      while (usedNums.has(nextSeq)) nextSeq++;
      const businessId = `${counterId}-${String(nextSeq).padStart(3, '0')}`;
      
      await Counter.findByIdAndUpdate(
        { _id: counterId },
        { $set: { seq: nextSeq } },
        { upsert: true }
      );

      // Generate Tracking ID
      const trackingId = `MCP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Generate WBS Code
      const wbsPrefix = 'MCP';
      const wbsCounter = await Counter.findByIdAndUpdate(
        { _id: `WBS-${wbsPrefix}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const wbsCode = `${wbsPrefix}-${String(wbsCounter.seq).padStart(3, '0')}`;

      // Create Submission
      const submission = await Submission.create({
        form: form._id,
        formVersion: formVersion._id,
        businessId,
        trackingId,
        wbsCode,
        submissionType: 'Proposal',
        status: 'APPROVED', // R&D Ongoing queue expects APPROVED or COMPLETED
        answers: {
          title: data.title,
          description: data.description,
          projectOwner: data.projectOwner,
          teamMembers: data.teamMembers
        },
        formData: {
          Title: { fieldId: 'title', value: data.title, type: 'text', section: 'Imported Data' },
          Description: { fieldId: 'description', value: data.description, type: 'textarea', section: 'Imported Data' },
          'Project Owner': { fieldId: 'owner', value: data.projectOwner, type: 'text', section: 'Imported Data' },
          'Team Members': { fieldId: 'team', value: data.teamMembers, type: 'textarea', section: 'Imported Data' }
        },
        submitterEmail: 'imported@mindscall.local',
        timeline: [
          {
            stage: 'Project Imported',
            actionBy: 'System Admin',
            role: 'System',
            remarks: 'This project was imported into MINDScall from existing R&D ongoing records.',
            timestamp: new Date()
          }
        ],
        projectDetails: {
          owner: data.projectOwner !== 'Not Available' ? data.projectOwner : '',
          implementationStatus: 'In Progress',
          progressPercentage: 0,
          updates: [],
          meetings: []
        }
      });

      // Create PilotProject
      const pilotProject = await PilotProject.create({
        submissionId: submission._id,
        currentPhase: 'Approved',
        progress: 0,
        timelineUpdates: [
          {
            title: 'Project Imported',
            description: 'This project was imported into MINDScall from existing R&D ongoing records.',
            progressPercentage: 0,
            phase: 'Approved',
            updatedBy: 'System Admin',
            timestamp: new Date(),
            attachments: []
          }
        ],
        activityLog: [
          {
            action: 'Legacy Project Imported',
            user: 'Developer',
            timestamp: new Date()
          }
        ]
      });

      // Create AuditLog
      await AuditLog.create({
        action: 'Legacy Project Imported',
        resource: 'PilotProject',
        details: {
          submissionId: submission._id,
          pilotProjectId: pilotProject._id,
          source: 'Excel Import',
          importedTitle: data.title
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Backend Import Script'
      });

      console.log(`  -> Business ID: ${businessId}`);
      console.log(`  -> Tracking ID: ${trackingId}`);
      console.log(`  -> WBS Code: ${wbsCode}`);
      
      importedCount++;
    }

    console.log(`\n================================`);
    console.log(`IMPORT SUMMARY`);
    console.log(`Projects Imported: ${importedCount}`);
    console.log(`================================`);
    process.exit(0);

  } catch (error) {
    console.error('Import Failed:', error);
    process.exit(1);
  }
};

importProjects();
