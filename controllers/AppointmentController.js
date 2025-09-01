const AppointmentModel = require('../models/AppointmentModel');
const mongoose = require('mongoose');
const RelationModel = require('../models/RelationModel');
const {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
} = require('../middleware/error/httpErrors');
const { notifyUser } = require('../utils/NotificationService')

const UserModel = require('../models/UserModel');
const { MemberModel, StaffModel } = require('../models/Discriminators');

// ========== CREATE APPOINTMENT ===========
// Only staff can create appointments
const createAppointment = async (req, res, next) => {
    try {
        const staffId = req.user?.id;
        if (req.user.role !== 'staff') {
            throw new UnauthorizedError("Only staff can create appointments");
        }

        const {
            members,
            appointmentType,
            bookingType,
            date,
            dayOfWeek,
            timeSlot,
            frequency,
            startDate,
            numberOfOccurrences,
            specialNote,
            endDate,
            relation
        } = req.body;

        // validate relation
        const relationDoc = await RelationModel.findById(relation);
        if (!relationDoc) throw new BadRequestError("Invalid relation ID");

        // validate members
        const memberIds = Array.isArray(members) ? members : [members];
        if (!memberIds.length) throw new BadRequestError("No members provided");

        for (const id of memberIds) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new BadRequestError(`Invalid member ID: ${id}`);
            }
        }

        const memberDocs = await MemberModel.find({ _id: { $in: memberIds } });
        if (memberDocs.length !== memberIds.length) {
            throw new BadRequestError("One or more members not found");
        }

        // create appointment
        const appointment = await AppointmentModel.create({
            createdBy: staffId,
            members: memberIds,
            appointmentType,
            bookingType,
            date,
            timeSlot,
            frequency,
            dayOfWeek,
            startDate,
            numberOfOccurrences,
            relation: relationDoc._id,
            specialNote,
            endDate,
        });
        for (const member of memberDocs) {
            await notifyUser(
                member._id,
                member.email,
                "New Appointment Scheduled",
                `You have a new ${appointment.appointmentType} appointment on ${appointment.date} at ${appointment.timeSlot}.`,
                "appointment"
            );
        }

        // push appointment id into members
        await MemberModel.updateMany(
            { _id: { $in: memberIds } },
            { $push: { appointments: appointment._id } }
        );
        await StaffModel.findByIdAndUpdate(
            staffId,
            { $push: { appointments: appointment._id } }
        );

        return res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment
        });
    } catch (error) {
        next(error);
    }
};

// ================= UPDATE APPOINTMENT =================
// Only staff who created can update
const updateAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffId = req.user?.id;

        if (req.user.role !== 'staff') {
            throw new UnauthorizedError("Only staff can update appointments");
        }

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) throw new NotFoundError("Appointment not found");

        if (appointment.createdBy.toString() !== staffId) {
            throw new UnauthorizedError("You are not allowed to update this appointment");
        }

        const updated = await AppointmentModel.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            appointment: updated
        });
    } catch (error) {
        next(error);
    }
};

// ================= DELETE APPOINTMENT =================
// Staff can delete OR member can cancel their own appointment
const deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) throw new NotFoundError("Appointment not found");

        if (req.user.role === 'staff') {
            // only the staff who created can delete
            if (appointment.createdBy.toString() !== userId) {
                throw new UnauthorizedError("You cannot delete this appointment");
            }
            await AppointmentModel.findByIdAndDelete(id);

            await MemberModel.updateMany(
                { _id: { $in: appointment.members } },
                { $pull: { appointments: appointment._id } }
            );

            return res.status(200).json({ success: true, message: "Appointment deleted successfully" });
        }

        if (req.user.role === 'member') {
            // member can only cancel (not delete from db)
            if (!appointment.members.some(m => m.toString() === userId)) {
                throw new UnauthorizedError("You cannot delete this appointment");
            }

            appointment.status = 'cancelled';
            appointment.cancelledBy = userId;
            await appointment.save();

            return res.status(200).json({ success: true, message: "Appointment cancelled successfully", appointment });
        }

        throw new UnauthorizedError("Invalid role");
    } catch (error) {
        next(error);
    }
};

