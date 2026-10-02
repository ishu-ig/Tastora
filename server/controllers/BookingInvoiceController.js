const PDFDocument = require("pdfkit")
const Booking = require("../models/Booking")
const BookingInvoice = require("../models/BookingInvoice")

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    // Deep plum + gold luxury palette
    brand:       "#1B0036",
    brandDark:   "#0D0020",
    brandMid:    "#3A0068",
    brandLight:  "#F3EEFF",
    gold:        "#C9993A",
    goldLight:   "#F5E9C8",
    goldDark:    "#7A5A10",
    rose:        "#C0244E",
    roseBg:      "#FDE8EF",
    roseDark:    "#7A0C2D",
    teal:        "#0B6E63",
    tealBg:      "#E4F3F1",
    tealDark:    "#074D45",
    amber:       "#B45309",
    amberBg:     "#FEF3C7",
    amberDark:   "#633806",
    ink:         "#1A0D2E",
    inkMid:      "#5A4A70",
    inkLight:    "#9585AA",
    border:      "#DDD0EE",
    rule:        "#EDE8F6",
    rowAlt:      "#F9F6FE",
    white:       "#FFFFFF",
    offwhite:    "#FAF7FF",
    sidebar:     "#F5F0FC",
}

const F = { h1: 24, h2: 16, h3: 12, body: 9.5, small: 8.5, tiny: 7.5 }

