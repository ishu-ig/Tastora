const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Is Mendatory"]
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product Id Is Mendatory"]
    },
    productName: {
        type: String,
        trim: true,
        default: ""
    },
    // Variant NAME ("Half" / "Full") - NOT the variant's _id.
    variant: {
        type: String,
        enum: ["Half", "Full"],
        default: "Full",
        required: [true, "Variant Is Mandatory"]
    },
    qty: {
        type: Number,
        min: [1, "Quantity must be at least 1"],
        default: 1,
        required: [true, "Quantity Is Mandatory"]
    },
    total: {
        type: Number,
        required: [true, "Price Is Mandatory"]
    },
    modeOfOrder:{
        type: String,
        enum: ["Take Away", "Delivery", "Dine In"],
        default: "Delivery",
    }
})

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema)

module.exports = Cart