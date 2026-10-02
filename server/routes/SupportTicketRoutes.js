const SupportTicketRouter = require("express").Router()
const { verifyThree } = require("../middleware/authorization")
const { createOrderTicket } = require("../controllers/SupportTicketController")

SupportTicketRouter.post("/order-ticket", verifyThree, createOrderTicket)

module.exports = SupportTicketRouter