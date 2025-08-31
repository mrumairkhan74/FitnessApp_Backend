const LeadModel = require('../models/LeadModel');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../middleware/error/httpErrors');
const { StaffModel } = require('../models/Discriminators');

// create leads (staff or member can create)
const createLead = async (req, res, next) => {
    try {
        const staffId = req.user?.id;

        const { firstName, lastName, email, source, phone, street, zipCode, city, country, status, note, startDate, endDate } = req.body;

        const lead = await LeadModel.create({
            createdBy: staffId,
            firstName,
            lastName,
            email,
            phone,
            city,
            country,
            street,
            note,
            startDate,
            endDate,
            zipCode,
            status,
            source
        });
        if (!lead) throw new BadRequestError('Invalid lead details');

        await StaffModel.findByIdAndUpdate(staffId, {
            $push: { leads: lead._id }
        });

        return res.status(200).json({ message: "Lead created successfully", lead });
    }
    catch (err) {
        next(err);
    }
};

// get all leads (paginated)
const getLead = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const skip = (page - 1) * limit;

        const leads = await LeadModel.find()
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email studio',
                populate: {
                    path: 'studio',
                    select: 'studioName studioOwner'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (leads.length === 0) throw new NotFoundError("No leads available");

        const totalLeads = await LeadModel.countDocuments();
        const totalPages = Math.ceil(totalLeads / limit);

        return res.status(200).json({
            message: "Leads retrieved successfully",
            page,
            limit,
            totalPages,
            totalLeads,
            leads
        });
    }
    catch (error) {
        next(error);
    }
};

// get all leads by the logged-in user
const getLeadsByUser = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const leads = await LeadModel.find({ createdBy: userId })
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email studio',
                populate: {
                    path: 'studio',
                    select: 'studioName studioOwner'
                }
            })
            .sort({ createdAt: -1 });

        if (leads.length === 0) throw new NotFoundError("No leads created by this user");

        return res.status(200).json({ message: "Your leads", count: leads.length, leads });
    }
    catch (error) {
        next(error);
    }
};

// get single lead by id
const getLeadById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const lead = await LeadModel.findById(id)
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email studio',
                populate: {
                    path: 'studio',
                    select: 'studioName studioOwner'
                }
            })

        if (!lead) throw new NotFoundError("Lead not found");

        return res.status(200).json({ message: "Lead details", lead });
    }
    catch (error) {
        next(error);
    }
};

// update lead
const updateLeadById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateLead = req.body;
        const userId = req.user?.id;

        const lead = await LeadModel.findById(id);
        if (!lead) throw new NotFoundError("Lead not found");

        if (lead.createdBy.toString() !== userId) {
            throw new ForbiddenError("You are not allowed to update this lead");
        }

        const updatedLead = await LeadModel.findByIdAndUpdate(id, updateLead, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Lead updated successfully',
            lead: updatedLead
        });
    }
    catch (error) {
        next(error);
    }
};

// delete lead
const deleteLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const lead = await LeadModel.findById(id);
        if (!lead) throw new NotFoundError("Lead not found");

        if (lead.createdBy.toString() !== userId) {
            throw new ForbiddenError("You are not allowed to delete this lead");
        }

        await LeadModel.findByIdAndDelete(id);

        await StaffModel.findByIdAndUpdate(userId, { $pull: { leads: lead._id } });

        return res.status(200).json({
            status: true,
            message: "Lead deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};

module.exports = {
    createLead,
    getLead,
    getLeadById,
    getLeadsByUser,
    updateLeadById,
    deleteLead
};
