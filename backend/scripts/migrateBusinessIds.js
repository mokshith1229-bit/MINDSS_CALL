const mongoose = require('mongoose');
const Submission = require('../src/models/Submission.model');
const Counter = require('../src/models/Counter.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindscall';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const submissions = await Submission.find({ businessId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${submissions.length} submissions needing businessId.`);

    for (const sub of submissions) {
      const type = sub.submissionType || 'Idea';
      let prefix = type === 'Proposal' ? 'PROP' : 'IDEA';

      const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      const sequenceNumber = String(counter.seq).padStart(3, '0');
      const businessId = `${prefix}-${sequenceNumber}`;
      
      sub.businessId = businessId;
      if (!sub.submissionType) sub.submissionType = type;

      await sub.save();
      console.log(`Migrated ${sub._id} -> ${businessId}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
