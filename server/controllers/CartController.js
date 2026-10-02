const Cart = require("../models/Cart")
const Product = require("../models/Product")
const Thali = require("../models/Thali")
const Combo = require("../models/Combo")
require("../models/User")
require("../models/Maincategory")

const productPopulate = {
    path: "product",
    select: "name maincategory variants discount pic",
    populate: [
        { path: "maincategory", select: "-_id name" }
    ]
}

async function populateCartItem(item) {
    if (!item) return null;
    const doc = item.toObject ? item.toObject() : { ...item };
    if (doc.product && typeof doc.product === "object" && doc.product.name) {
        doc.productName = doc.productName || doc.product.name;
    }
    if (!doc.product) {
        const rawId = item.populated ? item.populated("product") : (doc._doc ? doc._doc.product : doc.product);
        const searchId = rawId || doc.product;
        if (searchId) {
            try {
                const thali = await Thali.findById(searchId).lean();
                if (thali) {
                    doc.product = {
                        _id: thali._id,
                        name: thali.name,
                        pic: thali.image ? [thali.image] : [],
                        discount: thali.discount || 0,
                        variants: [{ name: "Full", price: thali.originalPrice || thali.price, finalPrice: thali.price }],
                        maincategory: { name: thali.thaliType || "Thali" },
                        itemType: "thali"
                    };
                    doc.productName = doc.productName || thali.name;
                } else {
                    const combo = await Combo.findById(searchId).lean();
                    if (combo) {
                        doc.product = {
                            _id: combo._id,
                            name: combo.name,
                            pic: combo.image ? [combo.image] : [],
                            discount: combo.discount || 0,
                            variants: [{ name: "Full", price: combo.originalPrice || combo.price, finalPrice: combo.price }],
                            maincategory: { name: "Combo" },
                            itemType: "combo"
                        };
                        doc.productName = doc.productName || combo.name;
                    }
                }
            } catch (err) {
                console.error("Cart populate fallback error:", err);
            }
        }
    }
    return doc;
}

async function loadPopulated(id) {
    const raw = await Cart.findOne({ _id: id }).populate(productPopulate)
    return await populateCartItem(raw)
}

// The server is the source of truth for price: total = variant price x qty.
// Falls back to the client value only if the product/variant can't be found.
async function calcTotal(productId, variantName, qty, fallback) {
    try {
        const p = await Product.findById(productId).select("variants")
        const v = p?.variants?.find(x => x.name === variantName)
        const unit = v?.finalPrice ?? v?.price
        if (typeof unit === "number") return unit * qty

        const t = await Thali.findById(productId).select("price")
        if (typeof t?.price === "number") return t.price * qty

        const c = await Combo.findById(productId).select("price")
        if (typeof c?.price === "number") return c.price * qty
    } catch (e) { /* fall through */ }
    return fallback
}

function sendError(res, error) {
    let errorMessage = {}
    error.errors?.user ? errorMessage.user = error.errors.user.message : null
    error.errors?.product ? errorMessage.product = error.errors.product.message : null
    error.errors?.variant ? errorMessage.variant = error.errors.variant.message : null
    error.errors?.qty ? errorMessage.qty = error.errors.qty.message : null
    error.errors?.total ? errorMessage.total = error.errors.total.message : null
    if (error.name === "CastError") errorMessage[error.path || "id"] = "Invalid value"

    if (Object.values(errorMessage).length === 0) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    } else {
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

async function createRecord(req, res) {
    try {
        const { user, product, variant } = req.body
        const productName = typeof req.body.productName === "string" ? req.body.productName.trim() : ""
        const qty = Number(req.body.qty) || 1

        // Same user + product + variant already in cart -> bump the quantity
        // instead of creating a duplicate line.
        let data = user && product && variant
            ? await Cart.findOne({ user, product, variant })
            : null

        if (data) {
            data.qty += qty
            data.total = await calcTotal(product, variant, data.qty, data.total)
            if (productName) data.productName = productName
        } else {
            data = new Cart({
                user, product, productName, variant: variant || "Full", qty,
                total: await calcTotal(product, variant || "Full", qty, req.body.total)
            })
        }
        await data.save()

        res.send({ result: "Done", data: await loadPopulated(data._id) })
    } catch (error) {
        sendError(res, error)
    }
}

async function getRecord(req, res) {
    try {
        const userId = req.params.userid || req.query.user
        const filter = userId ? { user: userId } : {}
        let rawData = await Cart.find(filter).sort({ _id: -1 })
            .populate(productPopulate)
        let data = await Promise.all(rawData.map(populateCartItem))
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        sendError(res, error)
    }
}

async function getSingleRecord(req, res) {
    try {
        const id = req.params._id
        // If query looks like a user fetching their cart list:
        const userItems = await Cart.find({ user: id }).sort({ _id: -1 })
            .populate(productPopulate)
        if (userItems && userItems.length > 0) {
            const data = await Promise.all(userItems.map(populateCartItem))
            return res.send({ result: "Done", count: data.length, data: data })
        }

        let data = await loadPopulated(id)
        if (data) {
            return res.send({ result: "Done", data })
        }

        // Return empty list if user has no items yet
        res.send({ result: "Done", count: 0, data: [] })
    } catch (error) {
        sendError(res, error)
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Cart.findOne({ _id: req.params._id })
        if (!data) return res.status(404).send({ result: "Fail", reason: "Record Not Found" })

        data.qty = req.body.qty ?? data.qty
        data.variant = req.body.variant ?? data.variant
        data.total = await calcTotal(data.product, data.variant, data.qty, data.total)
        await data.save()

        res.send({ result: "Done", data: await loadPopulated(data._id) })
    } catch (error) {
        sendError(res, error)
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Cart.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({ result: "Done", data })
        } else {
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }
    } catch (error) {
        sendError(res, error)
    }
}

module.exports = { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord }
