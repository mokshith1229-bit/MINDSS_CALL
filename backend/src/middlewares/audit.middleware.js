const AuditLog = require('../models/AuditLog.model');

/**
 * Middleware to log actions performed by users.
 * Requires `req.user` to be populated by `auth.middleware.js`.
 * 
 * @param {String} action - Description of the action (e.g., 'UPDATE_ROLE', 'DELETE_USER')
 * @param {String} resource - The resource being affected (e.g., 'User', 'Form')
 */
const auditLog = (action, resource) => async (req, res, next) => {
  // Capture the original send to log after response is sent
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    // We only log if the request was successful
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      let details = {};
      
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        // Obfuscate sensitive fields if needed
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '***';
        details = bodyCopy;
      }

      AuditLog.create({
        user: req.user._id,
        action,
        resource,
        details,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(err => console.error('Failed to create audit log:', err.message));
    }

    return res.send(data);
  };

  next();
};

module.exports = auditLog;
