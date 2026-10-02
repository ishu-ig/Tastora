const crypto = require("crypto")
const Razorpay = require("razorpay")
const Membership = require("../models/Membership")
const MembershipPlan = require("../models/MembershipPlan")
const User = require("../models/User")

// ── Helpers ──────────────────────────────────────────────────────────────────

// Adds months without overflowing (31 Jan + 1 month = 28/29 Feb, not 3 Mar)
function addMonths(date, months) {
    const d = new Date(date)
    const day = d.getDate()
    d.setMonth(d.getMonth() + months)
    if (d.getDate() !== day) d.setDate(0)
    return d
}

// Marks memberships past their end date as expired.
// Called before reads/purchases, so no cron job is needed to start with.
// (Also export-ready if you want to run it daily from a cron later.)
async function expireMemberships() {
    const due = await Membership.find({ status: "active", endDate: { $lt: new Date() } }).select("_id user")
    if (!due.length) return
    await Membership.updateMany(
        { _id: { $in: due.map((m) => m._id) } },
        { $set: { status: "expired" } }
    )
    await User.updateMany(
        { _id: { $in: due.map((m) => m.user) } },
        { $set: { ismembership: false } }
    )
}

// Moves a PENDING membership to ACTIVE and gives the bonus coins.
// The filter includes status "pending", so this can only happen once
// per membership: bonus coins can never be credited twice.
async function activateMembership(filter, plan, paymentId) {
    const startDate = new Date()
    const membership = await Membership.findOneAndUpdate(
        { ...filter, status: "pending" },
        {
            $set: {
                status: "active",
                startDate: startDate,
                endDate: addMonths(startDate, plan.durationInMonths),
                amountPaid: plan.price,
                discountPercent: plan.discountPercent,
                freeDelivery: plan.freeDelivery,
                razorpayPaymentId: paymentId || "",
            },
        },
        { returnDocument: "after" }
    )
    if (!membership) return null

    // Flag the user as a member + bonus coins (non-fatal: a failure here
    // should not undo the membership)
    let coinsAwarded = 0
    let balance = null
    try {
        const update = { $set: { ismembership: true } }
        if (plan.bonusCoins > 0) update.$inc = { cridetCoin: plan.bonusCoins }
        const user = await User.findByIdAndUpdate(membership.user, update, { returnDocument: "after" })
        if (plan.bonusCoins > 0) coinsAwarded = plan.bonusCoins
        balance = user?.cridetCoin ?? null
    } catch (err) {
        console.error(`[Membership] Failed to update user for membership ${membership._id}:`, err.message)
    }
    return { membership, coinsAwarded, balance }
}

// ── Payment API ──────────────────────────────────────────────────────────────

