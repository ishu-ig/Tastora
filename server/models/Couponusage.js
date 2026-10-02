const mongoose = require("mongoose")

// One document per successful redemption. This is what lets us answer
// "how many times has this specific user used this specific coupon?"
// with a fast indexed query instead of scanning the Orders collection.
const CouponUsageSchema = new mongoose.Schema(
    {
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Optional but recommended: lets you trace a redemption back to the
        // order it was used on, and reverse it if that order is cancelled.
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null
        },

        discountAmount: {
            type: Number,
            required: true
        },

        usedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
)

// Speeds up the exact query the validation flow runs constantly:
// "count usages of this coupon by this user".
CouponUsageSchema.index({ coupon: 1, user: 1 })

module.exports = mongoose.model("CouponUsage", CouponUsageSchema)