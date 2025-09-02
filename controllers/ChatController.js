const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const { NotFoundError, BadRequestError, UnAuthorizedError } = require('../middleware/error/httpErrors')
const { notifyUser } = require('../utils/NotificationService')

const accessChat = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user?.id;

        if (!id) throw new BadRequestError('User is not Provided');

        const chat = await ChatModel.findOne({
            isGroupChat: false,
            users: { $all: [userId, id] }
        })
            .populate('users', 'firstName lastName img ')
            .populate('latestMessage')
        if (chat) {
            return res.json(chat);
        }

        // if no chat create a new chat 
        const newChat = await ChatModel.create({
            chatName: 'One-on-One',
            isGroupChat: false,
            users: [userId, id]
        });

        const fullChat = await ChatModel.findById(newChat._id).populate('users', 'firstName lastName img');
        return res.status(200).json(fullChat);
    }
    catch (error) {
        next(error)
    }
}


const getChat = async (req, res, next) => {
    try {
        const userId = req.user?.id
        const chats = await ChatModel.find({ users: { $elemMatch: { $eq: userId } } })
            .populate('users', 'firstName lastName img')
            .populate('groupAdmin', 'firstName lastName img staffRole ')
            .populate('latestMessage')
            .sort({ createdAt: -1 })

        return res.status(200).json({ status: true, chats })
    }
    catch (error) {
        return next(error)
    }
}


// === createGroup ===

const createGroup = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, users } = req.body;

        if (!name || !users) throw new BadRequestError('Fill all fields');
        if (users.length < 2) throw new BadRequestError('At least 2 members required for a group');

        // include creator in the group
        users.push(userId);

        // create group
        const groupChat = await ChatModel.create({
            chatName: name,
            users,
            isGroupChat: true,
            groupAdmin: userId
        });

        // fetch with population
        const fullGroup = await ChatModel.findById(groupChat._id)
            .populate('users', 'firstName lastName img')
            .populate('groupAdmin', 'firstName lastName img staffRole');

        // notify all members except the creator
        for (const u of fullGroup.users) {
            if (u._id.toString() !== userId.toString()) {
                await notifyUser({
                    userId: u._id,
                    message: `You were added to the group "${fullGroup.chatName}"`,
                    type: 'info'
                });
            }
        }

        return res.status(200).json({ status: true, fullGroup });

    } catch (error) {
        next(error);
    }
};


// ==== Rename Group ===

const renameGroup = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { chatId, chatName } = req.body

        const chat = await ChatModel.findById(chatId);
        if (chat.groupAdmin.toString() !== userId) {
            throw new UnAuthorizedError('You are not Authorized to Rename Group')
        }

        const updateChat = await ChatModel.findByIdAndUpdate(chatId,
            { chatName },
            { new: true }
        ).populate('users', 'firstName lastName img')
            .populate('groupAdmin', 'firstName lastName img staffRole')
        if (!updateChat) throw new NotFoundError('Invalid ChatId')

        return res.status(200).json({
            status: true,
            updateChat
        })
    }
    catch (error) {
        next(error)
    }
}


//  === Add To Group ===

const addToGroup = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { chatId, userIdToAdd } = req.body;

        // verify chat exists
        const chat = await ChatModel.findById(chatId);
        if (!chat) throw new NotFoundError('Chat not found');

        // only admin can add
        if (chat.groupAdmin.toString() !== userId) {
            throw new UnAuthorizedError('You are not authorized to add members to this group');
        }

        // add user to chat
        const updatedChat = await ChatModel.findByIdAndUpdate(
            chatId,
            { $addToSet: { users: userIdToAdd } }, // $addToSet avoids duplicates
            { new: true }
        )
            .populate('users', 'firstName lastName img')
            .populate('groupAdmin', 'firstName lastName img staffRole');

        if (!updatedChat) throw new BadRequestError('Invalid chat or userId');

        // notify the added user
        await notifyUser({
            userId: userIdToAdd,
            message: `You were added to the group "${updatedChat.chatName}"`,
            type: 'info'
        });

        return res.status(200).json({
            status: true,
            chat: updatedChat
        });
    } catch (error) {
        next(error);
    }
};


//  === Remove From Group ===

const removeFromGroup = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { chatId, user } = req.body;
        const chat = await ChatModel.findById(chatId);
        if (chat.groupAdmin.toString() !== userId) throw new UnAuthorizedError('You are to Authorized to Remove someOne')
        const updateChat = await ChatModel.findByIdAndUpdate(chatId,
            {
                $pull: { users: user }
            },
            { new: true }
        ).populate('users', 'firstName lastName img')
            .populate('groupAdmin', 'firstName lastName img staffRole')

        if (!updateChat) throw new NotFoundError('Invalid Chat Id')
        return res.status(200).json({
            status: true,
            updateChat
        })
    }
    catch (error) {
        next(error)
    }
}



module.exports = {
    createGroup,
    accessChat,
    getChat,
    addToGroup,
    renameGroup,
    removeFromGroup
}