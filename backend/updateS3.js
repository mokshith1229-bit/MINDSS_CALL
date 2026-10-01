const fs = require('fs');

const submissionControllerPath = './src/controllers/admin.submission.controller.js';
let submissionCode = fs.readFileSync(submissionControllerPath, 'utf8');
submissionCode = submissionCode.replace(/url: file\.objectKey \? '' : `\/uploads\/\$\{file\.filename\}`/g, 'url: file.location ? file.location : `/uploads/${file.filename}`');
submissionCode = submissionCode.replace(/storageProvider: file\.storageProvider \|\| 'local'/g, "storageProvider: file.location ? 's3' : 'local'");
submissionCode = submissionCode.replace(/objectKey: file\.objectKey \|\| null/g, "objectKey: file.key || null");
fs.writeFileSync(submissionControllerPath, submissionCode);

const publicFormControllerPath = './src/controllers/public.form.controller.js';
let publicFormCode = fs.readFileSync(publicFormControllerPath, 'utf8');
publicFormCode = publicFormCode.replace(/url: `\/uploads\/\$\{file\.filename\}`/g, 'url: file.location ? file.location : `/uploads/${file.filename}`');
fs.writeFileSync(publicFormControllerPath, publicFormCode);

const meetingControllerPath = './src/controllers/meetingRequest.controller.js';
let meetingCode = fs.readFileSync(meetingControllerPath, 'utf8');
meetingCode = meetingCode.replace(/attachmentUrl = req\.file\.objectKey \? '' : `\/uploads\/\$\{req\.file\.filename\}`/g, 'attachmentUrl = req.file.location ? req.file.location : `/uploads/${req.file.filename}`');
meetingCode = meetingCode.replace(/storageProvider = req\.file\.storageProvider \|\| 'local'/g, "storageProvider = req.file.location ? 's3' : 'local'");
meetingCode = meetingCode.replace(/objectKey = req\.file\.objectKey \|\| null/g, "objectKey = req.file.key || null");
fs.writeFileSync(meetingControllerPath, meetingCode);

console.log('Update complete.');
