const UserRouter = require("express").Router();

const { userUploader } = require("../middleware/fileuploader");
const {
    verifyAdmin,
    verifyBoth,
    verifyThree
} = require("../middleware/authorization");

const {
    createRecord,
    getRecord,
    getSingleRecord,
    getMe,
    deleteRecord,
    login,
    logout,
    UpdateRecord,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    otpSend,
    validateOtp,
    checkEmail,
    checkPhone,
} = require("../controllers/UserController");

// Public routes
UserRouter.post("/", createRecord);
UserRouter.post("/register", createRecord);
UserRouter.post("/login", login);
UserRouter.get("/logout", logout);
UserRouter.post("/logout", logout);

UserRouter.post("/forgetPassword-1", forgetPassword1);
UserRouter.post("/forgetPassword-2", forgetPassword2);
UserRouter.post("/forgetPassword-3", forgetPassword3);

UserRouter.post("/otpSend", otpSend);
UserRouter.post("/send-otp", otpSend);
UserRouter.post("/validateOtp", validateOtp);
UserRouter.post("/verify-otp", validateOtp);

UserRouter.get("/check-phone", checkPhone);
UserRouter.get("/check-email", checkEmail);

// Protected routes
UserRouter.get("/me", verifyThree, getMe);
UserRouter.get("/", verifyAdmin, getRecord);
UserRouter.get("/:_id", verifyThree, getSingleRecord);

UserRouter.put(
    "/update",
    verifyThree,
    userUploader.single("pic"),
    (req, res, next) => {
        req.params._id = req.user?._id || req.body._id || req.body.id;
        return UpdateRecord(req, res);
    }
);

UserRouter.put(
    "/:_id",
    verifyThree,
    userUploader.single("pic"),
    UpdateRecord
);

UserRouter.delete("/:_id", verifyAdmin, deleteRecord);

module.exports = UserRouter;