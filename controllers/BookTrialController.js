const LeadModel = require('../models/LeadModel');
const RelationModel = require('../models/RelationModel');
const BookTrialModel = require('../models/BookTrialModel');
const { BadRequestError, NotFoundError } = require('../middleware/error/httpErrors');
const { MemberModel, StaffModel } = require('../models/Discriminators');

// Create BookTrial
const createBookTrial = async (req, res, next) => {
  try {
    const { trialType, trialDate, trialTime, note, startDate, endDate, relation, member, lead } = req.body;
    const userId = req.user?.id;

    // validate relation, lead, member
    const [relationDoc, leadDoc, memberDoc] = await Promise.all([
      RelationModel.findById(relation),
      LeadModel.findById(lead),
      MemberModel.findById(member)
    ]);

    if (!relationDoc) throw new BadRequestError('Invalid Relation ID');
    if (!leadDoc) throw new BadRequestError('Invalid Lead ID');
    if (!memberDoc) throw new BadRequestError('Invalid Member ID');

    // create
    const bookTrial = await BookTrialModel.create({
      trialType,
      trialDate,
      trialTime,
      note,
      startDate,
      endDate,
      createdBy: [userId],
      member: memberDoc._id,
      lead: leadDoc._id,
      relation: relationDoc._id,
    });

    // push into related collections
    await StaffModel.findByIdAndUpdate(userId, { $push: { bookTrials: bookTrial._id } });
    await MemberModel.findByIdAndUpdate(memberDoc._id, { $push: { bookTrials: bookTrial._id } });

    return res.status(201).json({
      success: true,
      message: "BookTrial created successfully",
      bookTrial
    });
  } catch (error) {
    next(error);
  }
};

// Update
const updateBookTrialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;

    const bookTrial = await BookTrialModel.findById(id);
    if (!bookTrial) throw new NotFoundError("BookTrial not found");

    // check ownership
    if (!bookTrial.createdBy.some((u) => u.toString() === userId)) {
      return res.status(403).json({ status: false, message: "Not allowed to update this BookTrial" });
    }

    const updated = await BookTrialModel.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json({
      success: true,
      message: 'BookTrial updated successfully',
      bookTrial: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete
const deleteBookTrial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const bookTrial = await BookTrialModel.findById(id);
    if (!bookTrial) throw new NotFoundError("BookTrial not found");

    if (!bookTrial.createdBy.some((u) => u.toString() === userId)) {
      return res.status(403).json({ status: false, message: "Not allowed to delete this BookTrial" });
    }

    await BookTrialModel.findByIdAndDelete(id);

    // pull from both staff + member
    await StaffModel.findByIdAndUpdate(userId, { $pull: { bookTrials: bookTrial._id } });
    await MemberModel.findByIdAndUpdate(bookTrial.member, { $pull: { bookTrials: bookTrial._id } });

    return res.status(200).json({
      success: true,
      message: "BookTrial deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all
const getBookTrials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 5);
    const skip = (page - 1) * limit;

    const bookTrials = await BookTrialModel.find()
      .populate('createdBy', 'username staffRole')
      .populate('relation', 'relationType category')
      .populate('lead', 'firstName lastName email')
      .populate('member', 'firstName lastName email')
      .sort({ createdAt: -1 }).skip(skip).limit(limit);

    if (bookTrials.length === 0) throw new NotFoundError("No BookTrial available");

    const totalBookTrials = await BookTrialModel.countDocuments();
    const totalPages = Math.ceil(totalBookTrials / limit);

    return res.status(200).json({
      message: "BookTrials are below",
      page,
      limit,
      totalPages,
      totalBookTrials,
      bookTrials
    });
  } catch (error) {
    next(error);
  }
};

// Get by member (my BookTrials)
const getBookTrialsById = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const bookTrials = await BookTrialModel.find({ $or: [{ createdBy: userId }, { member: userId }] })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email studio',
        populate: {
          path: 'studio',
          select: 'studioName studioOwner'
        }
      })
      .populate('relation', 'category relationType')
      .populate('lead', 'firstName lastName email')
      .populate('member', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (bookTrials.length === 0) throw new NotFoundError("No BookTrial created by user");

    return res.status(200).json({
      message: "All your BookTrials below",
      count: bookTrials.length,
      bookTrials
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBookTrial,
  updateBookTrialById,
  deleteBookTrial,
  getBookTrials,
  getBookTrialsById
};
