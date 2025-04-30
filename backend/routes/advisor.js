import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/user.js';
import Milestone from '../models/milestone.js';
import mongoose from 'mongoose';

const router = express.Router();

// Add this near the top of your routes
router.get('/debug/auth-check', protect, authorize('advisor'), async (req, res) => {
  try {
    console.log('\n=== Auth Debug ===');
    console.log('1. Current user:', {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    });
    
    // Check if user exists in DB
    const userInDb = await User.findById(req.user._id);
    console.log('2. User in DB:', {
      found: !!userInDb,
      role: userInDb?.role,
      email: userInDb?.email
    });

    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        role: req.user.role,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this temporary debug route at the top of your routes
router.get('/debug/test-milestone/:studentId', protect, authorize('advisor'), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log('\n=== Debug Test Route ===');
    
    // 1. Check if student exists
    const student = await User.findById(studentId);
    console.log('1. Student check:', {
      exists: !!student,
      id: studentId,
      name: student ? `${student.first_name} ${student.last_name}` : null
    });

    // 2. Check all milestones in the system
    const allMilestones = await Milestone.find({});
    console.log('2. All milestones:', {
      count: allMilestones.length,
      milestones: allMilestones.map(m => ({
        id: m._id,
        title: m.title,
        studentId: m.student,
        status: m.status
      }))
    });

    // 3. Check milestones for this specific student
    const studentMilestones = await Milestone.find({ student: studentId });
    console.log('3. Student milestones:', {
      count: studentMilestones.length,
      milestones: studentMilestones.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status
      }))
    });

    // 4. Create a test milestone if none exist
    if (studentMilestones.length === 0) {
      const newMilestone = new Milestone({
        title: 'Test Milestone',
        description: 'This is a test milestone',
        status: 'Planned',
        student: studentId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      await newMilestone.save();
      console.log('4. Created test milestone:', newMilestone);
    }

    res.json({
      student: student,
      allMilestonesCount: allMilestones.length,
      studentMilestonesCount: studentMilestones.length,
      message: 'Debug information logged to console'
    });

  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all students assigned to advisor
router.get('/students', protect, authorize('advisor'), async (req, res) => {
  try {
    const advisorId = req.user._id;
    console.log('\n=== Debug Information ===');
    console.log('1. Current advisor ID:', advisorId.toString());
    
    // Find the specific student we know exists (for debugging)
    const specificStudent = await User.findById('68102dc3da15e6876683b296');
    console.log('2. Known student check:', {
      found: !!specificStudent,
      studentAdvisorId: specificStudent?.advisor?.toString(),
      matchesCurrentAdvisor: specificStudent?.advisor?.toString() === advisorId.toString()
    });

    // Get all students with this advisor
    const assignedStudents = await User.find({
      role: 'student',
      advisor: advisorId
    }).select('-password');

    console.log('3. Query parameters:', {
      role: 'student',
      advisorId: advisorId.toString()
    });

    console.log('4. Found students count:', assignedStudents.length);
    
    // Try alternative query just to verify
    const altQuery = await User.find({
      role: 'student',
      'advisor': advisorId.toString()
    });
    
    console.log('5. Alternative query count:', altQuery.length);
    
    // Log all students for verification
    const allStudents = await User.find({ role: 'student' });
    console.log('6. All students in system:', allStudents.map(student => ({
      id: student._id.toString(),
      name: `${student.first_name} ${student.last_name}`,
      advisorId: student.advisor?.toString(),
      matchesAdvisor: student.advisor?.toString() === advisorId.toString()
    })));

    res.json(assignedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get specific student details
router.get('/student/:studentId', protect, authorize('advisor'), async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.studentId,
      role: 'student'
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Failed to fetch student details' });
  }
});

// Get student milestones
router.get('/student/:studentId/milestones', protect, authorize('advisor'), async (req, res) => {
  try {
    console.log('\n=== Milestone Query Debug ===');
    
    // 1. Log the incoming request details
    console.log('1. Request details:', {
      studentId: req.params.studentId,
      advisorId: req.user._id,
      requestPath: req.path
    });

    // 2. Verify student belongs to advisor
    const student = await User.findOne({
      _id: req.params.studentId,
      advisor: req.user._id
    });

    console.log('2. Student verification:', {
      found: !!student,
      studentId: student?._id,
      advisorId: student?.advisor
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not assigned to you' });
    }

    // 3. Find all milestones in the system (for debugging)
    const allMilestones = await Milestone.find({});
    console.log('3. All milestones in system:', {
      count: allMilestones.length,
      milestones: allMilestones.map(m => ({
        id: m._id,
        title: m.title,
        studentId: m.student?.toString(),
        status: m.status,
        matchesRequestedStudent: m.student?.toString() === req.params.studentId
      }))
    });

    // 4. Find student's milestones
    const studentMilestones = await Milestone.find({
      student: req.params.studentId
    });

    console.log('4. Student milestones query:', {
      query: { student: req.params.studentId },
      resultsCount: studentMilestones.length,
      results: studentMilestones.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status
      }))
    });

    res.json(studentMilestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ 
      message: 'Failed to fetch milestones',
      error: error.message 
    });
  }
});

// Provide feedback on milestone
router.post('/milestone/:milestoneId/feedback', protect, authorize('advisor'), async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Verify the milestone belongs to a student assigned to this advisor
    const student = await User.findOne({
      _id: milestone.student,
      advisor: req.user._id
    });

    if (!student) {
      return res.status(403).json({ message: 'Not authorized to provide feedback for this milestone' });
    }

    milestone.feedback = req.body.feedback;
    milestone.lastReviewedBy = req.user._id;
    milestone.lastReviewedAt = Date.now();
    
    await milestone.save();
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify milestone
router.post('/milestone/:milestoneId/verify', protect, authorize('advisor'), async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Verify the milestone belongs to a student assigned to this advisor
    const student = await User.findOne({
      _id: milestone.student,
      advisor: req.user._id
    });

    if (!student) {
      return res.status(403).json({ message: 'Not authorized to verify this milestone' });
    }

    milestone.verified = true;
    milestone.verifiedBy = req.user._id;
    milestone.verifiedAt = Date.now();
    milestone.status = 'Completed';
    
    await milestone.save();
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the test route
router.post('/test/create-milestone', protect, authorize('advisor'), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // Create a test milestone
    const milestone = new Milestone({
      title: 'Test Milestone',
      description: 'This is a test milestone',
      status: 'Planned', // Using the correct status
      student: studentId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    console.log('Creating milestone:', {
      title: milestone.title,
      status: milestone.status,
      student: milestone.student,
      dueDate: milestone.dueDate
    });

    await milestone.save();

    res.json({
      message: 'Test milestone created',
      milestone
    });
  } catch (error) {
    console.error('Error creating test milestone:', error);
    res.status(500).json({ 
      message: 'Failed to create test milestone',
      error: error.message 
    });
  }
});

// Add this debug route
router.get('/debug/milestones', protect, authorize('advisor'), async (req, res) => {
  try {
    const allMilestones = await Milestone.find({}).populate('student', 'first_name last_name email');
    
    console.log('Debug - All Milestones:', {
      count: allMilestones.length,
      milestones: allMilestones.map(m => ({
        id: m._id,
        title: m.title,
        status: m.status,
        student: {
          id: m.student?._id,
          name: m.student ? `${m.student.first_name} ${m.student.last_name}` : 'No student assigned'
        }
      }))
    });

    res.json(allMilestones);
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ message: 'Error fetching all milestones' });
  }
});

export default router; 