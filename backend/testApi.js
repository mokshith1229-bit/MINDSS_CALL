require('dotenv').config();
const mongoose = require('mongoose');
require('./src/models/Form.model');
const Submission = require('./src/models/Submission.model');
const { generatePresignedDownloadUrl } = require('./src/services/s3.service');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const submission = await Submission.findOne({ 'attachments.storageProvider': 's3' })
    .populate('form', 'title slug');
    
  if (submission && submission.attachments && submission.attachments.length > 0) {
    for (let i = 0; i < submission.attachments.length; i++) {
      if (submission.attachments[i].storageProvider === 's3' && submission.attachments[i].objectKey) {
        try {
          const presignedUrl = await generatePresignedDownloadUrl(submission.attachments[i].objectKey, 3600);
          if (presignedUrl) submission.attachments[i].url = presignedUrl;
        } catch (e) {
          console.error('Failed to generate', e);
        }
      }
    }
  }

  const jsonStr = JSON.stringify(submission);
  const parsed = JSON.parse(jsonStr);
  console.log('Serialized URL (findOne):', parsed.attachments[0].url);
  console.log('Contains query?', parsed.attachments[0].url.includes('?'));
  process.exit(0);
});
