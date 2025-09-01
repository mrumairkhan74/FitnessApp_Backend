const NotificationModel = require('../models/NotificationModel')
const sendEmail = require("./sendEmail")



const saveNotification = async (userId, message, type = "info") => {
    try {
        const notification = new NotificationModel({
            userId,
            message,
            type
        })
        await notification.save();
        console.log(`Notification saved for ${userId} `);
        return notification;
    } catch (error) {
        console.error("Notification Error:", error.message)
    }
}


const notifyUser = async (userId, email, subject, message, type) => {
    if (userId) await saveNotification(userId, message, type);
    if (email) await sendEmail(email, subject, message);

}

module.exports = { notifyUser, saveNotification }