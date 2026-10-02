const Coupon = require("../models/Coupon")
const CouponUsage = require("../models/Couponusage")

// ── Core discount math, shared by validate + apply ────────────────────────────
function calculateDiscount(coupon, orderValue) {
    let discount = 0

    if (coupon.discountType === "percentage") {
        discount = (orderValue * coupon.discountValue) / 100
        if (coupon.maxDiscountAmount > 0) {
            discount = Math.min(discount, coupon.maxDiscountAmount)
        }
    } else {
        // flat
        discount = coupon.discountValue
    }

    // Never let the discount exceed the order value itself
    return Math.min(Math.round(discount), orderValue)
}

// ── Read-only check: "can this user apply this coupon right now?" ────────────
// Call this when the user types a coupon code at checkout, BEFORE placing
// the order, so you can show them the discount live. Does NOT consume the
// coupon — see applyCoupon for that.
async function validateCoupon(req, res) {
    try {
        const { code, orderValue } = req.body
        const userId = req.body.userId || req.user?._id // adjust to however you attach the logged-in user

        if (!code || typeof orderValue !== "number") {
            return res.status(400).send({
                result: "Fail",
                reason: "Coupon code and orderValue are required"
            })
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true })

        if (!coupon) {
            return res.status(404).send({ result: "Fail", reason: "Invalid coupon code" })
        }

        const now = new Date()
        if (now < coupon.validFrom || now > coupon.validTill) {
            return res.status(400).send({ result: "Fail", reason: "This coupon has expired or is not active yet" })
        }

        if (orderValue < coupon.minOrderValue) {
            return res.status(400).send({
                result: "Fail",
                reason: `Minimum order value of ${coupon.minOrderValue} required for this coupon`
            })
        }

        if (coupon.usageLimitPerUser > 0 && !userId) {
            return res.status(401).send({ result: "Fail", reason: "Sign in to use this coupon" })
        }

        if (coupon.totalUsageLimit && coupon.totalUsedCount >= coupon.totalUsageLimit) {
            return res.status(400).send({ result: "Fail", reason: "This coupon has reached its usage limit" })
        }

        if (coupon.usageLimitPerUser > 0) {
            const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId })
            if (userUsageCount >= coupon.usageLimitPerUser) {
                return res.status(400).send({ result: "Fail", reason: "You have already used this coupon" })
            }
        }

        const discountAmount = calculateDiscount(coupon, orderValue)

        res.send({
            result: "Done",
            valid: true,
            discountAmount,
            couponId: coupon._id,
            code: coupon.code
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── Actually consume the coupon. Call this from inside your order-creation
// flow, AFTER the order document has been created, passing the new order's _id.
// Returns the discount amount to apply, or throws if the coupon is no longer valid
// (re-checks everything server-side — never trust a discount amount the client sends).
async function applyCoupon({ code, userId, orderId, orderValue }) {
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true })
    if (!coupon) throw new Error("Invalid coupon code")

    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validTill) {
        throw new Error("This coupon has expired or is not active yet")
    }
    if (orderValue < coupon.minOrderValue) {
        throw new Error(`Minimum order value of ${coupon.minOrderValue} required`)
    }

    if (coupon.usageLimitPerUser > 0) {
        const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId })
        if (userUsageCount >= coupon.usageLimitPerUser) {
            throw new Error("You have already used this coupon")
        }
    }

    // Atomic guarded increment: the totalUsageLimit check happens INSIDE the
    // filter, so two simultaneous requests can't both slip through when only
    // one slot is left. If the coupon is already at its limit, this update
    // matches zero documents and updatedCoupon comes back null.
    const filter = { _id: coupon._id }
    if (coupon.totalUsageLimit) {
        filter.totalUsedCount = { $lt: coupon.totalUsageLimit }
    }

    const updatedCoupon = await Coupon.findOneAndUpdate(
        filter,
        { $inc: { totalUsedCount: 1 } },
        { new: true }
    )

    if (!updatedCoupon) {
        throw new Error("This coupon has just reached its usage limit")
    }

    const discountAmount = calculateDiscount(updatedCoupon, orderValue)

    await CouponUsage.create({
        coupon: coupon._id,
        user: userId,
        order: orderId,
        discountAmount
    })

    return discountAmount
}

// ── Basic CRUD for managing coupons from an admin panel ───────────────────────
async function createRecord(req, res) {
    try {
        let data = new Coupon(req.body)
        await data.save()
        res.send({ result: "Done", data })
    } catch (error) {
        let errorMessage = {}
        error.keyValue ? (errorMessage.code = "Coupon code already exists") : null
        error.errors?.code ? (errorMessage.code = error.errors.code.message) : null
        error.errors?.discountType ? (errorMessage.discountType = error.errors.discountType.message) : null
        error.errors?.discountValue ? (errorMessage.discountValue = error.errors.discountValue.message) : null
        error.errors?.validTill ? (errorMessage.validTill = error.errors.validTill.message) : null

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        } else {
            res.status(400).send({ result: "Fail", reason: errorMessage })
        }
    }
}

async function getRecord(req, res) {
    try {
        let data = await Coupon.find().sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Coupon.findOne({ _id: req.params._id })
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }
        res.send({ result: "Done", data })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Coupon.findOne({ _id: req.params._id })
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }
        Object.assign(data, req.body)
        await data.save()
        res.send({ result: "Done", data })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Coupon.findOne({ _id: req.params._id })
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }
        await data.deleteOne()
        res.send({ result: "Done", data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

module.exports = {
    validateCoupon,
    applyCoupon,
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
}