const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./src/models/Submission.model');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindscall')
  .then(async () => {
    try {
      const res = await Submission.updateMany({}, { $set: { 'projectDetails.owner': 'chtech.in' } });
      console.log('Updated all owners to chtech.in:', res);
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
