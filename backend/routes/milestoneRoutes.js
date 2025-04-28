import express from 'express';
import Milestone from '../models/milestone.js';


const router = express.Router();

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
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const milestones = await Milestone.find({ studentId });
    res.json(milestones);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
