const Wishlist = require("../models/Wishlist")
require("../models/User")
require("../models/Product")
require("../models/Maincategory")
require("../models/Subcategory")

const productPopulate = {
    path: "product",
    select: "name maincategory subcategory discount pic variants",
    populate: [
        { path: "maincategory", select: "-_id name" }
    ]
}

async function createRecord(req, res) {
    try {
        const { user, product } = req.body
        if (!user || !product) {
            return res.status(400).send({
                result: "Fail",
                reason: {
                    user: !user ? "User is mandatory" : undefined,
                    product: !product ? "Product is mandatory" : undefined,
                }
            })
        }

        // Avoid creating duplicate wishlist entries
        let existing = await Wishlist.findOne({ user, product })
        if (existing) {
            let finalData = await Wishlist.findOne({ _id: existing._id })
                .populate("user", ["name", "username"])
                .populate(productPopulate)
            return res.send({ result: "Done", data: finalData })
        }

        let data = new Wishlist({ user, product })
        await data.save()
        let finalData = await Wishlist.findOne({ _id: data._id })
            .populate("user", ["name", "username"])
            .populate(productPopulate)
        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {
        let errorMessage = {}
        error.errors?.user ? errorMessage.user = error.errors.user.message : null
        error.errors?.product ? errorMessage.product = error.errors.product.message : null

        if (Object.values(errorMessage).length === 0) {
            console.error("Wishlist create error:", error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        } else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            })
        }
    }
}

async function getRecord(req, res) {
    try {
        const userId = req.params.userid || req.query.user
        const filter = userId ? { user: userId } : {}
        let data = await Wishlist.find(filter).sort({ _id: -1 })
            .populate("user", ["name", "username"])
            .populate(productPopulate)
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.error("Wishlist get error:", error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Wishlist.findOne({ _id: req.params._id })
            .populate("user", ["name", "username"])
            .populate({
                path: "product",
                select: "name maincategory subcategory resturent discount pic variants",

                populate:  [
                    {
                        path: "maincategory",
                        select: "-_id name" 
                    },
                    {
                        path: "resturent",
                        select: "-_id name" 
                    }
                ],
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Wishlist.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    deleteRecord: deleteRecord
}