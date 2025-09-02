const mongoose = require('mongoose')



const paymentSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract"
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member'
    },
    status: {
        type: String,
        enum: ['paid', 'failed', 'pending'],
        default: 'pending'
    },
    method: {
        type: String,
        enum: ['sepa', 'stripe'],
        default: 'sepa'
    },
    amount: {
        type: Number,
    },
    stripePaymentIntentId: {
        type: String,
    },
    paidAt: {
        type: Date
    }
})




const PaymentModel = mongoose.model('Payment', paymentSchema);

module.exports = PaymentModel