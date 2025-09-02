const mongoose = require('mongoose');

const idlePeriodSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member'
    },
    reason: {
        type: String,
        enum: ['Vacation', 'Medical', 'Business', 'Personal'],
        required: true,

    },
    startDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: String,
        enum: ['1week', '2weeks', '1month', '2months', '3months'],
        required: true,
    },
    document: {
        url: String,
        public_id: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true })



const IdlePeriodModel = mongoose.model('IdlePeriod', idlePeriodSchema)

module.exports = IdlePeriodModel