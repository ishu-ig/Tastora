const MembershipRouter = require("express").Router()
const { verifyAdmin } = require("../middleware/authorization")

const {
    order,
    verifyOrder,
    getRecord,
    getUserRecord,
    getCurrentRecord,
    getSingleRecord,
    updateRecord,
} = require("../controllers/MembershipController")

const { getActiveRecord } = require("../controllers/MembershipPlanController")

// Admin
MembershipRouter.get("", verifyAdmin, getRecord)
MembershipRouter.put("/:_id", verifyAdmin, updateRecord)

// Public & Customer endpoints
MembershipRouter.get("/plans", getActiveRecord)
MembershipRouter.get("/active-plans", getActiveRecord)
MembershipRouter.get("/user/:userid", getUserRecord)
MembershipRouter.get("/current/:userid", getCurrentRecord)
MembershipRouter.get("/status/:userid", getCurrentRecord)
MembershipRouter.post("/order", order)
MembershipRouter.post("/verify", verifyOrder)

// Keep this last, so it doesn't catch "/user/..." or "/current/..."
MembershipRouter.get("/:_id", verifyAdmin, getSingleRecord)

module.exports = MembershipRouter