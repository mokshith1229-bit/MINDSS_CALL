const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User.model');
const Form = require('./src/models/Form.model');
const FormVersion = require('./src/models/FormVersion.model');
const Meeting = require('./src/models/Meeting.model');
const Notification = require('./src/models/Notification.model');

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindscall');
    console.log('MongoDB connected...');

    // 1. Create Admin User
    const adminEmail = 'admin@cubetech.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'SUPER_ADMIN',
      });
      console.log('Admin user created: admin@cubetech.com / admin123');
    } else {
      admin.password = 'admin123';
      admin.role = 'SUPER_ADMIN';
      await admin.save();
      console.log('Admin user reset: password set to admin123 and role to SUPER_ADMIN.');
    }

    // 1b. Create Custom User (rand@gmail.com)
    const customEmail = 'rand@gmail.com';
    let customUser = await User.findOne({ email: customEmail });

    if (!customUser) {
      customUser = await User.create({
        name: 'Mokshith User',
        email: customEmail,
        password: 'mokshith',
        role: 'SUPER_ADMIN',
      });
      console.log('Custom user created: rand@gmail.com / mokshith');
    } else {
      customUser.password = 'mokshith';
      customUser.role = 'SUPER_ADMIN';
      await customUser.save();
      console.log('Custom user reset: password set to mokshith and role to SUPER_ADMIN.');
    }

    // 2. Create Default Innovation Form
    const formSlug = 'innovation-form';
    let form = await Form.findOne({ slug: formSlug });

    if (!form) {
      form = await Form.create({
        title: 'Innovation Submission Form',
        description: 'Submit your ideas and proposals for review',
        slug: formSlug,
        status: 'PUBLISHED',
        createdBy: admin._id,
      });

      const schemaDefinition = [
        { id: 'submissionType', type: 'radio', label: 'Submission Type', options: ['idea', 'proposal'] },
        { id: 'name', type: 'text', label: 'Full Name' },
        { id: 'dob', type: 'date', label: 'Date of Birth' },
        { id: 'employeeCode', type: 'text', label: 'Employee Code' },
        { id: 'department', type: 'select', label: 'Department' },
        { id: 'subDepartment', type: 'select', label: 'Sub Department' },
        { id: 'subSubDepartment', type: 'select', label: 'Sub Sub Department' },
        { id: 'processProduct', type: 'select', label: 'Process / Product' },
        { id: 'reportingManagerName', type: 'text', label: 'Reporting Manager Name' },
        { id: 'reportingManagerEmail', type: 'email', label: 'Reporting Manager Email' },
        { id: 'hodName', type: 'text', label: 'HOD Name' },
        { id: 'hodEmail', type: 'email', label: 'HOD Email' },
        { id: 'title', type: 'text', label: 'Title' },
        { id: 'introduction', type: 'textarea', label: 'Introduction' },
        { id: 'methodology', type: 'textarea', label: 'Methodology' },
        { id: 'benefits', type: 'textarea', label: 'Benefits' },
      ];

      await FormVersion.create({
        form: form._id,
        versionNumber: 1,
        schema: schemaDefinition,
        isActive: true,
      });

      console.log('Default Innovation Form created with slug: innovation-form');
    } else {
      console.log('Innovation form already exists.');
    }

    // 3. Create Default Meetings
    const meetingCount = await Meeting.countDocuments();
    if (meetingCount === 0) {
      await Meeting.create([
        {
          name: 'Q3 Innovation Strategy Review',
          date: '2026-06-12',
          time: '10:00 AM',
          duration: '2h',
          attendees: ['Rahul S.', 'Priya N.', 'Amit V.'],
          location: 'Conference Room A',
          status: 'Scheduled',
          type: 'Strategy',
          agenda: 'Review Q3 proposals and align with yearly strategy.',
        },
        {
          name: 'Evaluation Committee Session – May',
          date: '2026-05-30',
          time: '10:00 AM',
          duration: '3h',
          attendees: ['All Evaluators'],
          location: 'Conference Room B',
          status: 'Completed',
          type: 'Evaluation',
          agenda: 'Monthly review of all pending evaluations.',
          notes: 'Discussed 15 proposals. 5 approved, 8 rejected, 2 sent back for rework.',
          actionItems: ['Send rejection emails', 'Schedule follow up for reworked items'],
          recommendations: 'Need stricter initial filtering criteria.',
        }
      ]);
      console.log('Seeded initial meetings.');
    }

    // 4. Create Default Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create([
        { text: 'Rahul Sharma submitted a new idea', time: '2 mins ago', read: false },
        { text: 'Evaluation completed for Highway IoT', time: '1 hr ago', read: false },
        { text: 'Meeting scheduled: Q3 Innovation Review', time: '3 hrs ago', read: true },
        { text: 'Budget request approved by CFO', time: '1 day ago', read: true }
      ]);
      console.log('Seeded initial notifications.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
