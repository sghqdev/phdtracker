import express from 'express';
import Student from '../models/Student.js';
import Note from '../models/note.js';
import Milestone from '../models/milestone.js';
import { protect } from '../middleware/auth.js';

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
router.get('/', protect, async (req, res) => {
  try {
    const shouldPopulateMilestones = req.query.populate === 'milestones';
    console.log('\n=== Fetching Students ===');
    console.log('Populate milestones:', shouldPopulateMilestones);
    
    const students = await Student.find()
      .populate({
        path: 'userId',
        select: 'email'
      })
      .lean();
    
    console.log('\nFound students:', students.map(s => ({
      id: s._id,
      name: `${s.firstname} ${s.lastname}`,
      userId: s.userId?._id,
      hasUserId: !!s.userId
    })));
    
    // Get notes count for each student
    const studentsWithNotes = await Promise.all(students.map(async (student) => {
      const notes = await Note.find({ studentId: student._id });
      const unreadNotes = notes.filter(note => !note.isRead).length;
      
      // Get milestones if requested
      let milestones = [];
      if (shouldPopulateMilestones && student.userId) {
        // Query milestones using the student's userId
        console.log(`\nQuerying milestones for student ${student._id}:`, {
          studentId: student._id,
          userId: student.userId._id,
          name: `${student.firstname} ${student.lastname}`
        });

        try {
          // Use the userId._id to query milestones since the Milestone model's student field references User
          milestones = await Milestone.find({ student: student.userId._id })
            .sort({ dueDate: 1 });
          
          console.log(`Found ${milestones.length} milestones:`, 
            milestones.map(m => ({
              id: m._id,
              title: m.title,
              status: m.status,
              student: m.student
            }))
          );
        } catch (error) {
          console.error('Error querying milestones:', error);
        }
      }
      
      const studentWithData = {
        ...student,
        id: student._id,
        email: student.userId?.email || student.email || '',
        notes,
        unreadNotesCount: unreadNotes,
        milestones
      };

      console.log(`\nProcessed student ${student._id}:`, {
        name: `${student.firstname} ${student.lastname}`,
        hasMilestones: !!studentWithData.milestones,
        milestoneCount: studentWithData.milestones?.length || 0
      });

      return studentWithData;
    }));

    console.log('\nSending response with students:', studentsWithNotes.map(s => ({
      id: s._id,
      name: `${s.firstname} ${s.lastname}`,
      milestoneCount: s.milestones?.length || 0,
      hasMilestones: !!s.milestones,
      milestones: s.milestones?.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status
      }))
    })));

    res.json(studentsWithNotes);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID
router.get('/:id', protect, async (req, res) => {
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
router.put('/:id', protect, async (req, res) => {
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
router.put('/:id/reset-unread', protect, async (req, res) => {
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
router.delete('/:id', protect, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
