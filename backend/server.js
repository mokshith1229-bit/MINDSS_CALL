const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
// Detailed Startup Logging & Error Handling for Vercel
let app;
try {
  console.log('[STARTUP] Starting Vercel backend initialization...');
  
  // 1. Environment variables
  dotenv.config();
  console.log('[STARTUP] ✔ Environment loaded. NODE_ENV:', process.env.NODE_ENV);
  
  // 2. Database connection
  // Note: Vercel might invoke functions concurrently, we don't await here 
  // to avoid blocking the cold start, but we catch top-level errors.
  try {
    connectDB();
    console.log('[STARTUP] ✔ Database connection initiated');
  } catch (dbErr) {
    console.error('[STARTUP] ❌ Database connection failed to initiate:', dbErr);
  }

  // 3. Express App & Routes
  app = require('./src/app');
  console.log('[STARTUP] ✔ Express routes registered & app initialized');

  const PORT = process.env.PORT || 5000;

  // 4. Server Start (Local only)
  let server;
  if (!process.env.VERCEL) {
    server = app.listen(PORT, () => {
      console.log(`[STARTUP] ✔ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } else {
    console.log('[STARTUP] ✔ Running in Vercel Serverless mode');
  }

  // Handle unhandled promise rejections without crashing the lambda if possible
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[UNHANDLED REJECTION] ❌ Error:`, err);
    console.error(err.stack);
    // Don't process.exit(1) on Vercel unless necessary, it causes FUNCTION_INVOCATION_FAILED
    if (!process.env.VERCEL && server) {
      server.close(() => process.exit(1));
    }
  });

  // Export app for Vercel
  module.exports = app;

} catch (err) {
  console.error('[STARTUP] ❌ FATAL STARTUP ERROR:', err);
  console.error(err.stack);
  // Export a dummy app that returns 500 so Vercel doesn't crash the lambda but shows the error
  const express = require('express');
  const fallbackApp = express();
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Vercel Server Startup Crash',
      error: err.message,
      stack: err.stack
    });
  });
  module.exports = fallbackApp;
}
