const mongoose = require('mongoose')


const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    paymentOption: {
        type: String,
        enum: ['card', 'cash', 'directDebit'],
        default: 'card'
    },
    link: {
        type: String,
    },
    img: {
        url: String,
        public_id: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff'
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member'
    }
})

serviceSchema.index({ name: 1, price: 1 });

const ServiceModel = mongoose.model('Service', serviceSchema);

module.exports = ServiceModel;