import dotenv from 'dotenv';
import mongoose from "mongoose";
import cors from "cors";
import express from 'express';
import './config/passport.js';
import authRoutes from './routes/auth.js';
import advisorRoutes from './routes/advisorRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { startReminderScheduler } from './utils/reminderScheduler.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_PATH)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// Configure CORS
app.use(cors({ 
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);

// Start the reminder scheduler
startReminderScheduler();

const startServer = async (retries = 0) => {
  const PORT = process.env.PORT || 9001;
  
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
