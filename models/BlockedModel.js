const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    resourceType: [{
        type: String,
        enum: ['cardio', 'yoga', 'strength'],
    }],
    blockAllResources: {
        type: Boolean,
        default: false,
    },
    note: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff'
    }

}, { timestamps: true });



const BlockedModel = mongoose.model('BlockedSlot', blockSchema)

module.exports = BlockedModel