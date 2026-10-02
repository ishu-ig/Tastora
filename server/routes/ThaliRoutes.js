const ThaliRouter = require("express").Router();
const { verifyBoth } = require("../middleware/authorization");
const { thaliUploader } = require("../middleware/fileuploader");
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/ThaliController");

ThaliRouter.post("", verifyBoth, thaliUploader.single("image"), createRecord);
ThaliRouter.get("", getRecord);
ThaliRouter.get("/:_id", getSingleRecord);
ThaliRouter.put("/:_id", verifyBoth, thaliUploader.single("image"), updateRecord);
ThaliRouter.delete("/:_id", verifyBoth, deleteRecord);

module.exports = ThaliRouter;
