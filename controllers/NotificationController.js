// controllers/notificationController.js
const Notification = require('../models/NotificationModel');

const getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 }); // latest first

        res.status(200).json({
            status: true,
            notifications
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUserNotifications };
