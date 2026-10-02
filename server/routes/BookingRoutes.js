const BookingRouter = require("express").Router()
const { verifyBoth, verifyThree } = require("../middleware/authorization")

const { createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
    getUserRecord,
    order,
    verifyOrder,
    cancelOwnRecord,
    rateOwnRecord
} = require("../controllers/BookingController");



BookingRouter.post("", verifyThree, createRecord);
BookingRouter.post("/:_id/cancel", verifyThree, cancelOwnRecord);
BookingRouter.post("/:_id/rating", verifyThree, rateOwnRecord);
BookingRouter.get("", getRecord);
BookingRouter.get("/user/:userid", verifyThree, getUserRecord);
BookingRouter.get("/single/:_id", verifyThree, getSingleRecord);
BookingRouter.put("/:_id", verifyBoth, updateRecord);
BookingRouter.delete("/:_id", verifyBoth, deleteRecord);
BookingRouter.post("/order", verifyThree, order);
BookingRouter.post("/verify", verifyThree, verifyOrder);

module.exports = BookingRouter