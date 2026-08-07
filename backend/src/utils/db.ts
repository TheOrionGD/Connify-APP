import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  console.log('🍃 Connecting to MongoDB Atlas...');
  const conn = await mongoose.connect(env.DATABASE_URL);
  console.log('✅ Connected to MongoDB Atlas successfully!');
  return conn;
}
