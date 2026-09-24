const express = require('express');
const { getDownloadUrl } = require('../controllers/file.controller');

const router = express.Router();

// Public route to generate a download URL given an object key.
// Note: In a stricter implementation, we'd add `protect` and only allow authorized users.
// But since tracking endpoints are public and we have no file-level RBAC currently easily mapping to tracking ids,
// we'll keep this open for now or add specific token logic later.
router.post('/download', getDownloadUrl);

module.exports = router;
