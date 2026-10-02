const ProductRouter = require("express").Router()
const { productUploader } = require("../middleware/fileuploader")
const {  verifyBoth, verifyThree, verifyBuyer } = require("../middleware/authorization")

const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    addReview,
    deleteReview,
    getReviews,
} = require("../controllers/ProductController")

// ── Product CRUD ──────────────────────────────────────────────────────────────
ProductRouter.post(   "", verifyBoth,      productUploader.single("pic"), createRecord)
ProductRouter.get(    "",                                                getRecord)
ProductRouter.get(    "/:_id",                                           getSingleRecord)
ProductRouter.put(    "/:_id", verifyBoth,  productUploader.single("pic"), updateRecord)
ProductRouter.delete( "/:_id",  verifyBoth,                              deleteRecord)

// ── Review routes  ────────────────────────────────────────────────────────────
// GET    /product/:_id/review          → list all reviews for a product (public)
// POST   /product/:_id/review          → add a review       (logged-in users)
// DELETE /product/:_id/review/:reviewId → delete a review   (owner or admin)
ProductRouter.get(    "/:_id/review",                                   getReviews)
ProductRouter.post(   "/:_id/review", verifyThree,                      addReview)
ProductRouter.delete( "/:_id/review/:reviewId", verifyThree,           deleteReview)

module.exports = ProductRouter