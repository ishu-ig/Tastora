const mongoose = require("mongoose")

const SupportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checkout",
        default: null
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },
    recordType: {
        type: String,
        enum: ["order", "reservation"],
        required: true
    },
    orderReference: {
        type: String,
        required: true,
        trim: true
    },
    issueType: {
        type: String,
        enum: ["delay", "missing", "quality", "rider", "billing", "other"],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved"],
        default: "open"
    }
}, { timestamps: true })

module.exports = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema)