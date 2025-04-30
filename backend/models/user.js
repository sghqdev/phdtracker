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
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(v) {
        if (this.role !== 'student') return true;
        return v != null;
      },
      message: 'Students must have an advisor assigned'
    }
  }
}, { timestamps: true });

// Add a pre-save hook to validate advisor
UserSchema.pre('save', async function(next) {
  if (this.role === 'student' && this.advisor) {
    const advisor = await this.constructor.findOne({ 
      _id: this.advisor,
      role: 'advisor'
    });
    if (!advisor) {
      throw new Error('Selected advisor not found or is not an advisor');
    }
  }
  next();
});

const User = mongoose.model('User', UserSchema);
export default User;
