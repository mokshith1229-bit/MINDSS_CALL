const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const app = require('./src/app');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server only if not in Vercel serverless environment
let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Export app for Vercel Serverless
module.exports = app;
