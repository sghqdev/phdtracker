import Notification from '../models/notification.js';
import Milestone from '../models/milestone.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    console.log('\n=== Fetching Notifications ===');
    console.log('Request headers:', req.headers);
    console.log('Request cookies:', req.cookies);
    console.log('User:', req.user);
    
    if (!req.user?._id) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('milestoneId');
    
    console.log('Found notifications:', {
      count: notifications.length,
      userId: req.user._id,
      notifications: notifications.map(n => ({
        id: n._id,
        title: n.title,
        isRead: n.isRead
      }))
    });
    
    res.json(notifications || []);
  } catch (error) {
    console.error('Error fetching notifications:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
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