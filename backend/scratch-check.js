const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in env');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const EmailLog = mongoose.model('EmailLog', new mongoose.Schema({}, { strict: false }));

    const logs = await EmailLog.find({}).sort({ sentAt: 1 }).toArray();
    console.log(`Total email logs: ${logs.length}`);

    const duplicates = [];
    const windowMs = 60 * 1000; // 1 minute window for duplicate detection

    for (let i = 0; i < logs.length; i++) {
      const current = logs[i];
      if (current.isDuplicate) continue; // Already marked for deletion

      for (let j = i + 1; j < logs.length; j++) {
        const next = logs[j];
        if (next.isDuplicate) continue;

        const timeDiff = Math.abs(new Date(next.sentAt) - new Date(current.sentAt));
        const sameSubject = next.subject === current.subject;
        const sameRecipients = JSON.stringify(next.recipients) === JSON.stringify(current.recipients);

        if (sameSubject && sameRecipients && timeDiff <= windowMs) {
          next.isDuplicate = true;
          duplicates.push(next);
        }
      }
    }

    console.log(`Found ${duplicates.length} duplicate email logs within a 1-minute window.`);

    for (const dup of duplicates) {
      console.log(`- Deleting duplicate email: "${dup.subject}" to ${dup.recipients?.join(', ')} sent at ${dup.sentAt} (ID: ${dup._id})`);
      await EmailLog.findByIdAndDelete(dup._id);
    }

    console.log('Database email log deduplication complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
