const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    appointmentType: {
        type: String,
        enum: ["strength_training", "cardio", "yoga"],
        required: true
    },
    bookingType: {
        type: String,
        enum: ['single', 'massBooking'],
        required: true
    },
    date: {
        type: Date,
        required: function () { return this.bookingType === 'single'; }
    },
    timeSlot: {
        type: String,
        required: true,
    },

    // Mass booking fields
    frequency: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: function () { return this.bookingType === 'massBooking'; }
    },
    dayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: function () { return this.bookingType === 'massBooking'; }
    },
    startDate: {
        type: Date,
        required: function () { return this.bookingType === 'massBooking'; }
    },
    numberOfOccurrences: {
        type: Number,
    },
    endDate: {
        type: Date,
    },

    specialNote: { type: String },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'cancelled'],
        default: 'scheduled'
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member',
        required: true
    }],
    relation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relation',
    }
}, { timestamps: true });

AppointmentSchema.index({ AppointmentType: 1, members: 1, createdBy: 1 })


// Validation for single vs massBooking 
AppointmentSchema.pre('validate', function (next) {
    if (this.bookingType === 'single') {
        if (!this.date) this.invalidate('date', 'Date is required for single booking');
    } else if (this.bookingType === 'massBooking') {
        if (!this.frequency) this.invalidate('frequency', 'Frequency is required for mass booking.');
        if (!this.dayOfWeek) this.invalidate('dayOfWeek', 'Day of Week is required for mass booking.');
        if (!this.startDate) this.invalidate('startDate', 'Start Date is required for mass booking.');
        if (!this.numberOfOccurrences && !this.endDate) {
            this.invalidate("numberOfOccurrences", "Mass booking requires either numberOfOccurrences or an endDate");
        }
    }

    if (this.startDate && this.endDate && this.endDate < this.startDate) {
        this.invalidate('endDate', 'End Date must be greater than or equal to Start Date');
    }

    next();
});

const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
module.exports = AppointmentModel;
