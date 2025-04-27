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
  enum: ['Planned', 'InProgress', 'PendingApproval', 'Completed'], // Ensure these match the frontend
  default: 'Planned',
},
  dueDate: {
    type: Date,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);
export default Milestone;
