const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter valid email"]
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\+?\d{10,15}$/.test(v),
            message: (props) => `${props.value} is not a valid phone number!`
        }
    },
    street: String,
    zipCode: {
        type: String,
        validate: {
            validator: v => /^\d{4,10}$/.test(v),
            message: props => `${props.value} is not a valid zip code!`
        }
    },
    city: {
        type: String,
        minlength: 4,
        maxlength: 20,
    },
    country: String,
    status: {
        type: String,
        enum: ['passive', 'active', 'uninterested', 'missed'],
        default: 'passive'
    },
    source: {
        type: String,
        enum: [
            'website',
            'socialAds',
            'googleAds',
            'emailCampaign',
            'coldCall',
            'inboundCall',
            'event',
            'offlineAds',
            'other'
        ]
    },
    note: String,
    startDate: Date,
    endDate: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff"
    }
});

// Validate dates
leadSchema.pre('validate', function (next) {
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
        this.invalidate('endDate', 'End Date must be greater than or equal to Start Date');
    }
    next();
});

const LeadModel = mongoose.model('Lead', leadSchema);

module.exports = LeadModel;
