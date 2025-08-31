const mongoose = require('mongoose')


const studioSchema = new mongoose.Schema({
    studioName: {
        type: String,
        required: true,
        unique: true,
        required: true
    },
    studioOwner: {
        type: String,
        trim: true,

    },
    phone: {
        type: String,

    },
    email: {
        type: String,

        lowercase: true,
        trim: true
    },
    street: {
        type: String,

    },
    zipCode: {
        type: String,

    },
    city: {
        type: String,

    },
    country: {
        type: String
    },
    website: {
        type: String,

    },
    logo: {
        url: String,
        public_id: String
    },
    openingHours: {
        type: String,  //after testing we can change it into map
    },
    closingDays: [{
        type: String
    }],
    createdBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff'
    }]
}, { timestamps: true })


const StudioModel = mongoose.model('Studio', studioSchema)

module.exports = StudioModel