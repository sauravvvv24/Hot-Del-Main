// server/config/db.js
import mongoose from 'mongoose';
import { getUserByEmail } from '../controllers/userController.js';
import express from 'express';
const router = express.Router();

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotdel';

    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit with failure
  }
};

// User Routes
router.get('/api/users/:email', getUserByEmail);

export default connectDB;
export { router };
