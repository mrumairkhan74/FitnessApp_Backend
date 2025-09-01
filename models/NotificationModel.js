const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', "success", "warning", "error","appointment"],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })


const NotificationModel = mongoose.model('Notification', notificationSchema)
module.exports = NotificationModel