const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middlewares/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminFormRoutes = require('./routes/admin.form.routes');
const adminSubmissionRoutes = require('./routes/admin.submission.routes');
const adminEvaluationRoutes = require('./routes/admin.evaluation.routes');
const adminAuditRoutes = require('./routes/admin.audit.routes');
const adminEmailLogRoutes = require('./routes/admin.emaillog.routes');
const publicFormRoutes = require('./routes/public.form.routes');
const publicSubmissionRoutes = require('./routes/public.submission.routes');
const publicEvaluationRoutes = require('./routes/public.evaluation.routes');
const publicFinanceRoutes = require('./routes/public.finance.routes');
const meetingRoutes = require('./routes/meeting.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Security Middleware
app.use(helmet());

// CORS MUST be applied before the rate limiter so that blocked requests still get CORS headers.
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased limit so frontend polling doesn't block legitimate actions
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/forms', adminFormRoutes);
app.use('/api/v1/admin/submissions', adminSubmissionRoutes);
app.use('/api/v1/admin/evaluations', adminEvaluationRoutes);
app.use('/api/v1/admin/audit-logs', adminAuditRoutes);
app.use('/api/v1/admin/email-logs', adminEmailLogRoutes);
app.use('/api/v1/public/forms', publicFormRoutes);
app.use('/api/v1/public/reviews', publicSubmissionRoutes);
app.use('/api/v1/public/batch-reviews', publicEvaluationRoutes);
app.use('/api/v1/public/finance-reviews', publicFinanceRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('MINDScall API is running...');
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
