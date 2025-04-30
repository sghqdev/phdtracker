import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Add this at the top of your route handlers
router.use((req, res, next) => {
  console.log('Auth Route Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie with proper options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Add this log to verify token is being set
    console.log('Setting auth token:', {
      userId: user._id,
      tokenPresent: !!token,
      cookies: res.getHeaders()['set-cookie']
    });

    // Log the token being set
    console.log('Setting auth token for user:', {
      userId: user._id,
      role: user.role,
      tokenSet: !!token
    });

    // Send user data (without password)
    res.json({
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      program: user.program,
      department: user.department
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  console.log('Register request received:', req.body);
  try {
    const { email, password, first_name, last_name, role, program, department, advisor } = req.body;

    // Validate required fields based on role
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!first_name) missingFields.push('first name');
    if (!last_name) missingFields.push('last name');
    if (!role) missingFields.push('role');
    if (!program) missingFields.push('program');
    if (!department) missingFields.push('department');
    if (role === 'student' && !advisor) missingFields.push('advisor');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with advisor if student
    const userData = {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      program,
      department
    };

    if (role === 'student') {
      userData.advisor = advisor;
    }

    user = new User(userData);

    try {
      await user.save();
      if (role === 'student') {
        console.log('New student created:', {
          studentId: user._id,
          advisorId: user.advisor,
          role: user.role
        });
        
        const advisor = await User.findById(user.advisor);
        console.log('Assigned advisor details:', advisor);
      }
      
      res.status(201).json({ 
        success: true,
        message: 'User created successfully' 
      });
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(key => 
          saveError.errors[key].message
        );
        return res.status(400).json({ 
          message: `Validation failed: ${validationErrors.join(', ')}` 
        });
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ 
      message: `Server error during registration: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update your advisors route with more logging
router.get('/advisors', async (req, res) => {
  try {
    console.log('Advisors route hit - starting query');
    
    const advisors = await User.find({ 
      role: 'advisor'
    }).select('_id first_name last_name email');

    console.log('Advisors query completed:', {
      success: true,
      count: advisors.length,
      advisors: advisors.map(a => ({
        id: a._id,
        name: `${a.first_name} ${a.last_name}`,
        email: a.email
      }))
    });

    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.json(advisors);
  } catch (error) {
    console.error('Error in advisors route:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to load advisors' });
  }
});

// Update the status route with more logging
router.get('/status', protect, async (req, res) => {
  try {
    console.log('Auth status check for user:', {
      userId: req.user?._id,
      email: req.user?.email,
      role: req.user?.role
    });

    const user = {
      _id: req.user._id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      role: req.user.role,
      program: req.user.program,
      department: req.user.department
    };
    
    res.json(user);
  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({ message: 'Error checking auth status' });
  }
});

// Temporary debug route
router.get('/debug/users', async (req, res) => {
  try {
    const allUsers = await User.find({});
    console.log('All users in system:', {
      total: allUsers.length,
      byRole: {
        advisors: allUsers.filter(u => u.role === 'advisor').length,
        students: allUsers.filter(u => u.role === 'student').length
      },
      advisorDetails: allUsers
        .filter(u => u.role === 'advisor')
        .map(a => ({
          id: a._id,
          name: `${a.first_name} ${a.last_name}`,
          email: a.email
        }))
    });
    
    res.json({
      total: allUsers.length,
      advisors: allUsers.filter(u => u.role === 'advisor').length,
      students: allUsers.filter(u => u.role === 'student').length
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this temporary debug route
router.get('/debug/check-advisors', async (req, res) => {
  try {
    console.log('Checking database for advisors...');
    
    // Get all users
    const allUsers = await User.find({});
    console.log('All users:', allUsers.map(u => ({
      id: u._id,
      email: u.email,
      role: u.role,
      name: `${u.first_name} ${u.last_name}`
    })));

    // Get just advisors
    const advisors = await User.find({ role: 'advisor' });
    console.log('Advisors found:', {
      count: advisors.length,
      details: advisors.map(a => ({
        id: a._id,
        email: a.email,
        name: `${a.first_name} ${a.last_name}`
      }))
    });

    res.json({
      totalUsers: allUsers.length,
      advisorCount: advisors.length,
      advisors: advisors.map(a => ({
        id: a._id,
        email: a.email,
        name: `${a.first_name} ${a.last_name}`
      }))
    });
  } catch (error) {
    console.error('Debug check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this temporary route to create a test advisor
router.get('/debug/create-advisor', async (req, res) => {
  try {
    const testAdvisor = new User({
      email: 'test.advisor@example.com',
      password: await bcrypt.hash('password123', 10),
      first_name: 'Test',
      last_name: 'Advisor',
      role: 'advisor',
      department: 'Computer Science',
      program: 'PhD'
    });

    await testAdvisor.save();
    console.log('Test advisor created:', {
      id: testAdvisor._id,
      email: testAdvisor.email,
      name: `${testAdvisor.first_name} ${testAdvisor.last_name}`
    });

    res.json({ message: 'Test advisor created', advisor: testAdvisor });
  } catch (error) {
    console.error('Error creating test advisor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this near your other routes
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

export default router; 