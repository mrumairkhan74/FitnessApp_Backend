const BlockedModel = require('../models/BlockedModel');
const { StaffModel } = require('../models/Discriminators')
const { NotFoundError, BadRequestError, UnAuthorizedError } = require('../middleware/error/httpErrors')


const createBlockSlot = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { date, startTime, endTime, resourceType, blockAllResources, note } = req.body;
        const conflict = await BlockedModel.findOne({
            date: new Date(date),
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ],
            $or: [
                { blockAllResources: true },
                { resourceType: { $in: resourceType } }
            ]
        });

        if (conflict) throw new BadRequestError("Time conflict with other");
        const newBlock = await BlockedModel.create({
            date,
            startTime,
            endTime,
            resourceType,
            blockAllResources,
            note
        })
        await StaffModel.findByIdAndUpdate(userId, {
            $push: { blocked: newBlock._id }
        })
        return res.status(200).json({
            status: true,
            newBlock
        })

    } catch (error) {
        next(error)
    }
}



const getBlocked = async (req, res, next) => {
    try {
        const block = await BlockedModel.find().populate('createdBy', 'firstName lastName studioName studioOwner img');
        if (!block) throw new NotFoundError("no block available");
        return res.status(200).josn({
            status: true,
            block
        })
    }
    catch (error) {
        next(error)
    }
}



const deleteBlock = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params
        const block = await BlockModel.findById(id);
        if (!block) throw new NotFoundError('Invalid id')
        if (block.createdBy.toString !== userId) throw new UnAuthorizedError('you are not Authorized to delete this block Slot');
        const blockDelete = await BlockedModel.findByIdAndDelete(id)
        await StaffModel.findByIdAndUpdate(userId, {
            $pull: { blocked: blockDelete._id }
        })

        return res.status(200).json({
            status: true,
            message: "Block delete Successfully"
        });

    }
    catch (error) {
        next(error)
    }
}




module.exports = {
    createBlockSlot,
    getBlocked,
    deleteBlock
}