const mongoose = require('mongoose')
const UserModel = require('./UserModel');


const AdminModel = UserModel.discriminator('admin', new mongoose.Schema({
    permissions: [{
        type: String,
        enum: ["manage_users", "manage_staff", "manage_contracts", "manage_payments", "view_reports"]
    }]
}));

const MemberModel = UserModel.discriminator('member', new mongoose.Schema({
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    bookTrials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookTrial'
    }],
    relations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relation',
    }],
}))


const StaffModel = UserModel.discriminator('staff', new mongoose.Schema({
    studio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Studio'
    },
    input: {
        type: String,
    },
    staffRole: {
        type: String,
        enum: ['manager', 'employee'],
        required: true,
    },

    vacationEntitlement: {
        type: Number,
        min: 30,
        default: 30,
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    leads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    }],
    bookTrials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookTrial'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    relations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relation',
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    contracts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
    }],
    blocked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlockedSlot',
    }],
}))

module.exports = { AdminModel, MemberModel, StaffModel }