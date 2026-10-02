const DeliveryBoyRouter = require("express").Router();

const { deliveryBoyUploader } = require("../middleware/fileuploader");
const {
    verifyAdmin,
    verifyBoth,
    verifyThree,
    verifyTwoDelivery
} = require("../middleware/authorization");

const {
    createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    checkEmail,

    checkPhone,
    updateLiveLocation,
} = require("../controllers/DeliveryBoyController");

// Public routes
DeliveryBoyRouter.post("/", createRecord);
DeliveryBoyRouter.post("/login", login);

DeliveryBoyRouter.post("/forgetPassword-1", forgetPassword1);
DeliveryBoyRouter.post("/forgetPassword-2", forgetPassword2);
DeliveryBoyRouter.post("/forgetPassword-3", forgetPassword3);


DeliveryBoyRouter.get("/check-email", checkEmail);
DeliveryBoyRouter.get("/check-phone", checkPhone);

// Protected routes
DeliveryBoyRouter.get("/", verifyTwoDelivery, getRecord);
DeliveryBoyRouter.get("/:_id", verifyTwoDelivery, getSingleRecord);

DeliveryBoyRouter.put("/:_id", verifyTwoDelivery, deliveryBoyUploader.single("pic"), updateRecord);

DeliveryBoyRouter.patch("/:_id/location", verifyTwoDelivery, updateLiveLocation);

DeliveryBoyRouter.delete("/:_id", verifyTwoDelivery, deleteRecord);

module.exports = DeliveryBoyRouter;