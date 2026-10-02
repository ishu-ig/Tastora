const BookingInvoiceRouter = require('express').Router()
const { createBookingInvoice } = require('../controllers/BookingInvoiceController');

// POST: Generate Invoice
BookingInvoiceRouter.post('/generate', createBookingInvoice);

module.exports = BookingInvoiceRouter;