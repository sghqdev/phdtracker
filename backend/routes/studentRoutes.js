import express from 'express';
import Student from '../models/Student.js';
import { verifyToken } from '../middleware/verifyToken.js';
import User from '../models/user.js';
import Milestone from '../models/milestone.js';
import Note from '../models/note.js';

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

// Get ALL Students with related data
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get all students with their user data
    const students = await Student.find().populate({
      path: 'userId',
      select: 'email program department'
    });

    // Get milestones and notes for each student
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const milestones = await Milestone.find({ studentId: student._id });
      const notes = await Note.find({ studentId: student._id });
      
      // Handle case where userId might be null
      const userData = student.userId || {};
      
      return {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: userData.email || student.email || 'No email available',
        major: student.major || userData.program || 'No major specified',
        department: userData.department || 'No department specified',
        programStatus: student.programStatus || 'Active',
        milestones: milestones || [],
        notes: notes || []
      };
    }));

    res.json(enrichedStudents);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID with related data
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate({
      path: 'userId',
      select: 'email program department'
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const milestones = await Milestone.find({ studentId: student._id });
    const notes = await Note.find({ studentId: student._id });

    // Handle case where userId might be null
    const userData = student.userId || {};

    const enrichedStudent = {
      _id: student._id,
      firstname: student.firstname,
      lastname: student.lastname,
      email: userData.email || student.email || 'No email available',
      major: student.major || userData.program || 'No major specified',
      department: userData.department || 'No department specified',
      programStatus: student.programStatus || 'Active',
      milestones: milestones || [],
      notes: notes || []
    };

    res.json(enrichedStudent);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a Student
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('userId');
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a Student
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
