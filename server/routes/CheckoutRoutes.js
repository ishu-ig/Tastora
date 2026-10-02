const CheckoutRouter = require("express").Router();
const { verifyThree } = require("../middleware/authorization");

const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    getUserRecord,
    deleteRecord,
    order,
    verifyOrder,
    getTrackingRecord,
    commentOnOrder,
    rateDeliveryOrder,
} = require("../controllers/CheckoutController");

CheckoutRouter.post("", createRecord);
CheckoutRouter.get("", getRecord);
CheckoutRouter.get("/user/:userid", getUserRecord);
CheckoutRouter.get("/tracking/:id", verifyThree, getTrackingRecord);
CheckoutRouter.post("/:_id/comment", verifyThree, commentOnOrder);
CheckoutRouter.post("/:_id/delivery-rating", verifyThree, rateDeliveryOrder);
CheckoutRouter.get("/:_id", getSingleRecord);
CheckoutRouter.put("/:_id", updateRecord);
CheckoutRouter.delete("/:_id", deleteRecord);

// Razorpay endpoints
CheckoutRouter.post("/order", order);
CheckoutRouter.post("/verify", verifyOrder);

module.exports = CheckoutRouter;
