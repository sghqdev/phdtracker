import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Student from '../models/student.js';
import dotenv from 'dotenv';

dotenv.config();

// SIGNUP
export const signup = async (req, res) => {
  const { email, password, first_name, last_name, role, program, department } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      program,
      department
    });

    let profile = null;
    const userRole = role.toLowerCase();

    if (userRole === 'student') {
      const newStudent = await Student.create({
        userId: newUser._id,
        firstname: first_name,
        lastname: last_name,
        major: program || '',
        concentration: '',
        programStatus: 'Active'
      });
      profile = { student: {
        id: newStudent._id,
        firstname: newStudent.firstname,
        lastname: newStudent.lastname,
        major: newStudent.major,
        programStatus: newStudent.programStatus
      }};
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const user = {
      id: newUser._id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      program: newUser.program,
      department: newUser.department
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user,
      ...profile
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN (Fully Updated!)
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

    const userData = {
      id: user._id,
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
      message: 'Login successful',
      token,
      user: userData,
      ...profile
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
