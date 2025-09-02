const { NotFoundError, BadRequestError } = require('../middleware/error/httpErrors');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');
const ChatModel = require('../models/ChatModel')
const { notifyUser } = require('../utils/NotificationService')

const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { content, chat } = req.body;
        if (!content || !chat) throw new BadRequestError("Invalid Data");
        const newMessage = {
            sender: userId,
            content,
            chat,
        };
        console.log(content, chat)
        let message = await MessageModel.create(newMessage);

        message = await message.populate('sender', "firstName lastName img")

        message = await message.populate({
            path: 'chat',
            populate: {
                path: 'users',
                select: 'firstName lastName img',
            }
        });
        
        await ChatModel.findByIdAndUpdate(chat, { latestMessage: message });

        const sender = message.sender;
        const chatUsers = message.chat.users;

        for (const u of chatUsers) {
            if (u._id.toString() !== userId.toString()) {
                await notifyUser({
                    userId: u._id,
                    message: `You have a new message from ${sender.firstName} ${sender.lastName}`,
                    type: 'info'
                });
            }
        }
        return res.status(200).json(message);


    }
    catch (error) {
        next(error)
    }
}


// === fetch Message ===

const allMessage = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const chatId = req.params.id
        const message = await MessageModel.find({ chat: chatId })
            .populate('sender', 'firstName lastName img')
            .populate('chat')

        return res.status(200).json({
            status: true,
            message
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    sendMessage,
    allMessage
}