// ================= GET ALL (STAFF ONLY) =================
const getAppointments = async (req, res, next) => {
    try {
        if (req.user.role !== 'staff') {
            throw new UnauthorizedError("Only staff can view all appointments");
        }

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const skip = (page - 1) * limit;

        const appointments = await AppointmentModel.find()
            .populate('createdBy', 'firstName lastName email role')
            .populate('members', 'firstName lastName email')
            .populate('relation', 'relationType category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalAppointments = await AppointmentModel.countDocuments();
        const totalPages = Math.ceil(totalAppointments / limit);

        return res.status(200).json({
            success: true,
            message: "Appointments list",
            page,
            limit,
            totalPages,
            totalAppointments,
            appointments
        });
    } catch (error) {
        next(error);
    }
};

// ================= GET MEMBER APPOINTMENTS =================
const myAppointments = async (req, res, next) => {
    try {
        const userId = req.user?.id;


        const appointments = await AppointmentModel.find({ $or: [{ members: userId }, { createdBy: userId }] })
            .populate('createdBy', 'firstName lastName email role')
            .populate('members', 'firstName lastName email')
            .populate('relation', 'category relationType')
            .populate('cancelledBy', 'firstName lastName role')
            .sort({ createdAt: -1 });

        if (!appointments.length) {
            return res.status(200).json({ message: "No appointments found", appointments: [] });
        }

        return res.status(200).json({
            success: true,
            message: "Your appointments",
            count: appointments.length,
            appointments
        });
    } catch (error) {
        next(error);
    }
};
const cancelAppointment = async (req, res, next) => {
    try {
        const userId = req.user?.id; // logged-in member
        const { id } = req.params;

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // make sure this appointment belongs to the member
        if (!appointment.members.some((m) => m._id.toString() === userId)) {
            return res.status(403).json({ message: "You cannot cancel this appointment" });
        }

        // update status instead of deleting
        appointment.status = "cancelled";
        appointment.cancelledBy = userId
        await appointment.save();

        const creator = await StaffModel.findById(appointment.createdBy);
        const members = await MemberModel.find({ _id: { $in: appointment.members } });

        for (const m of members) {
            await notifyUser(
                m._id,
                m.email,
                "Appointment Cancelled",
                `Your Appointment scheduled for ${appointment.date} at ${appointment.timeSlot} has been Cancelled `,
                "appointment"
            )
        }
        if (creator) {
            await notifyUser(
                creator._id,
                creator.email,
                "Appointment Cancelled",
                `The Appointment you created for ${appointment.date} has been cancelled `,
                "appointment"
            )
        }


        res.json({ message: "Appointment cancelled successfully" });
    } catch (err) {
        next(err);
    }
};
const confirmedAppointment = async (req, res, next) => {
    try {
        const userId = req.user?.id; // logged-in member
        const { id } = req.params;

        const appointment = await AppointmentModel.findById(id).populate('members', 'firstName lastName');
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // make sure this appointment belongs to the member
        if (!appointment.members.some((m) => m._id.toString() === userId)) {
            return res.status(403).json({ message: "You cannot confirm this appointment" });
        }

        // update status instead of deleting
        appointment.status = "confirmed";
        appointment.confirmedBy = userId
        await appointment.save();

        
        const creator = await StaffModel.findById(appointment.createdBy)
        const confirmingMember = appointment.members.find(m => m._id.toString() === userId);
        if (creator) {
            await notifyUser(
                creator._id,
                creator.email,
                "Appointment Confirmed",
                `The appointment you created for ${appointment.date} at ${appointment.timeSlot} has been confirmed by ${confirmingMember.firstName} ${confirmingMember.lastName}.`,
                "appointment"
            );
        }


        res.json({ message: "Appointment Confirmed successfully" });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    createAppointment,
    updateAppointmentById,
    deleteAppointment,
    getAppointments,
    myAppointments,
    cancelAppointment,
    confirmedAppointment
};
