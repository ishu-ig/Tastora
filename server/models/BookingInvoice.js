const mongoose = require("mongoose")

const BookingInvoiceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "Booking reference is required"],
            unique: true   // one invoice per booking
        },
        invoiceNumber: {
            type: String,
            required: [true, "Invoice number is required"],
            unique: true
        }
    },
    { timestamps: true }
)

const BookingInvoice = mongoose.model("BookingInvoice", BookingInvoiceSchema)

module.exports = BookingInvoice