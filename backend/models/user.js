import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    lowercase: true
  },
  last_name: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'advisor', 'admin'],
    default: 'student'
  },
  program: {
    type: String,
    required: true
  },
  department:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }

}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
