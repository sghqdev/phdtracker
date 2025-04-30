const express = require('express');
const router = express.Router();
const { createNotification } = require('../controllers/notificationController');

router.post('/notifications', createNotification);

module.exports = router;
