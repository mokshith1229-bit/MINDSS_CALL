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
const reportsRoutes = require('./routes/reports.routes');
const developerRoutes = require('./routes/developer.routes');
const meetingRequestRoutes = require('./routes/meetingRequest.routes');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  'https://mindss-call-three.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow if exactly in list OR if it's a vercel preview domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200, // Some legacy browsers and Vercel edge choke on 204
};

app.use(cors(corsOptions));

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

// Database connection middleware to ensure DB is connected on every request (crucial for Serverless)
app.use(async (req, res, next) => {
  try {
    const { connectDB } = require('./config/db');
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

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
app.use('/api/v1/meeting-requests', meetingRequestRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin/reports', reportsRoutes);
app.use('/api/v1/developer', developerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ server: "running" });
});

// Health endpoint
app.get('/api/v1/health', (req, res) => {
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI;
  res.json({
    status: "ok",
    database: {
      readyState: mongoose.connection.readyState,
      readyStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      hasUri: !!uri,
      uriLength: uri ? uri.length : 0,
      uriStart: uri ? uri.substring(0, 20) : 'none'
    }
  });
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
