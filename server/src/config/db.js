/**
 * MongoDB Connection with Mongoose
 * Supports retry logic and connection event logging
 */
const mongoose = require('mongoose');
const env = require('./env');

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

const connectDB = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (err) {
    console.error(`❌ MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES}):`, err.message);

    if (retries < MAX_RETRIES - 1) {
      console.log(`🔄 Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries + 1);
    }

    console.error('❌ Max retries reached. Exiting...');
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
};

module.exports = { connectDB, disconnectDB };
