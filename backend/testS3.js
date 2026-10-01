require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

async function testS3() {
  const bucket = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing AWS_BUCKET_NAME or AWS_ACCESS_KEY_ID in .env');
    return;
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  try {
    const fileContent = 'This is a test file for MINDScall AWS S3 integration.';
    const fileName = `test-upload-public-${Date.now()}.txt`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    });

    const response = await s3.send(command);
    console.log('✅ PUBLIC AWS S3 UPLOAD SUCCESS!');
  } catch (err) {
    console.error('❌ PUBLIC AWS S3 UPLOAD FAILED!');
    console.error(err.message);
  }
}

testS3();
