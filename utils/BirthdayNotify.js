const cron = require('node-cron');
const UserModel = require('../models/UserModel');
const NotificationModel = require('../models/NotificationModel');
const { notifyUser } = require('./NotificationService'); 
const server = require('../server');

const io = server.get("io");

cron.schedule("0 0 * * *", async () => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const users = await UserModel.find();

        for (let user of users) {
            if (!user.dateOfBirth) continue;

            const userMonth = user.dateOfBirth.getMonth() + 1;
            const userDay = user.dateOfBirth.getDate();

            if (userMonth === month && userDay === day) {
                // 1. Save in DB
                const notification = await NotificationModel.create({
                    userId: user._id,
                    title: "🎉 Happy Birthday!",
                    message: `🎉 Wishing you a wonderful day, ${user.firstName} ${user.lastName}`,
                    type: "Birthday",
                    isRead: false
                });

                // 2. Send live notification (socket + email if needed)
                io.emit(`notification-${user._id}`, notification);

                await notifyUser(
                    user._id,
                    user.email, // optional, can pass null if you don’t want email
                    "🎉 Happy Birthday!",
                    `🎉 Wishing you a wonderful day, ${user.firstName} ${user.lastName}`,
                    "Birthday"
                );
            }
        }

        console.log("✅ Birthday notifications saved and sent.");
    } catch (error) {
        console.error("❌ Error sending birthday notifications:", error);
    }
});
