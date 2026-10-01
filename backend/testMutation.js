require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('./src/models/Submission.model');
const { generatePresignedDownloadUrl } = require('./src/services/s3.service');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const submission = await Submission.findOne({ 'attachments.storageProvider': 's3' });
    if (!submission) {
      console.log('No submission with S3 attachments found');
      return process.exit(0);
    }
    
    console.log('Original URL:', submission.attachments[0].url);
    
    // Simulate what the controller does
    const presignedUrl = await generatePresignedDownloadUrl(submission.attachments[0].objectKey, 3600);
    submission.attachments[0].url = presignedUrl;
    
    console.log('Modified URL:', submission.attachments[0].url);
    
    // Simulate what res.json() does
    const jsonStr = JSON.stringify(submission);
    const parsed = JSON.parse(jsonStr);
    
    console.log('Serialized URL:', parsed.attachments[0].url);
    console.log('Is it presigned? (contains AWSAccessKeyId):', parsed.attachments[0].url.includes('X-Amz-Algorithm'));
    
    process.exit(0);
  });
