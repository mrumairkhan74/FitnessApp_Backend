const mongoose = require('mongoose');
const { Message } = require('twilio/lib/twiml/MessagingResponse');


const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }
}, { timestamps: true });



const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel