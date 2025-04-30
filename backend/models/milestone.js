import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
    studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
  type: String,
  enum: ['Planned', 'InProgress', 'PendingApproval', 'Completed'], 
  default: 'Planned',
},
  dueDate: {
    type: Date,
    required: false,
  },
  reminderDate: {
    type: Date,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isMajor: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

// Update the updatedAt timestamp before saving
MilestoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);
export default Milestone;
