import Milestone from '../models/milestone.js';
import Student from '../models/Student.js';
import Notification from '../models/notification.js';

// Create a new milestone
export const createMilestone = async (req, res) => {
  try {
    const { title, description, dueDate, status, isMajor, reminderDate } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const milestone = new Milestone({
      student: studentId,
      title,
      description,
      dueDate,
      status,
      isMajor,
      reminderDate
    });

    await milestone.save();

    // Create a notification for the milestone
    const notification = new Notification({
      student: studentId,
      type: 'milestone',
      title: 'New Milestone Created',
      message: `A new milestone "${title}" has been created for you.`,
      isRead: false
    });

    await notification.save();

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ message: 'Error creating milestone', error: error.message });
  }
};

// Update a milestone
export const updateMilestone = async (req, res) => {
  try {
    const { title, description, dueDate, status, isMajor, reminderDate } = req.body;
    const milestoneId = req.params.milestoneId;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Update milestone fields
    milestone.title = title;
    milestone.description = description;
    milestone.dueDate = dueDate;
    milestone.status = status;
    milestone.isMajor = isMajor;
    milestone.reminderDate = reminderDate;

    await milestone.save();

    // Create a notification for the milestone update
    const notification = new Notification({
      student: milestone.student,
      type: 'milestone',
      title: 'Milestone Updated',
      message: `The milestone "${title}" has been updated.`,
      isRead: false
    });

    await notification.save();

    res.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: 'Error updating milestone', error: error.message });
  }
};

// Get all milestones for a student
export const getStudentMilestones = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const milestones = await Milestone.find({ student: studentId })
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
};

// Delete a milestone
export const deleteMilestone = async (req, res) => {
  try {
    const milestoneId = req.params.milestoneId;
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    await Milestone.findByIdAndDelete(milestoneId);

    // Create a notification for the milestone deletion
    const notification = new Notification({
      student: milestone.student,
      type: 'milestone',
      title: 'Milestone Deleted',
      message: `The milestone "${milestone.title}" has been deleted.`,
      isRead: false
    });

    await notification.save();

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ message: 'Error deleting milestone', error: error.message });
  }
}; 