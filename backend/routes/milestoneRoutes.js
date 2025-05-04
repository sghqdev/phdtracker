import express from 'express';
import Milestone from '../models/milestone.js';
import { protect } from '../middleware/auth.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

// Add after imports
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

// Log all collections and a sample document from Milestone collection
const logCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const sampleMilestone = await Milestone.findOne({});
    console.log('Sample milestone:', sampleMilestone);
  } catch (err) {
    console.error('Error checking collections:', err);
  }
};

// Call this after connection is established
mongoose.connection.once('connected', logCollections);

const router = express.Router();

// TEST route should be first
router.get('/test', async (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Milestone routes working' });
});

// CREATE a Milestone
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating milestone with data:', {
      body: req.body,
      user: req.user
    });

    const milestoneData = { 
      ...req.body,
      status: req.body.status || 'Planned',
      studentId: req.user.role === 'student' ? req.user._id : req.body.studentId,
      userId: req.user._id
    };

    console.log('Processed milestone data:', milestoneData);

    const milestone = new Milestone(milestoneData);
    const savedMilestone = await milestone.save();
    res.status(201).json(savedMilestone);
  } catch (err) {
    console.error('Milestone creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a Milestone
router.put('/:id', async (req, res) => {
  try {
    const updatedMilestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedMilestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(updatedMilestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all Milestones for a Student
router.get('/student/:studentId', protect, async (req, res) => {
  console.log('\n=== Fetching Milestones ===');
  console.log('User:', req.user);
  console.log('Params:', req.params);
  
  try {
    const milestones = await Milestone.find({ 
      studentId: req.params.studentId 
    });
    
    console.log('Found milestones:', {
      count: milestones.length,
      milestones: milestones.map(m => ({
        id: m._id,
        title: m.title,
        studentId: m.studentId
      }))
    });
    
    res.json(milestones);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single Milestone
router.get('/:id', async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Milestone
router.delete('/:id', async (req, res) => {
  try {
    await Milestone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
