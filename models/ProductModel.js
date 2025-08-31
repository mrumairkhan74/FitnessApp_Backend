const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: String
    },
    articleNumber: {
        type: String
    },
    paymentOption: {
        type: String,
        enum: ['card', 'cash', 'directDebit'],
        default: 'card'
    },
    brand: {
        type: String
    },
    img: {
        url: String,
        public_id: String
    },
    link: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff'
    }
})

productSchema.index({ name: 1, price: 1 });

const ProductModel = mongoose.model('Product', productSchema);

module.exports = ProductModel;