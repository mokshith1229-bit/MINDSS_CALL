const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    } else {
      console.error('[STARTUP] ❌ Vercel DB Connection Failed! Retrying on next request...');
    }
  }
};

module.exports = { connectDB };
