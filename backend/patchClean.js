const fs = require('fs');
const path = './src/controllers/admin.submission.controller.js';
let content = fs.readFileSync(path, 'utf8');

const helper = `
async function presignSubmission(submission) {
  const { generatePresignedDownloadUrl } = require('../services/s3.service');
  const processAttachments = async (arr) => {
    if (!arr || !arr.length) return;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].storageProvider === 's3' && arr[i].objectKey) {
        try {
          const url = await generatePresignedDownloadUrl(arr[i].objectKey, 3600);
          if (url) arr[i].url = url;
        } catch(e) {}
      }
    }
  };

  if (!submission) return;
  await processAttachments(submission.attachments);
  if (submission.projectDetails) {
    await processAttachments(submission.projectDetails.documents);
    if (submission.projectDetails.updates) {
      for (let u of submission.projectDetails.updates) await processAttachments(u.attachments);
    }
    if (submission.projectDetails.testMatrix) {
      for (let t of submission.projectDetails.testMatrix) await processAttachments(t.attachments);
    }
    if (submission.projectDetails.samples) {
      for (let s of submission.projectDetails.samples) await processAttachments(s.attachments);
    }
  }
}
`;

if (!content.includes('async function presignSubmission')) {
  // Add helper at the top
  content = content.replace("const Submission = require('../models/Submission.model');", "const Submission = require('../models/Submission.model');\n" + helper);
  
  // Replace all { submission } responses
  content = content.replace(/res\.status\((\d+)\)\.json\(new ApiResponse\(\1,\s*\{\s*submission\s*\}/g, 'await presignSubmission(submission);\n    res.status($1).json(new ApiResponse($1, { submission }');
  
  // Replace all { submissions } responses
  content = content.replace(/res\.status\((\d+)\)\.json\(new ApiResponse\(\1,\s*\{\s*submissions[^\}]*\}\s*,/g, (match, status) => {
    return `if (submissions && submissions.length > 0) {\n      for (let s of submissions) await presignSubmission(s);\n    }\n    ${match}`;
  });

  fs.writeFileSync(path, content);
  console.log('Patched cleanly!');
}
