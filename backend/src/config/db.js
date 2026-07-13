const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    isConnected = false;
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw err;
  }
};

module.exports = { connectDB };
