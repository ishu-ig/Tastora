const mongoose = require("mongoose")

const CheckoutProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    },
    productName: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    variant: { type: String, default: "Full" },
    qty: { type: Number, default: 1 },
    total: { type: Number, default: 0 },
    note: { type: String, default: "" }
}, { _id: false, strict: false })

const CheckoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Is Mendatory"]
    },
   
    orderStatus: {
        type: String,
        default: "Order Is Placed"
    },
    orderStatusUpdatedAt: { type: Date, default: null },
    paymentMode: {
        type: String,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    orderMode: {
        type: String,
        default: "delivery"
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    tableNumber: {
        type: String,
        default: ""
    },
    pickupTime: {
        type: String,
        default: ""
    },
    coupon: {
        type: String,
        default: ""
    },
    coinsUsed: {
        type: Number,
        default: 0
    },
    coinsDiscount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal Feild is Mendatory"]
    },
    deliveryCharge: {
        type: Number,
        required: [true, "Shipping Feild is Mendatory"]
    },
    total: {
        type: Number,
        required: [true, "Total Feild is Mendatory"]
    },
    deliveryTiming: {
        type: String,
        default: "instant"
    },
    scheduledDate: {
        type: String,
        default: ""
    },
    scheduledTime: {
        type: String,
        default: ""
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryBoy",
    },
    // ── Per-order acceptance ────────────────────────────────────────────────
    isaccept: {
        type: Boolean,
        default: false
    },
    rppid: {
        type: String,
        default: ""
    },
    // ── Live delivery-boy location for THIS order ──────────────────────────
    currentLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        updatedAt: { type: Date, default: null }
    },
    // ── Credit Coins earned for this order ─────────────────────────────────
    // creditCoinsEarned: coins to be awarded = floor(subtotal * 0.10)
    // creditCoinsAwarded: true once the coins have been credited to the user.
    // This flag prevents double-awarding if a webhook fires more than once.
    creditCoinsEarned: { type: Number, default: 0 },
    creditCoinsAwarded: { type: Boolean, default: false },
    customerComment: { type: String, trim: true, default: "" },
    customerRating: { type: Number, min: 1, max: 5, default: null },
    customerCommentedAt: { type: Date, default: null },
    commentRewarded: { type: Boolean, default: false },
    customerCommentCoinsAwarded: { type: Boolean, default: false },
    deliveryRating: { type: Number, min: 1, max: 5, default: null },
    deliveryFeedback: { type: String, trim: true, default: "" },
    deliveryRatedAt: { type: Date, default: null },
    deliveryRatingRewarded: { type: Boolean, default: false },
    deliveryBoyCommentCoinsAwarded: { type: Boolean, default: false },
    products: { type: [CheckoutProductSchema], default: [] }
}, { timestamps: true, strict: false })

const Checkout = mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema)

module.exports = Checkout