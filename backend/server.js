import express from "express";
import api from './routes/index.js';
import authRoutes from './routes/authentication.js';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cors from "cors";
import './config/passport.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import studentRoutes from './routes/studentRoutes.js';


dotenv.config();

mongoose.connect(process.env.MONGODB_PATH, () => {
    console.log('MongoDB connected');
}, (e) => console.log(e));

const PORT = process.env.SERVER_PORT || 9000;
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();

app.use(cors({ origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount other API routes
app.use(api);

// Mount milestone routes
app.use('/api/milestones', milestoneRoutes);

app.use('/api/students', studentRoutes);

app.listen(PORT, () => {
    console.log(`Your app is running at http://localhost:${PORT}`);
});
