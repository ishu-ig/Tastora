const mongoose = require("mongoose")

const CouponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon Code Is Mandatory"],
            unique: true,
            uppercase: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: [true, "Discount Type Is Mandatory"]
        },

        // For "percentage" this is e.g. 10 (meaning 10%). For "flat" it's a currency amount.
        discountValue: {
            type: Number,
            required: [true, "Discount Value Is Mandatory"],
            min: 0
        },

        // Only relevant when discountType is "percentage" — caps how much a
        // percentage discount can be worth on a large order. Leave 0/undefined
        // for no cap.
        maxDiscountAmount: {
            type: Number,
            default: 0
        },

        minOrderValue: {
            type: Number,
            default: 0
        },

        // 0 = unlimited redemptions per user
        usageLimitPerUser: {
            type: Number,
            default: 1
        },

        // null/0 = unlimited redemptions across all users
        totalUsageLimit: {
            type: Number,
            default: null
        },

        // Incremented atomically every time the coupon is successfully applied.
        // Used together with totalUsageLimit to enforce the global cap.
        totalUsedCount: {
            type: Number,
            default: 0
        },

        validFrom: {
            type: Date,
            default: Date.now
        },

        validTill: {
            type: Date,
            required: [true, "Coupon Expiry Date Is Mandatory"]
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Coupon", CouponSchema)