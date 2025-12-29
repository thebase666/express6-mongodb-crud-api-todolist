import mongoose from 'mongoose';
import { ENV } from './env.js';
import logger from './logger.js';

export const connectDB = async () => {
  try {
    if (!ENV.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(ENV.MONGO_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', {
      error: error.message,
      stack: error.stack,
    });
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
