const fs = require('fs');

const path = './src/controllers/admin.submission.controller.js';
let content = fs.readFileSync(path, 'utf8');

const target1 = "res.status(200).json(new ApiResponse(200, { submission }, 'Submission retrieved successfully'));";
const replace1 = `const { generatePresignedDownloadUrl } = require('../services/s3.service');
    
    if (submission && submission.attachments && submission.attachments.length > 0) {
      for (let i = 0; i < submission.attachments.length; i++) {
        if (submission.attachments[i].storageProvider === 's3' && submission.attachments[i].objectKey) {
          try {
            const presignedUrl = await generatePresignedDownloadUrl(submission.attachments[i].objectKey, 3600);
            if (presignedUrl) submission.attachments[i].url = presignedUrl;
          } catch (e) {
            console.error('Failed to generate presigned URL for', submission.attachments[i].objectKey);
          }
        }
      }
    }

    res.status(200).json(new ApiResponse(200, { submission }, 'Submission retrieved successfully'));`;

content = content.replace(target1, replace1);

const target2 = "res.status(200).json(new ApiResponse(200, { submissions, pagination }, 'Submissions retrieved successfully'));";
const replace2 = `const { generatePresignedDownloadUrl: generatePresignedDownloadUrlForList } = require('../services/s3.service');
    
    if (submissions && submissions.length > 0) {
      for (let s = 0; s < submissions.length; s++) {
        if (submissions[s].attachments && submissions[s].attachments.length > 0) {
          for (let i = 0; i < submissions[s].attachments.length; i++) {
            if (submissions[s].attachments[i].storageProvider === 's3' && submissions[s].attachments[i].objectKey) {
              try {
                const presignedUrl = await generatePresignedDownloadUrlForList(submissions[s].attachments[i].objectKey, 3600);
                if (presignedUrl) submissions[s].attachments[i].url = presignedUrl;
              } catch (e) {
                console.error('Failed to generate presigned URL for', submissions[s].attachments[i].objectKey);
              }
            }
          }
        }
      }
    }

    res.status(200).json(new ApiResponse(200, { submissions, pagination }, 'Submissions retrieved successfully'));`;

content = content.replace(target2, replace2);

fs.writeFileSync(path, content);
console.log('Patch complete.');
