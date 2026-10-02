const Product = require("../models/Product")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

// ── Shared helper: extract Mongoose validation messages ───────────────────────
// Handles both direct paths ("name") and nested subdocument paths
// ("variants.0.price") by collapsing to the top-level field name, so a
// single UI-facing key (e.g. "variants") is populated regardless of which
// variant/index actually failed.
function extractValidationErrors(error) {
    const errorMessage = {}
    if (!error?.errors) return errorMessage

    Object.keys(error.errors).forEach(path => {
        const field = path.split(".")[0]
        if (!errorMessage[field]) {
            errorMessage[field] = error.errors[path].message
        }
    })
    return errorMessage
}

// ── Shared helper: variants arrive from the client as a JSON string  ─────────
// (FormData can't carry nested arrays natively). Returns { ok, value } so
// callers can respond with a 400 on malformed input instead of a 500.
function parseVariants(raw) {
    if (raw === undefined) return { ok: true, value: undefined }
    if (Array.isArray(raw)) return { ok: true, value: raw } // already an array (e.g. JSON request body)
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) throw new Error("not an array")
        return { ok: true, value: parsed }
    } catch (e) {
        return { ok: false, value: null }
    }
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        const payload = { ...req.body }

        const { ok, value } = parseVariants(payload.variants)
        if (!ok) {
            return res.status(400).send({ result: "Fail", reason: { variants: "Invalid variants format" } })
        }
        if (value !== undefined) payload.variants = value

        let data = new Product(payload)
        if (req.file) {
            data.pic = req.file.path
        } else if (req.body.pic) {
            data.pic = req.body.pic
        } else if (req.body.picUrl) {
            data.pic = req.body.picUrl
        }
        await data.save() // triggers pre("save") to compute each variant's finalPrice

        let finalData = await Product.findById(data._id)
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])

        res.status(201).send({ result: "Done", data: finalData })

    } catch (error) {
        // Delete uploaded file if save failed
        if (req.file) await deleteFromCloudinary(req.file.path);

        const errorMessage = extractValidationErrors(error)

        if (Object.keys(errorMessage).length === 0) {
            console.error("createRecord error:", error)
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        }
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const filter = {}
        if (req.query.active !== undefined) filter.active = req.query.active === "true"
        if (req.query.availability !== undefined) filter.availability = req.query.availability === "true"
        if (req.query.maincategory) filter.maincategory = req.query.maincategory
        if (req.query.subcategory) filter.subcategory = req.query.subcategory
        if (req.query.resturent) filter.resturent = req.query.resturent

        const search = (req.query.search || req.query.q || "").trim()
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { ingredient: { $regex: search, $options: "i" } }
            ]
        }

        let data = await Product.find(filter)
            .sort({ _id: -1 })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])

        res.send({ result: "Done", count: data.length, data })

    } catch (error) {
        console.error("getRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        let data = await Product.findById(req.params._id)
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("reviews.user", ["name", "email"])

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }

        res.send({ result: "Done", data })

    } catch (error) {
        console.error("getSingleRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        // Fetched as a live document (not .lean()) so we can call .save() below,
        // which is what actually triggers the pre("save") finalPrice recompute —
        // findByIdAndUpdate would silently skip that hook.
        let existing = await Product.findById(req.params._id)

        if (!existing) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }

        const { ok, value: parsedVariants } = parseVariants(req.body.variants)
        if (!ok) {
            return res.status(400).send({ result: "Fail", reason: { variants: "Invalid variants format" } })
        }

        // Normalize pic — guard against legacy corrupted array data
        let currentPic = Array.isArray(existing.pic)
            ? existing.pic[existing.pic.length - 1]
            : existing.pic

        existing.name = req.body.name ?? existing.name
        existing.maincategory = req.body.maincategory ?? existing.maincategory
        existing.subcategory = req.body.subcategory ?? existing.subcategory
        existing.discount = req.body.discount ?? existing.discount
        existing.description = req.body.description ?? existing.description
        existing.availability = req.body.availability ?? existing.availability
        existing.active = req.body.active ?? existing.active
        existing.ingredient = req.body.ingredient ?? existing.ingredient
        existing.pic = currentPic

        // Only touch variants if the client actually sent them (e.g. the
        // toggleActive-only update from the list page sends no variants and
        // should leave existing pricing untouched).
        if (parsedVariants !== undefined) {
            existing.variants = parsedVariants
        }
        // NOTE: rating is intentionally excluded — it is managed by addReview

        const newPicUrl = req.body.picUrl || req.body.pic
        if (req.file) {
            if (existing.pic && existing.pic.includes("cloudinary")) {
                await deleteFromCloudinary(existing.pic);
            }
            existing.pic = req.file.path
        } else if (newPicUrl && newPicUrl !== existing.pic && typeof newPicUrl === "string") {
            if (existing.pic && existing.pic.includes("cloudinary")) {
                await deleteFromCloudinary(existing.pic);
            }
            existing.pic = newPicUrl
        }

        await existing.save({ validateModifiedOnly: true })

        let finalData = await Product.findById(existing._id)
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])

        res.send({ result: "Done", data: finalData })

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path);

        const errorMessage = extractValidationErrors(error)

        if (Object.keys(errorMessage).length === 0) {
            console.error("updateRecord error:", error)
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        }
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        let data = await Product.findById(req.params._id)

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }

        // Remove image from disk
        if (data.pic) await deleteFromCloudinary(data.pic);

        await data.deleteOne()
        res.send({ result: "Done", data })

    } catch (error) {
        console.error("deleteRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── ADD REVIEW ────────────────────────────────────────────────────────────────
// Expects: req.user._id (set by verifyBoth middleware), body: { rating, comment }
async function addReview(req, res) {
    try {
        const { rating, comment } = req.body

        // ── Validate inputs ───────────────────────────────────────────────────
        if (!comment || comment.trim() === "") {
            return res.status(400).send({ result: "Fail", reason: "Comment is required" })
        }

        const parsedRating = Number(rating)
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).send({ result: "Fail", reason: "Rating must be a number between 1 and 5" })
        }

        // ── Find product ──────────────────────────────────────────────────────
        let data = await Product.findById(req.params._id)
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Product Not Found" })
        }

        // ── Resolve user from middleware (req.user) or body fallback ─────────
        const userId = (req.user?._id || req.body.user)?.toString()
        const userName = req.user?.name || req.body.name || "Anonymous"

        if (!userId) {
            return res.status(401).send({ result: "Fail", reason: "User identification is required to post a review" })
        }

        // ── Prevent duplicate review from the same user ───────────────────────
        const alreadyReviewed = data.reviews.some(r => r.user?.toString() === userId)
        if (alreadyReviewed) {
            return res.status(400).send({ result: "Fail", reason: "You have already reviewed this product" })
        }

        // ── Push new review ───────────────────────────────────────────────────
        data.reviews.push({
            user: userId,
            name: userName,
            rating: parsedRating,
            comment: comment.trim()
        })

        // ── Recalculate average rating ────────────────────────────────────────
        data.recalcRating()

        await data.save()

        res.status(201).send({
            result: "Done",
            reviewCount: data.reviews.length,
            averageRating: data.rating,
            reviews: data.reviews
        })

    } catch (error) {
        console.error("addReview error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── DELETE REVIEW (admin or review owner) ─────────────────────────────────────
async function deleteReview(req, res) {
    try {
        const { _id, reviewId } = req.params

        let data = await Product.findById(_id)
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Product Not Found" })
        }

        const reviewIndex = data.reviews.findIndex(r => r._id.toString() === reviewId)
        if (reviewIndex === -1) {
            return res.status(404).send({ result: "Fail", reason: "Review Not Found" })
        }

        // Only the review owner OR an admin can delete
        const requesterId = (req.user?._id || req.body.user)?.toString()
        const isOwner = data.reviews[reviewIndex].user?.toString() === requesterId
        const isAdmin = req.user?.role === "admin"

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ result: "Fail", reason: "Not authorized to delete this review" })
        }

        data.reviews.splice(reviewIndex, 1)
        data.recalcRating()
        await data.save()

        res.send({
            result: "Done",
            reviewCount: data.reviews.length,
            averageRating: data.rating,
            reviews: data.reviews
        })

    } catch (error) {
        console.error("deleteReview error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── GET REVIEWS for a product ─────────────────────────────────────────────────
async function getReviews(req, res) {
    try {
        let data = await Product.findById(req.params._id)
            .select("reviews rating")
            .populate("reviews.user", ["name", "email"])

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Product Not Found" })
        }

        res.send({
            result: "Done",
            reviewCount: data.reviews.length,
            averageRating: data.rating,
            reviews: data.reviews
        })

    } catch (error) {
        console.error("getReviews error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

module.exports = {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    addReview,
    deleteReview,
    getReviews
}