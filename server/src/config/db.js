const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is missing from environment variables (MONGO_URL or MONGODB_URI).');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan ? `MongoDB Connected: ${conn.connection.host}`.cyan.underline : `MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
