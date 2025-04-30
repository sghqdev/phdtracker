const Notification = require('../models/Notification'); // Assuming you have a Mongoose model

exports.createNotification = async (req, res) => {
    try {
        const { milestone, studentId, advisorId, adminId, message } = req.body;
        const recipients = [studentId, advisorId, adminId];

        const newNotification = new Notification({
            milestone,
            studentId,
            advisorId,
            adminId,
            message,
            recipients,
            status: recipients.reduce((acc, user) => ({ ...acc, [user]: 'unread' }), {})
        });

        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
