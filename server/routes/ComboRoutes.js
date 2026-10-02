const ComboRouter = require("express").Router()
const { comboUploader } = require("../middleware/fileuploader")

const {
    createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/ComboController")
const { verifyBoth } = require("../middleware/authorization")

ComboRouter.post("", verifyBoth, comboUploader.single("pic"), createRecord)
ComboRouter.get("", getRecord)
ComboRouter.get("/:_id", getSingleRecord)
ComboRouter.put("/:_id", verifyBoth, comboUploader.single("pic"), updateRecord)
ComboRouter.delete("/:_id", verifyBoth, deleteRecord)

module.exports = ComboRouter