import dotenv from 'dotenv';
import mongoose from "mongoose";
import app from './app.js';
import authRoutes from './routes/auth.js';
import advisorRoutes from './routes/advisorRoutes.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_PATH)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const startServer = async (retries = 0) => {
  const PORT = 9001;
  
  try {
    // Set up routes BEFORE starting the server
    app.use('/api/auth', authRoutes);
    app.use('/api/advisor', advisorRoutes);

    // Start the server AFTER routes are set up
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
