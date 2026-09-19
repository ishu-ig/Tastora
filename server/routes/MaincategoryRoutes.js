const MaincategoryRouter = require("express").Router()
const { maincategoryUploader } = require("../middleware/fileuploader")
const { verifyAdmin, verifyThree } = require("../middleware/authorization")

const { createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/MaincategoryController")


MaincategoryRouter.post("", verifyAdmin, maincategoryUploader.single("pic"), createRecord)
MaincategoryRouter.get("", getRecord)
MaincategoryRouter.get("/:_id", verifyThree,getSingleRecord)
MaincategoryRouter.put("/:_id", verifyAdmin, maincategoryUploader.single("pic"), updateRecord)
MaincategoryRouter.delete("/:_id", verifyAdmin, deleteRecord)

module.exports = MaincategoryRouter