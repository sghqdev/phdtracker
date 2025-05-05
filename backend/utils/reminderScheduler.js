import cron from 'node-cron';
import Milestone from '../models/milestone.js';
import Notification from '../models/notification.js';

// Schedule the reminder check to run every day at midnight
export const startReminderScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find milestones with reminders due tomorrow
      const upcomingMilestones = await Milestone.find({
        reminderDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('student');

      // Create notifications for each upcoming milestone
      for (const milestone of upcomingMilestones) {
        const notification = new Notification({
          userId: milestone.student._id,
          milestoneId: milestone._id,
          title: 'Upcoming Milestone Reminder',
          message: `Reminder: The milestone "${milestone.title}" is due tomorrow.`,
          isRead: false
        });

        await notification.save();
      }

      console.log(`Created ${upcomingMilestones.length} reminder notifications`);
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
}; 