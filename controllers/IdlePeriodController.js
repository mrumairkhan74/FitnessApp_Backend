const IdlePeriodModel = require('../models/IdlePeriodModel');
const { MemberModel } = require('../models/Discriminators');
const { uploadIdlePeriod } = require('../utils/CloudinaryUpload');
const { NotFoundError, BadRequestError } = require('../middleware/error/httpErrors');
const { notifyUser } = require('../utils/NotificationService')
// Apply for idle period
const applyIdlePeriod = async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const { reason, startDate, duration } = req.body;

        if (!reason || !startDate || !duration) {
            throw new BadRequestError('All fields are required');
        }

        let documentData = null;
        if (req.file) {
            documentData = await uploadIdlePeriod(req.file.buffer);
        }

        const idlePeriod = await IdlePeriodModel.create({
            member: memberId,
            reason,
            startDate,
            duration,
            document: documentData
        });

        // Push reference to member
        await MemberModel.findByIdAndUpdate(memberId, {
            $push: { idlePeriod: idlePeriod._id }
        });

        res.status(201).json({
            success: true,
            message: 'Idle period applied successfully',
            idlePeriod
        });

    } catch (error) {
        next(error);
    }
};

// Get idle periods for the logged-in member
const getMyIdlePeriods = async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const idlePeriods = await IdlePeriodModel.find({ member: memberId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, idlePeriods });
    } catch (error) {
        next(error);
    }
};

// Get all idle periods (staff)
const getAllIdlePeriods = async (req, res, next) => {
    try {
        const idlePeriods = await IdlePeriodModel.find().populate('member', 'firstName lastName email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, idlePeriods });
    } catch (error) {
        next(error);
    }
};

// Update idle period status (approve/reject) - staff
const updateIdlePeriodStatus = async (req, res, next) => {
    try {
        const userId = req.user?.id
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            throw new BadRequestError('Invalid status');
        }

        const idlePeriod = await IdlePeriodModel.findById(id).populate('member', 'firstName lastName email');
        if (!idlePeriod) throw new NotFoundError('Idle period request not found');

        idlePeriod.status = status;
        await idlePeriod.save();
        await notifyUser({
            userId: idlePeriod.member._id,
            email: idlePeriod.member.email,
            title: `Idle Period ${status}`,
            message: `Your idle period request starting from ${idlePeriod.startDate.toDateString()} has been ${status}.`, // message    
            type: 'info'
        });



        res.status(200).json({
            success: true,
            message: `Idle period request ${status}`,
            idlePeriod
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyIdlePeriod,
    getMyIdlePeriods,
    getAllIdlePeriods,
    updateIdlePeriodStatus
};
