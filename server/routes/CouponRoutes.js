const CouponRouter = require("express").Router()
const {
    validateCoupon,
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/CouponController")
const { verifyBoth } = require("../middleware/authorization")

// Validate coupon route (available for checkout / cart validation)
CouponRouter.post("/validate", validateCoupon)

// Coupon CRUD routes (Admin / Staff management)
CouponRouter.post("", verifyBoth, createRecord)
CouponRouter.get("", getRecord)
CouponRouter.get("/:_id", getSingleRecord)
CouponRouter.put("/:_id", verifyBoth, updateRecord)
CouponRouter.delete("/:_id", verifyBoth, deleteRecord)

module.exports = CouponRouter