const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "Tastora Grand Kitchen",
            trim: true
        },
        pic: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: "42 Flavor Street, Gourmet Avenue"
        },
        city: {
            type: String,
            default: "New York"
        },
        state: {
            type: String,
            default: "NY"
        },
        pin: {
            type: String,
            default: "10001"
        },
        phone: {
            type: String,
            default: "+1 (800) 123-4567"
        },
        email: {
            type: String,
            default: "orders@tastorafood.com"
        },
        permanentLocation: {
            lat: { type: Number, default: 40.758896 },
            lng: { type: Number, default: -73.985130 }
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Register both "Resturent" (for legacy model refs in existing schemas) and "Restaurant"
const Resturent = mongoose.models.Resturent || mongoose.model("Resturent", RestaurantSchema);

module.exports = Resturent;
