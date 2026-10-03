const CouponRouter = require("express").Router()
const {
    validateCoupon,
    getUserUsage,
    getUsageStats,
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/CouponController")
const { verifyBoth } = require("../middleware/authorization")

// Validate coupon route (available for checkout / cart validation)
CouponRouter.post("/validate", validateCoupon)

// Per-user usage — how many times this user has redeemed each coupon
// Used by the cart UI to show "Already used" badges on coupon cards
// GET /api/coupon/usage/user/:userId
CouponRouter.get("/usage/user/:userId", getUserUsage)

// Admin: full redemption breakdown for a specific coupon
// GET /api/coupon/:_id/usage-stats
CouponRouter.get("/:_id/usage-stats", verifyBoth, getUsageStats)

// Coupon CRUD routes (Admin / Staff management)
CouponRouter.post("", verifyBoth, createRecord)
CouponRouter.get("", getRecord)
CouponRouter.get("/:_id", getSingleRecord)
CouponRouter.put("/:_id", verifyBoth, updateRecord)
CouponRouter.delete("/:_id", verifyBoth, deleteRecord)

module.exports = CouponRouter