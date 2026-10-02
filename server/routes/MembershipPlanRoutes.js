const MembershipPlanRouter = require("express").Router()
const { verifyAdmin, verifyThree } = require("../middleware/authorization")

const { createRecord,
    getRecord,
    getActiveRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/MembershipPlanController")

MembershipPlanRouter.post("", verifyAdmin, createRecord)
MembershipPlanRouter.get("", getRecord)
MembershipPlanRouter.get("/active", getActiveRecord)   // must stay above "/:_id"
MembershipPlanRouter.get("/:_id", verifyThree, getSingleRecord)
MembershipPlanRouter.put("/:_id", verifyAdmin, updateRecord)
MembershipPlanRouter.delete("/:_id", verifyAdmin, deleteRecord)

module.exports = MembershipPlanRouter