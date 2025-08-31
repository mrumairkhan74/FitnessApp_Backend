const mongoose = require('mongoose')
const MetaAdsSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff"
    },
    fbUserId: {
        type: String
    },
    accessToken: {
        type: String,
    },
    adAccounts: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })



const MetaAdsModel = mongoose.model('MetaAds', MetaAdsSchema);

module.exports = MetaAdsModel