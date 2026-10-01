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
  // Replace the old getSubmission logic with the new helper logic
  // And apply it to all controllers
  content = content.replace("const Submission = require('../models/Submission.model');", "const Submission = require('../models/Submission.model');\n" + helper);
  
  // Now replace all `res.status(xxx).json(new ApiResponse(xxx, { submission }` with `await presignSubmission(submission);\n    res.status...`
  // Wait, some use `const submission = await ...` then `res.status(200).json(new ApiResponse(200, { submission }, ...));`
  
  content = content.replace(/res\.status\((\d+)\)\.json\(new ApiResponse\(\1,\s*\{\s*submission\s*\}/g, 'await presignSubmission(submission);\n    res.status($1).json(new ApiResponse($1, { submission }');
  
  // Wait, I should also clean up getSubmission which had inline logic
  content = content.replace(/const \{ generatePresignedDownloadUrl \}[\s\S]*?(?=res\.status\(200\)\.json\(new ApiResponse\(200, \{ submission \})/g, '');
  
  fs.writeFileSync(path, content);
  console.log('Patched');
} else {
  console.log('Already patched');
}