// Step 1: customer picks a plan. Price comes from the database, never from the client.
async function order(req, res) {
    try {
        const userid = req.body.userid || req.body.user || req.body.userId;
        const planid = req.body.planid || req.body.planId || req.body.plan;
        if (!userid || !planid) {
            return res.status(400).send({ result: "Fail", reason: "userid and planid are required" })
        }

        const user = await User.findById(userid).select("_id")
        if (!user) {
            return res.status(404).send({ result: "Fail", reason: "User not found" })
        }

        const plan = await MembershipPlan.findOne({ _id: planid, active: true })
        if (!plan) {
            return res.status(404).send({ result: "Fail", reason: "Plan is not available" })
        }

        await expireMemberships()

        const existing = await Membership.findOne({ user: userid, status: "active", endDate: { $gt: new Date() } })
        if (existing) {
            return res.status(400).send({ result: "Fail", reason: "You already have an active membership" })
        }

        // Clear this user's abandoned checkouts
        await Membership.deleteMany({ user: userid, status: "pending" })

        const membership = await Membership.create({ user: userid, plan: plan._id })

        // Free plan: no payment needed, activate straight away
        if (plan.price <= 0) {
            const result = await activateMembership({ _id: membership._id }, plan, "")
            return res.send({
                result: "Done",
                free: true,
                message: "Membership activated",
                data: result.membership,
                membership: result.membership,
                creditCoinsEarned: result.coinsAwarded,
                creditCoinsBalance: result.balance,
            })
        }

        // Paid plan: create Razorpay order
        let rpOrder
        try {
            const instance = new Razorpay({
                key_id: process.env.RPKEYID,
                key_secret: process.env.RPSECRETKEY,
            })
            rpOrder = await instance.orders.create({
                amount: Math.round(plan.price * 100),
                currency: "INR",
                receipt: String(membership._id),
            })
        } catch (err) {
            console.log(err)
            await membership.deleteOne()
            return res.status(500).json({ message: "Something Went Wrong!" })
        }

        membership.razorpayOrderId = rpOrder.id
        await membership.save()

        res.send({
            result: "Done",
            data: {
                orderId: rpOrder.id,
                amount: rpOrder.amount,
                currency: rpOrder.currency,
                key: process.env.RPKEYID,
                id: rpOrder.id,
            },
            rpOrder: rpOrder,
            orderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            key: process.env.RPKEYID,
            membershipid: membership._id,
            membershipId: membership._id,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error!" })
    }
}

// Step 2: after Razorpay payment, verify the signature and activate the membership
async function verifyOrder(req, res) {
    try {
        const membershipid = req.body.membershipid || req.body.membershipId;
        const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId;
        const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
        const razorpay_signature = req.body.razorpay_signature || req.body.razorpaySignature;
        const userid = req.body.user || req.body.userid || req.body.userId;

        let membership = null;
        if (membershipid) {
            membership = await Membership.findById(membershipid);
        }
        if (!membership && razorpay_order_id) {
            membership = await Membership.findOne({ razorpayOrderId: razorpay_order_id });
        }
        if (!membership && userid) {
            membership = await Membership.findOne({ user: userid, status: "pending" }).sort({ createdAt: -1 });
        }

        if (!membership) {
            return res.status(404).json({ message: "Membership not found!" })
        }

        // The Razorpay order must match
        if (razorpay_order_id && membership.razorpayOrderId && membership.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ result: "Fail", message: "Order mismatch!" })
        }

        // Already activated: just report success
        if (membership.status === "active" && (!razorpay_payment_id || membership.razorpayPaymentId === razorpay_payment_id)) {
            return res.send({ result: "Done", message: "Membership already active", data: membership })
        }

        if (razorpay_signature && process.env.RPSECRETKEY) {
            const generatedSignature = crypto
                .createHmac("sha256", process.env.RPSECRETKEY)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest("hex")

            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({ result: "Fail", message: "Payment verification failed!" })
            }
        }

        const plan = await MembershipPlan.findById(membership.plan)
        if (!plan) {
            return res.status(404).json({ message: "Plan not found!" })
        }

        await expireMemberships()

        let result
        try {
            result = await activateMembership({ _id: membership._id }, plan, razorpay_payment_id || "online")
        } catch (err) {
            // Unique index: user already has another active membership
            if (err.code === 11000) {
                return res.status(409).json({
                    result: "Fail",
                    message: "You already have an active membership. Please contact support for assistance.",
                })
            }
            throw err
        }

        if (!result) {
            return res.status(400).json({ result: "Fail", message: "Membership could not be activated" })
        }

        res.send({
            result: "Done",
            message: "Membership activated",
            data: result.membership,
            creditCoinsEarned: result.coinsAwarded,
            creditCoinsBalance: result.balance,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error!" })
    }
}

// ── Reads ────────────────────────────────────────────────────────────────────

// Admin: every membership with customer and plan details
async function getRecord(req, res) {
    try {
        await expireMemberships()
        let data = await Membership.find()
            .populate("user", "name email phoneNo")
            .populate("plan", "name")
            .sort({ _id: -1 })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// One customer's membership history
async function getUserRecord(req, res) {
    try {
        await expireMemberships()
        let data = await Membership.find({ user: req.params.userid, status: { $ne: "pending" } })
            .populate("plan", "name price durationInMonths")
            .sort({ _id: -1 })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// The customer's current valid membership (or null). Use this at checkout
// to apply discountPercent and freeDelivery.
async function getCurrentRecord(req, res) {
    try {
        await expireMemberships()
        let data = await Membership.findOne({
            user: req.params.userid,
            status: "active",
            endDate: { $gt: new Date() },
        }).populate("plan")
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Membership.findOne({ _id: req.params._id })
            .populate("user", "name email phoneNo")
            .populate("plan", "name")
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// Admin: change status (used by the Cancel button)
async function updateRecord(req, res) {
    try {
        const ALLOWED = ["canceled", "expired"]
        if (!ALLOWED.includes(req.body.status)) {
            return res.status(400).send({
                result: "Fail",
                reason: "Status can only be changed to canceled or expired"
            })
        }

        let data = await Membership.findOne({ _id: req.params._id })
        if (data) {
            data.status = req.body.status
            await data.save()
            await User.findByIdAndUpdate(data.user, { $set: { ismembership: false } })
            await data.populate([
                { path: "user", select: "name email phoneNo" },
                { path: "plan", select: "name" },
            ])
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    order: order,
    verifyOrder: verifyOrder,
    getRecord: getRecord,
    getUserRecord: getUserRecord,
    getCurrentRecord: getCurrentRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    expireMemberships: expireMemberships,
}