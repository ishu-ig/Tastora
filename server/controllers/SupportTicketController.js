const mongoose = require("mongoose")
const Checkout = require("../models/Checkout")
const Booking = require("../models/Booking")
const SupportTicket = require("../models/SupportTicket")

async function createOrderTicket(req, res) {
    try {
        const userId = req.user?._id || req.user?.id || req.headers["x-user-id"]
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).send({ result: "Fail", reason: "Authentication required" })
        }

        const { recordType, orderId, bookingId, orderReference, issueType, message } = req.body
        if (!["order", "reservation"].includes(recordType)) {
            return res.status(400).send({ result: "Fail", reason: "Invalid order type" })
        }
        if (!orderReference || !String(message || "").trim() || String(message).trim().length < 5) {
            return res.status(400).send({ result: "Fail", reason: "Order reference and a message of at least 5 characters are required" })
        }

        const recordId = recordType === "reservation" ? bookingId : orderId
        if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).send({ result: "Fail", reason: "This order is not linked to a saved backend record" })
        }

        const record = recordType === "reservation"
            ? await Booking.findOne({ _id: recordId, user: userId }).select("_id")
            : await Checkout.findOne({ _id: recordId, user: userId }).select("_id")

        if (!record) {
            return res.status(404).send({ result: "Fail", reason: "Order not found for this account" })
        }

        const ticket = await SupportTicket.create({
            user: userId,
            order: recordType === "order" ? record._id : null,
            booking: recordType === "reservation" ? record._id : null,
            recordType,
            orderReference: String(orderReference).trim(),
            issueType,
            message: String(message).trim()
        })

        res.status(201).send({
            result: "Done",
            data: {
                id: ticket._id,
                ticketNumber: `TCK-${String(ticket._id).slice(-6).toUpperCase()}`,
                status: ticket.status
            }
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).send({ result: "Fail", reason: error.message })
        }
        console.error("Create order support ticket error:", error)
        res.status(500).send({ result: "Fail", reason: "Could not submit support ticket" })
    }
}

module.exports = { createOrderTicket }