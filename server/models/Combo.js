const mongoose = require('mongoose')

const ComboSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    ],
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
    costFloor: {
        type: Number,
        default: 0
    },
    minProfit: {
        type: Number,
        default: 0
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
}, { timestamps: true })

module.exports = mongoose.model("Combo", ComboSchema)