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
router.post('/', async (req, res) => {
  try {
    const milestoneData = { ...req.body, status: req.body.status || 'Planned' }; // Default to "Planned"
    const milestone = new Milestone(milestoneData);
    const savedMilestone = await milestone.save();
    res.status(201).json(savedMilestone);
  } catch (err) {
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
  console.log('\n=== Milestone Route Debug ===');
  try {
    const { studentId } = req.params;
    
    console.log('1. Search Parameters:', {
      requestedStudentId: studentId,
      authenticatedUser: req.user?._id,
      userRole: req.user?.role
    });

    // First verify the student exists
    const student = await User.findById(studentId);
    console.log('2. Student Check:', {
      found: !!student,
      studentId: student?._id,
      name: student ? `${student.first_name} ${student.last_name}` : 'Not found'
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Then find their milestones
    const milestones = await Milestone.find({ 
      studentId: student._id 
    });

    console.log('3. Milestone Search Results:', {
      studentId: student._id,
      foundCount: milestones.length,
      milestones: milestones.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status,
        studentId: m.studentId
      }))
    });

    res.json(milestones);
  } catch (error) {
    console.error('4. Error in milestone route:', {
      error: error.message,
      stack: error.stack
    });
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
