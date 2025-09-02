// routes/notificationRoutes.js
const express = require('express');
const { getUserNotifications } = require('../controllers/NotificationController');
const { verifyAccessToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyAccessToken, getUserNotifications);

module.exports = router;
