import Notification from '../models/notification.js';
import Milestone from '../models/milestone.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('milestoneId');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create notification for milestone reminder
export const createMilestoneReminder = async (milestoneId, userId) => {
  try {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return;

    const notification = new Notification({
      userId,
      milestoneId,
      title: 'Milestone Reminder',
      message: `Reminder: Your milestone "${milestone.title}" is due soon.`,
      isRead: false
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating milestone reminder:', error);
  }
}; 