const RelationModel = require('../models/RelationModel');
const { BadRequestError, NotFoundError } = require('../middleware/error/httpErrors')
const { StaffModel, MemberModel } = require('../models/Discriminators');
const LeadModel = require('../models/LeadModel');
const UserModel = require('../models/UserModel')

// create Relations
const createRelation = async (req, res, next) => {
    try {
        const staffId = req.user?.id;
        const { manualName, relatedMember, category, relationType, relationManual, lead } = req.body;
        // if you have member then select member 
        const memberDoc = relatedMember ? await MemberModel.findById(relatedMember) : null
        // if you have lead select lead 
        const leadDoc = lead ? await LeadModel.findById(lead) : null


        // you also need provide one thing from 3 
        if (!leadDoc && !manualName && !memberDoc) throw new BadRequestError('Please provide either Related member or manual name or lead')
        const relation = await RelationModel.create({
            createdBy: staffId,
            relatedMember: memberDoc ? memberDoc._id : undefined,
            lead: lead ? leadDoc._id : undefined,
            manualName,
            category,
            relationType,
            relationManual,
        });


        await StaffModel.findByIdAndUpdate(staffId, {
            $push: { relations: relation._id }
        })
        return res.status(200).json({ status: true, message: "relation created Successfully", relation })

    } catch (error) {
        next(error)
    }
}

const deleteRelation = async (req, res, next) => {
    try {
        // relation id fetch
        const { id } = req.params;
        const userId = req.user?.id;

        const relation = await RelationModel.findById(id);
        if (!relation) throw new NotFoundError("Invalid Id")
        // fetch user if from token
        if (relation.createdBy.toString() !== userId) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this relation"
            });
        }
        if (!relation) throw new NotFoundError("Invalid ID")



        // delete relation from schema/database
        await RelationModel.findByIdAndDelete(id);
        // invalid id then return this error

        // also remove from userModel where relation saved  
        await UserModel.findByIdAndUpdate(userId,
            { $pull: { relations: relation._id } },
            { new: true }
        )

        // result
        return res.status(200).json({
            status: true,
            message: "Relation Deleted Successfully",
        })
    }
    catch (error) {
        return next(error);
    }
}

const getRelations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const skip = (page - 1) * limit;

        const relations = await RelationModel.find()
            .populate('createdBy', 'firstName lastName role staffRole')
            .populate('relatedMember', 'firstName lastName')
            .populate('lead', 'firstName lastName')
            .sort({ createdAt: -1 }).skip(skip).limit(limit)
        if (relations.length === 0) throw new NotFoundError("No Relation Available")

        const totalRelations = await RelationModel.countDocuments();
        const totalPages = Math.ceil(totalRelations / limit);


        return res.status(200).json({
            message: "relations are below",
            page,
            limit,
            totalPages,
            totalRelations,
            relations
        })
    }
    catch (error) {
        next(error)
    }
}

// Only login users Relation which he created show him
const getRelationsById = async (req, res, next) => {
    try {
        const userId = req.user?.id;  //fetch user if from verify json token

        const relations = await RelationModel.find({ $or: [{ createdBy: userId }, { relatedMember: userId }] })
            .populate('createdBy', 'firstName lastName')
            .populate('relatedMember', 'firstName lastName')
            .populate('lead', 'firstName lastName')
        if (relations.length === 0) throw new NotFoundError("No Relation created By User")
        return res.status(200).json({ message: "All Your relations Below", count: relations.length, relations })
    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    createRelation,
    deleteRelation,
    getRelations,
    getRelationsById
}