// ── Helpers ───────────────────────────────────────────────────────────────────
const currency = (n) =>
    `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (d) =>
    new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

function rect(doc, x, y, w, h, fill, rx = 0) {
    doc.save()
    if (rx > 0) doc.roundedRect(x, y, w, h, rx).fill(fill)
    else doc.rect(x, y, w, h).fill(fill)
    doc.restore()
}

function strokeRect(doc, x, y, w, h, color, lw = 0.5, rx = 0) {
    doc.save()
    if (rx > 0) doc.roundedRect(x, y, w, h, rx).lineWidth(lw).strokeColor(color).stroke()
    else doc.rect(x, y, w, h).lineWidth(lw).strokeColor(color).stroke()
    doc.restore()
}

function hRule(doc, y, x1 = 40, x2 = 555, color = "#EDE8F6", lw = 0.4) {
    doc.save().strokeColor(color).lineWidth(lw).moveTo(x1, y).lineTo(x2, y).stroke().restore()
}

function dashedRule(doc, y, x1, x2, color, lw = 0.4) {
    doc.save().strokeColor(color).lineWidth(lw).dash(3, { space: 3 }).moveTo(x1, y).lineTo(x2, y).stroke().undash().restore()
}

function pill(doc, x, y, label, bgColor, textColor) {
    doc.fontSize(F.tiny).font("Helvetica-Bold")
    const pw = doc.widthOfString(label) + 16
    rect(doc, x, y, pw, 14, bgColor, 7)
    doc.fillColor(textColor).text(label, x + 8, y + 2.5, { lineBreak: false })
}

function goldDivider(doc, y, x1, x2) {
    // triple-line gold ornament divider
    doc.save()
    doc.strokeColor(C.gold).lineWidth(0.8).moveTo(x1, y).lineTo(x2, y).stroke()
    doc.strokeColor(C.gold).lineWidth(0.3).opacity(0.4).moveTo(x1, y + 2).lineTo(x2, y + 2).stroke()
    doc.restore()
}

function diamond(doc, cx, cy, size, fill) {
    doc.save()
    doc.moveTo(cx, cy - size).lineTo(cx + size, cy).lineTo(cx, cy + size).lineTo(cx - size, cy).closePath().fill(fill)
    doc.restore()
}

// ── PDF Builder ───────────────────────────────────────────────────────────────
function buildBookingInvoicePDF(booking, invoiceNumber, res) {
    return new Promise((resolve, reject) => {
        const customer      = booking.user       || {}
        const restaurant    = booking.resturent  || {}
        const bookingDate   = fmtDate(booking.createdAt)
        const visitDate     = booking.date        || "—"
        const visitTime     = booking.time        || "—"
        const seats         = booking.seats       || 1
        const total         = Number(booking.total || 0)
        const payMode       = booking.paymentMode  || "COD"
        const payStatus     = booking.paymentStatus || "Pending"
        const bookingStatus = booking.bookingStatus || "Confirmed"

        const siteName    = process.env.SITE_NAME    || "EasyDine"
        const siteAddress = process.env.SITE_ADDRESS || "123 Main Street, New Delhi, India"
        const siteEmail   = process.env.SITE_EMAIL   || "support@easydine.com"
        const sitePhone   = process.env.SITE_PHONE   || "+91 98765 43210"

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="${invoiceNumber}.pdf"`)

        const doc = new PDFDocument({ margin: 0, size: "A4" })
        doc.pipe(res)

        const W = 595, H = 841, M = 44

        // ── BACKGROUND ────────────────────────────────────────────────────────
        rect(doc, 0, 0, W, H, C.offwhite)

        // Left sidebar accent strip
        rect(doc, 0, 0, 6, H, C.brand)

        // ── HEADER BLOCK ──────────────────────────────────────────────────────
        rect(doc, 0, 0, W, 130, C.brand)

        // Decorative circles
        doc.save().opacity(0.07)
        doc.circle(W - 40, -30, 130).fill(C.gold)
        doc.restore()
        doc.save().opacity(0.04)
        doc.circle(W - 10, 100, 80).fill(C.white)
        doc.restore()

        // Gold accent line below header
        rect(doc, 0, 130, W, 4, C.gold)

        // Tiny gold ornament diamonds on the accent line
        diamond(doc, M + 10, 132, 4, C.goldDark)
        diamond(doc, W - M - 10, 132, 4, C.goldDark)

        // Brand name
        doc.fontSize(F.h1).font("Helvetica-Bold").fillColor(C.white)
           .text(siteName, M + 8, 24)

        // Tagline
        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.45)")
           .text("FINE DINING · TABLE RESERVATIONS", M + 8, 52, { characterSpacing: 1.8 })

        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.38)")
           .text(siteAddress, M + 8, 66)
           .text(`${siteEmail}  ·  ${sitePhone}`, M + 8, 78)

        // Invoice label (right side)
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
           .text("BOOKING CONFIRMATION", 0, 26, { align: "right", width: W - M - 8, characterSpacing: 2 })
        doc.fontSize(F.h2).font("Helvetica-Bold").fillColor(C.white)
           .text(invoiceNumber, 0, 44, { align: "right", width: W - M - 8 })
        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.45)")
           .text(bookingDate, 0, 66, { align: "right", width: W - M - 8 })

        // ── GUEST + BOOKING CARD ROW ──────────────────────────────────────────
        let y = 152

        // ── Guest section (left) ──
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
           .text("GUEST DETAILS", M + 8, y, { characterSpacing: 1.8 })
        goldDivider(doc, y + 11, M + 8, 260)
        y += 20

        doc.fontSize(F.h3).font("Helvetica-Bold").fillColor(C.ink)
           .text(customer.name || "—", M + 8, y)
        y += 16

        doc.fontSize(F.body).font("Helvetica").fillColor(C.inkMid)
        const addr = [customer.address, customer.city, customer.state].filter(Boolean)
        if (addr.length) {
            doc.text(addr.join(", "), M + 8, y, { width: 210 })
            y += doc.heightOfString(addr.join(", "), { width: 210 }) + 5
        }
        if (customer.phone) {
            doc.fontSize(F.small).fillColor(C.inkMid)
               .text(`✆  ${customer.phone}`, M + 8, y); y += 13
        }
        if (customer.email) {
            doc.fontSize(F.small).fillColor(C.inkMid)
               .text(`✉  ${customer.email}`, M + 8, y); y += 13
        }

        // ── Booking Details Card (right) ──
        const cx = 310, cy = 148, cw = 242
        const infoRows = [
            ["Booking ID",   String(booking._id || invoiceNumber).slice(-12)],
            ["Visit Date",   visitDate],
            ["Visit Time",   visitTime],
            ["Seats",        String(seats)],
            ["Payment",      payMode],
        ]
        const cardH = 28 + infoRows.length * 20 + 28

        // Card shadow effect
        rect(doc, cx + 3, cy + 3, cw, cardH, "#D8CCEE", 8)
        rect(doc, cx, cy, cw, cardH, C.white, 8)
        strokeRect(doc, cx, cy, cw, cardH, C.border, 0.6, 8)

        // Card header
        rect(doc, cx, cy, cw, 26, C.brand, 8)
        rect(doc, cx, cy + 18, cw, 8, C.brand)  // fill bottom corners of header
        rect(doc, cx + cw - 4, cy, 4, 8, C.gold)  // gold right cap
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
           .text("RESERVATION DETAILS", cx + 12, cy + 8, { characterSpacing: 1.2 })

        let iy = cy + 32
        infoRows.forEach(([label, val], idx) => {
            if (idx % 2 === 0) rect(doc, cx, iy - 3, cw, 20, C.rowAlt)
            doc.fontSize(F.small).font("Helvetica").fillColor(C.inkLight)
               .text(label, cx + 12, iy, { width: 90 })
            doc.fontSize(F.small).font("Helvetica-Bold").fillColor(C.ink)
               .text(val, cx + 106, iy, { width: cw - 118, align: "right" })
            iy += 20
        })

        // Payment status pill inside card
        const isPaid = /paid|success/i.test(payStatus)
        rect(doc, cx, iy - 3, cw, 26, C.brandLight)
        strokeRect(doc, cx, iy - 3, cw, 26, C.border, 0.4)
        doc.fontSize(F.small).font("Helvetica").fillColor(C.inkLight)
           .text("Payment Status", cx + 12, iy + 4, { width: 90 })
        pill(doc, cx + 106, iy + 3, payStatus,
            isPaid ? C.tealBg  : C.amberBg,
            isPaid ? C.tealDark : C.amberDark)

        // ── RESTAURANT SECTION ────────────────────────────────────────────────
        y = Math.max(y + 20, cy + cardH + 20)

        goldDivider(doc, y, M + 8, W - M - 8)
        y += 12

        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
           .text("RESTAURANT INFORMATION", M + 8, y, { characterSpacing: 1.8 })
        y += 18

        const bw = W - 2 * M - 8
        const rh = 88

        // Restaurant card
        rect(doc, M + 4, y + 4, bw, rh, "#D8CCEE", 8) // shadow
        rect(doc, M, y, bw, rh, C.white, 8)
        strokeRect(doc, M, y, bw, rh, C.border, 0.6, 8)

        // Left accent bar
        rect(doc, M, y, 5, rh, C.brand, 3)

        // Restaurant badge / icon area
        rect(doc, M + 14, y + 14, 42, 42, C.brandLight, 6)
        doc.fontSize(18).fillColor(C.brand).text("🍽", M + 23, y + 20, { lineBreak: false })

        const rName    = restaurant.name    || "—"
        const rAddress = restaurant.address || "—"
        const rPhone   = restaurant.phone   || "—"
        const rOpen    = restaurant.openTime  || "—"
        const rClose   = restaurant.closeTime || "—"

        doc.fontSize(F.h3).font("Helvetica-Bold").fillColor(C.ink)
           .text(rName, M + 66, y + 14)
        doc.fontSize(F.small).font("Helvetica").fillColor(C.inkMid)
           .text(`${rAddress}`, M + 66, y + 30, { width: bw - 80 })
           .text(`${rPhone}  ·  Hours: ${rOpen} – ${rClose}`, M + 66, y + 44, { width: bw - 80 })

        const bsIsPending = /pending|cancel/i.test(String(bookingStatus))
        pill(doc, M + 66, y + 62, `  ${bookingStatus}  `,
            bsIsPending ? C.amberBg  : C.tealBg,
            bsIsPending ? C.amberDark : C.tealDark)

        y += rh + 22

        // ── PRICING TABLE ─────────────────────────────────────────────────────
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
           .text("PRICING SUMMARY", M + 8, y, { characterSpacing: 1.8 })
        goldDivider(doc, y + 11, M + 8, W - M - 8)
        y += 20

        const tableW = bw
        const col = {
            desc:  { x: M,           w: 330 },
            qty:   { x: M + 334,     w: 60  },
            price: { x: M + 398,     w: 109 },
        }

        // Table header
        rect(doc, M, y, tableW, 26, C.brand, 4)
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.gold)
        ;[
            ["DESCRIPTION", col.desc,  "left"  ],
            ["SEATS",       col.qty,   "center"],
            ["AMOUNT",      col.price, "right" ],
        ].forEach(([label, c, align]) =>
            doc.text(label, c.x + 4, y + 8, { width: c.w, align, characterSpacing: 1 })
        )
        y += 26

        // Table row
        rect(doc, M, y, tableW, 28, C.white)
        strokeRect(doc, M, y, tableW, 28, C.border, 0.4)
        doc.fontSize(F.body).font("Helvetica-Bold").fillColor(C.ink)
           .text(`Seat Reservation — ${rName}`, col.desc.x + 4, y + 8, { width: col.desc.w - 4, ellipsis: true })
        doc.font("Helvetica").fillColor(C.inkMid)
           .text(String(seats), col.qty.x, y + 8, { width: col.qty.w, align: "center" })
        doc.font("Helvetica-Bold").fillColor(C.brand)
           .text(currency(total), col.price.x, y + 8, { width: col.price.w - 4, align: "right" })
        y += 28

        dashedRule(doc, y + 8, M, M + tableW, C.border)
        y += 22

        // ── TOTAL BLOCK ───────────────────────────────────────────────────────
        const totX = 360, totRW = M + tableW - totX

        // Total card
        rect(doc, totX - 8, y - 6, totRW + 8, 32, C.brand, 6)
        // Gold shimmer stripe
        rect(doc, totX - 8, y - 6, 5, 32, C.gold)

        doc.fontSize(F.body).font("Helvetica-Bold").fillColor("rgba(255,255,255,0.6)")
           .text("TOTAL AMOUNT", totX + 4, y, { width: 90 })
        doc.fontSize(F.h3).font("Helvetica-Bold").fillColor(C.gold)
           .text(currency(total), totX + 94, y - 2, { width: totRW - 102, align: "right" })
        y += 42

        // ── NOTE BLOCK ────────────────────────────────────────────────────────
        rect(doc, M + 4, y + 4, tableW, 56, "#D8CCEE", 8) // shadow
        rect(doc, M, y, tableW, 56, C.white, 8)
        strokeRect(doc, M, y, tableW, 56, C.border, 0.5, 8)
        rect(doc, M, y, 5, 56, C.gold, 3)

        doc.fontSize(F.body).font("Helvetica-Bold").fillColor(C.ink)
           .text("Thank you for your reservation!", M + 18, y + 12)
        doc.fontSize(F.small).font("Helvetica").fillColor(C.inkMid)
           .text(
               `For changes or cancellations please contact ${siteEmail}  ·  Please arrive 10 minutes before your slot.`,
               M + 18, y + 28, { width: tableW - 28 }
           )

        // ── FOOTER ────────────────────────────────────────────────────────────
        rect(doc, 0, H - 44, W, 44, C.brand)
        rect(doc, 0, H - 44, W, 3, C.gold)

        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.32)")
           .text(
               `© ${new Date().getFullYear()} ${siteName}  ·  All rights reserved  ·  This is a computer-generated booking confirmation. No signature required.`,
               0, H - 26, { align: "center", width: W }
           )

        doc.on("end", resolve)
        doc.on("error", reject)
        doc.end()
    })
}

// ── Route Handler ─────────────────────────────────────────────────────────────
async function createBookingInvoice(req, res) {
    try {
        const { bookingId } = req.body
        if (!bookingId) return res.status(400).json({ result: "Fail", reason: "bookingId is required." })

        const booking = await Booking.findById(bookingId)
            .populate("user")
            .populate("resturent")

        if (!booking) return res.status(404).json({ result: "Fail", reason: "Booking not found." })

        let invoiceNumber
        const existing = await BookingInvoice.findOne({ booking: bookingId })
        if (existing) {
            invoiceNumber = existing.invoiceNumber
        } else {
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "")
            const rand     = Math.floor(1000 + Math.random() * 9000)
            invoiceNumber  = `BINV-${datePart}-${rand}`
        }

        await buildBookingInvoicePDF(booking, invoiceNumber, res)

        if (!existing) {
            await new BookingInvoice({
                user:          booking.user?._id || booking.user,
                booking:       booking._id,
                invoiceNumber,
            }).save()
        }

    } catch (error) {
        console.error("Booking invoice error:", error)
        if (!res.headersSent) {
            res.status(500).json({ result: "Fail", reason: "Failed to generate booking invoice." })
        }
    }
}

module.exports = { createBookingInvoice }