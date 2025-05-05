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
      student: req.user.role === 'student' ? req.user._id : req.body.student,
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
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Planned', 'InProgress', 'PendingApproval', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // If status is being updated to Completed, set verified fields
    if (status === 'Completed') {
      milestone.verified = true;
      milestone.verifiedBy = req.user._id;
      milestone.verifiedAt = new Date();
    }

    // Update the milestone
    const updatedMilestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          ...req.body,
          lastReviewedBy: req.user._id,
          lastReviewedAt: new Date()
        }
      },
      { new: true }
    );

    res.json(updatedMilestone);
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET all Milestones for a Student
router.get('/student/:studentId', protect, async (req, res) => {
  console.log('\n=== Fetching Milestones ===');
  console.log('User:', req.user);
  console.log('Params:', req.params);
  
  try {
    const studentId = req.params.studentId;
    console.log('Querying milestones for student:', studentId);
    
    // Find milestones for this student
    const milestones = await Milestone.find({ 
      student: studentId 
    }).populate('student', 'first_name last_name');
    
    console.log('Found milestones:', {
      count: milestones.length,
      milestones: milestones.map(m => ({
        id: m._id,
        title: m.title,
        student: m.student,
        status: m.status
      }))
    });
    
    res.json(milestones || []);
  } catch (error) {
    console.error('Error fetching milestones:', {
      error: error.message,
      stack: error.stack,
      studentId: req.params.studentId
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch milestones',
      details: error.message 
    });
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
