import express from 'express';
import Student from '../models/student.js'; // Assuming model is at /models/student.js

const router = express.Router();

// Create a new Student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get ALL Students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('userId advisorId');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId advisorId');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a Student
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedStudent) return res.status(404).json({ error: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a Student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
