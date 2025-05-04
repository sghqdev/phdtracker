import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Planned', 'InProgress', 'PendingApproval', 'Completed'],
    default: 'Planned'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isMajor: {
    type: Boolean,
    default: false
  },
  feedback: { type: String },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastReviewedAt: Date,
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Milestone', milestoneSchema);
