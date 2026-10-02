const mongoose = require("mongoose")

const WishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Is Mandatory"]
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product Id Is Mandatory"]
    },
})

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema)

module.exports = Wishlist 