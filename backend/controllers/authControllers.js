import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Student from '../models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

// SIGNUP
export const signup = async (req, res) => {
  const { email, password, first_name, last_name, role, program, department, advisor } = req.body;
  try {
    console.log('Signup request body:', { email, first_name, last_name, role, program, department, advisor });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with advisor if role is student
    const userData = {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      program: program || '',
      department: department || ''
    };

    if (role === 'student' && advisor) {
      userData.advisor = advisor;
    }

    const newUser = await User.create(userData);
    console.log('Created new user:', newUser._id);

    let profile = null;
    const userRole = role.toLowerCase();

    if (userRole === 'student') {
      try {
      const newStudent = await Student.create({
        userId: newUser._id,
        firstname: first_name,
        lastname: last_name,
        major: program || '',
        concentration: '',
          programStatus: 'Active',
          email: email,
          advisorId: advisor || null
      });
        console.log('Created new student profile:', newStudent._id);
        
      profile = { student: {
        id: newStudent._id,
        firstname: newStudent.firstname,
        lastname: newStudent.lastname,
        major: newStudent.major,
          programStatus: newStudent.programStatus,
          advisorId: newStudent.advisorId
      }};
      } catch (studentError) {
        console.error('Error creating student profile:', studentError);
        // Delete the user if student creation fails
        await User.findByIdAndDelete(newUser._id);
        return res.status(500).json({ 
          success: false,
          message: 'Error creating student profile', 
          error: studentError.message 
        });
      }
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    const user = {
      _id: newUser._id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      program: newUser.program,
      department: newUser.department,
      advisor: newUser.advisor
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
      ...profile
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookie with secure options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
      path: '/'
    });

    // Log the cookie being set
    console.log('Setting auth cookie:', {
      userId: user._id,
      tokenPresent: !!token,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000,
        path: '/'
      }
    });

    const userData = {
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      program: user.program,
      department: user.department
    };

    let profile = null;
    const userRole = user.role.toLowerCase();

    if (userRole === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = { student: {
          id: student._id,
          firstname: student.firstname,
          lastname: student.lastname,
          major: student.major,
          programStatus: student.programStatus
        }};
      }
    }

    res.status(200).json({
      success: true,
      user: userData,
      ...profile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CHECK AUTH STATUS
export const checkAuthStatus = async (req, res) => {
  try {
    // If no user in request (no token), return null
    if (!req.user) {
      return res.status(200).json({ success: false, user: null });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(200).json({ success: false, user: null });
    }

    const userData = {
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      program: user.program,
      department: user.department
    };

    let profile = null;
    if (user.role.toLowerCase() === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = { student: {
          id: student._id,
          firstname: student.firstname,
          lastname: student.lastname,
          major: student.major,
          programStatus: student.programStatus
        }};
      }
    }

    res.status(200).json({
      success: true,
      user: userData,
      ...profile
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(200).json({ success: false, user: null });
  }
};

// GET ADVISORS
export const getAdvisors = async (req, res) => {
  try {
    const advisors = await User.find({ role: 'advisor' })
      .select('_id email first_name last_name department')
      .lean();

    res.status(200).json(advisors);
  } catch (error) {
    console.error('Error fetching advisors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
