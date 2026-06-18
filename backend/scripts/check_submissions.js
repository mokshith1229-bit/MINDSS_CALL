const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const Submission = require('../src/models/Submission.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const submissions = await Submission.find({}, 'trackingId businessId createdAt').sort({ createdAt: -1 }).limit(5);
    console.log('Recent submissions:', submissions);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
