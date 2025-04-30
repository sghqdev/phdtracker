import express from 'express';
import User from '../models/user.js';
import Milestone from '../models/milestone.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Add this near the top of your routes
router.get('/test', async (req, res) => {
  res.json({ message: 'Advisor routes working' });
});

// Add this route to get all pending milestones for an advisor
router.get('/pending-milestones', protect, async (req, res) => {
  try {
    console.log('Starting pending milestones fetch for advisor:', {
      advisorId: req.user._id,
      advisorRole: req.user.role
    });
    
    // Get all students advised by this advisor
    const students = await User.find({ advisor: req.user._id });
    console.log('Found students:', {
      count: students.length,
      students: students.map(s => ({
        id: s._id,
        name: `${s.first_name} ${s.last_name}`,
        email: s.email
      }))
    });
    
    if (students.length === 0) {
      console.log('No students found for advisor');
      return res.json([]); // Return empty array instead of error
    }

    const studentIds = students.map(student => student._id);

    // First, let's check all milestones for these students
    const allMilestones = await Milestone.find({
      student: { $in: studentIds }
    });
    console.log('All milestones found:', {
      total: allMilestones.length,
      byStatus: allMilestones.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {})
    });

    // Now get pending ones
    const pendingMilestones = await Milestone.find({
      student: { $in: studentIds },
      status: 'PendingApproval'
    }).populate('student', 'first_name last_name');

    console.log('Pending milestones details:', {
      count: pendingMilestones.length,
      milestones: pendingMilestones.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status,
        studentId: m.student?._id,
        studentName: m.student ? `${m.student.first_name} ${m.student.last_name}` : 'Unknown'
      }))
    });

    // Format the response
    const formattedMilestones = pendingMilestones.map(milestone => ({
      _id: milestone._id,
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      isMajor: milestone.isMajor,
      studentId: milestone.student?._id,
      studentName: milestone.student ? 
        `${milestone.student.first_name} ${milestone.student.last_name}` : 
        'Unknown Student'
    }));

    console.log('Sending response:', {
      count: formattedMilestones.length,
      milestones: formattedMilestones.map(m => ({
        id: m._id,
        title: m.title,
        studentName: m.studentName
      }))
    });

    res.json(formattedMilestones);
  } catch (error) {
    console.error('Error in pending-milestones route:', {
      error: error.message,
      stack: error.stack,
      user: req.user?._id
    });
    res.status(500).json({ 
      message: 'Error fetching pending milestones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add this route to get all advisors (no protection needed as it's used in login)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching advisors...');
    const advisors = await User.find({ role: 'advisor' });
    console.log('Found advisors:', {
      count: advisors.length,
      advisors: advisors.map(a => ({
        id: a._id,
        name: `${a.first_name} ${a.last_name}`,
        email: a.email
      }))
    });
    res.json(advisors);
  } catch (error) {
    console.error('Error fetching advisors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this route to get all students for an advisor
router.get('/students', protect, async (req, res) => {
  try {
    console.log('Fetching students for advisor:', req.user._id);
    
    const students = await User.find({ 
      advisor: req.user._id,
      role: 'student'
    }).select('_id first_name last_name email program department');

    console.log('Found students:', students.length);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to load students' });
  }
});

// Add route to get a single student's details
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    console.log('Fetching student details:', req.params.studentId);
    
    const student = await User.findOne({ 
      _id: req.params.studentId,
      advisor: req.user._id,
      role: 'student'
    }).select('_id first_name last_name email program department');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Found student:', student);
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to load student details' });
  }
});

// Add other advisor routes here...

export default router; 