const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Is Mendatory"]
    },
    resturent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resturent",
        default: null
    },
    restaurantName: { type: String, trim: true, default: "" },
    zone: { type: String, trim: true, default: "" },
    zoneImage: { type: String, trim: true, default: "" },
    paymentMode: {
        type: String,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    bookingStatus: { type: Boolean, default: true },
    bookingState: {
        type: String,
        enum: ["pending-payment", "confirmed", "cancelled"],
        default: "confirmed"
    },
    date: {
        type: String,
        required: [true, "Date Is Mendatory"]
    },
    time: {
        type: String,
        required: [true, "Times Is Mendatory"]
    },
    seats: {
        type: Number,
        required: [true, "Number of Seats Is Mendatory"]
    },
    occasion: { type: String, trim: true, default: "" },
    dietary: { type: String, trim: true, default: "" },
    addOns: { type: [String], default: [] },
    guestName: { type: String, trim: true, default: "" },
    guestPhone: { type: String, trim: true, default: "" },
    guestEmail: { type: String, trim: true, lowercase: true, default: "" },
    specialNotes: { type: String, trim: true, default: "" },
    coverPricePerGuest: { type: Number, default: 0 },
    addOnTotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    rppid: {
        type: String,
        default: ""
    },
    razorpayOrderId: { type: String, default: "" },
    total: {
        type: Number,
        required: [true, "Price Is Mendatory"]
    },
    ratingGiven: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, trim: true, default: "" },
}, { timestamps: true })

const Booking = new mongoose.model("Booking", BookingSchema)

module.exports = Booking 