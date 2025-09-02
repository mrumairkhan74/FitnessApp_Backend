const mongoose = require('mongoose')

const AdAccountSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    accountStatus: {
        type: Number
    },
}, { _id: false })

const MetaAdsSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff"
    },
    fbUserId: {
        type: String, required: true
    },
    encryptedAccessToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date
    },
    adAccounts: [AdAccountSchema],
    metaId: {
        type: String
    },
}, { timestamps: true })

MetaAdsSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const MetaAdsModel = mongoose.model('MetaAds', MetaAdsSchema);

module.exports = MetaAdsModel