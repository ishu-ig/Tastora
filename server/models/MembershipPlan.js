const mongoose = require("mongoose");

const MembershipPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Plan name is mandatory"], trim: true }, // e.g. "Gold"
        description: { type: String, default: "", trim: true },
        price: { type: Number, required: [true, "Price is mandatory"], min: 0 }, // in INR
        durationInMonths: { type: Number, required: true, min: 1, default: 1 },

        // What the member gets
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },
        freeDelivery: { type: Boolean, default: false },
        bonusCoins: { type: Number, default: 0, min: 0 },

        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", MembershipPlanSchema);