import express from 'express';
import Student from '../models/Student.js';
import Note from '../models/note.js';
import { verifyToken } from '../middleware/verifyToken.js';

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
router.get('/', verifyToken, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId')
      .lean();
    
    // Get notes count for each student
    const studentsWithNotes = await Promise.all(students.map(async (student) => {
      const notes = await Note.find({ studentId: student._id });
      const unreadNotes = notes.filter(note => !note.isRead).length;
      return {
        ...student,
        id: student._id,
        notes,
        unreadNotesCount: unreadNotes
      };
    }));

    res.json(studentsWithNotes);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Add id field for frontend compatibility
    const studentResponse = student.toObject();
    studentResponse.id = studentResponse._id;
    res.json(studentResponse);
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
    
    // Add id field for frontend compatibility
    const studentResponse = updatedStudent.toObject();
    studentResponse.id = studentResponse._id;
    res.json(studentResponse);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(400).json({ error: err.message });
  }
});

// Reset unread notes count
router.put('/:id/reset-unread', verifyToken, async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { unreadNotesCount: 0 },
      { new: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Add id field for frontend compatibility
    const studentResponse = updatedStudent.toObject();
    studentResponse.id = studentResponse._id;
    res.json(studentResponse);
  } catch (err) {
    console.error('Error resetting unread count:', err);
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
