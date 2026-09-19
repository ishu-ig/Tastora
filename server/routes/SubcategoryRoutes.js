const SubcategoryRouter = require("express").Router()
const { subcategoryUploader } = require("../middleware/fileuploader")

const { createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/SubcategoryController")
const { verifyAdmin, verifyThree, verifyBoth } = require("../middleware/authorization")


SubcategoryRouter.post("",  verifyAdmin,subcategoryUploader.single("pic"), createRecord)
SubcategoryRouter.get("", getRecord)
SubcategoryRouter.get("/:_id",verifyBoth, getSingleRecord)
SubcategoryRouter.put("/:_id", verifyAdmin,  subcategoryUploader.single("pic"), updateRecord)
SubcategoryRouter.delete("/:_id",verifyAdmin,  deleteRecord)

module.exports = SubcategoryRouter