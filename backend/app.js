import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authentication.js';
import advisorRoutes from './routes/advisorRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import Milestone from './models/milestone.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

// Parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    cookies: req.cookies,
    headers: req.headers
  });
  next();
});

// Debug route registration
console.log('Registering routes...');

// Routes
app.use('/api/auth', authRoutes);
console.log('Auth routes registered at /api/auth');

app.use('/api/advisor', advisorRoutes);
console.log('Advisor routes registered at /api/advisor');

app.use('/api/milestones', milestoneRoutes);
console.log('Milestone routes registered at /api/milestones');

app.use('/api/students', studentRoutes);
console.log('Student routes registered at /api/students');

// Add this before your routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected' });
});

// Add near the top after your mongoose connection setup
const checkDatabase = async () => {
  try {
    console.log('Checking database contents...');
    const milestones = await Milestone.find({});
    console.log('Total milestones in database:', milestones.length);
    console.log('Sample milestone:', milestones[0]);
    
    // Check specific student's milestones
    const studentMilestones = await Milestone.find({
      student: "68102dc3da15e6876683b296"
    });
    console.log('Milestones for student:', studentMilestones.length);
  } catch (err) {
    console.error('Database check error:', err);
  }
};

// Call this after your mongoose connection is established
mongoose.connection.once('connected', () => {
  console.log('MongoDB Connected');
  checkDatabase();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    body: req.body
  });
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', {
    method: req.method,
    url: req.url,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  res.status(404).json({ message: 'Route not found' });
});

export default app;