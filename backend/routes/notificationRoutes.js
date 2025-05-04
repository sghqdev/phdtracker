import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Get all notifications for the current user
router.get('/', verifyToken, getNotifications);

// Mark a notification as read
router.put('/:id/read', verifyToken, markAsRead);

// Mark all notifications as read
router.put('/read-all', verifyToken, markAllAsRead);

export default router; 