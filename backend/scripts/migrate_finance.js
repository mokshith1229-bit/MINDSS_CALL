const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Submission = require('../src/models/Submission.model'); // Adjust path as needed

// Load env vars
dotenv.config({ path: '../.env' }); // Fallback if run from inner dir
dotenv.config({ path: './.env' }); // If run from backend root

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindscall';

const migrateFinance = async () => {
  try {
    console.log(`Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const submissions = await Submission.find({});
    let migratedCount = 0;

    for (const sub of submissions) {
      let changed = false;

      // Migrate from evaluationReview.committeeBudget to financeReview.approvedBudget
      if (sub.workflow && sub.workflow.evaluationReview) {
        // We use mongoose doc.get to bypass strictly schema constraints if old fields were orphaned
        // But since we just removed it from schema, it might still be in the raw document
        const evalRev = sub.workflow.evaluationReview;
        const committeeBudget = evalRev.committeeBudget;

        if (committeeBudget !== undefined && committeeBudget !== null) {
          if (!sub.workflow.financeReview) {
            sub.workflow.financeReview = {};
          }
          sub.workflow.financeReview.approvedBudget = committeeBudget;
          
          // Remove the old field using Mongoose document methods or setting to undefined
          // sub.workflow.evaluationReview.committeeBudget = undefined; is the usual way, but since it's removed from schema,
          // saving will likely drop it. We can explicitly drop it.
          sub.workflow.evaluationReview.committeeBudget = undefined;

          changed = true;
        }
      }

      if (changed) {
        await sub.save({ validateBeforeSave: false });
        migratedCount++;
        console.log(`Migrated budget for Submission ID: ${sub.businessId || sub._id}`);
      }
    }

    console.log(`Migration completed successfully. Migrated ${migratedCount} submissions.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateFinance();
