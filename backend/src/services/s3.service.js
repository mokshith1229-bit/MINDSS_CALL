const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // Credentials will be loaded automatically from environment variables if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set,
  // or through IAM roles/profiles as configured by IT.
});

const bucketName = process.env.AWS_S3_BUCKET || 'cubetech-rnd-app-proposal-s3-storage';

exports.uploadFile = async (filePath, objectKey, mimeType) => {
  const fileStream = fs.createReadStream(filePath);
  
  const uploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: fileStream,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(uploadParams);
  return await s3Client.send(command);
};

exports.deleteFile = async (objectKey) => {
  if (!objectKey) return;
  const deleteParams = {
    Bucket: bucketName,
    Key: objectKey,
  };
  const command = new DeleteObjectCommand(deleteParams);
  return await s3Client.send(command);
};

exports.generatePresignedDownloadUrl = async (objectKey, expiresIn = 3600) => {
  if (!objectKey) return null;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};
