import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Milestone from './models/milestone.js';

dotenv.config();

async function updateMilestones() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB');

    // Update pending to Planned
    const pending = await Milestone.updateMany(
      { status: 'pending' },
      { $set: { status: 'Planned' } }
    );

    // Update in_progress to InProgress
    const inProgress = await Milestone.updateMany(
      { status: 'in_progress' },
      { $set: { status: 'InProgress' } }
    );

    // Update completed to Completed
    const completed = await Milestone.updateMany(
      { status: 'completed' },
      { $set: { status: 'Completed' } }
    );

    console.log('Update results:', {
      pending: pending.modifiedCount,
      inProgress: inProgress.modifiedCount,
      completed: completed.modifiedCount
    });

    // Verify the updates
    const milestones = await Milestone.find({});
    console.log('Current milestone statuses:', milestones.map(m => ({
      title: m.title,
      status: m.status
    })));

  } catch (error) {
    console.error('Error updating milestones:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

updateMilestones(); 