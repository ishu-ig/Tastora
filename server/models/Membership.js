const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true },

        status: {
            type: String,
            enum: ["pending", "active", "expired", "canceled"],
            default: "pending", // becomes "active" after payment is verified
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },

        // Copied from the plan at purchase time
        amountPaid: { type: Number, default: 0, min: 0 },
        discountPercent: { type: Number, default: 0 },
        freeDelivery: { type: Boolean, default: false },

        // Razorpay payment details
        razorpayOrderId: { type: String, default: "" },
        razorpayPaymentId: { type: String, default: "" },
    },
    { timestamps: true }
);

// One active membership per user
MembershipSchema.index(
    { user: 1 },
    { unique: true, partialFilterExpression: { status: "active" } }
);

MembershipSchema.methods.isValid = function () {
    return this.status === "active" && this.endDate > new Date();
};

module.exports = mongoose.model("Membership", MembershipSchema);