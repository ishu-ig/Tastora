const Combo = require("../models/Combo")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        if (typeof req.body.products === "string") {
            try {
                req.body.products = JSON.parse(req.body.products);
            } catch (e) {}
        }
        let data = new Combo(req.body)
        if (req.file) {
            data.image = req.file.path
        } else if (req.body.image) {
            data.image = req.body.image
        } else if (req.body.imageUrl) {
            data.image = req.body.imageUrl
        } else if (req.body.pic) {
            data.image = req.body.pic
        }
        await data.save()
        let finalData = await Combo.findOne({ _id: data._id })
            .populate("items", ["name", "pic", "price", "variants", "discount"])
        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {

        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {}
        error.keyValue ? errorMessage.name = "Combo Already Exists" : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.description ? errorMessage.description = error.errors.description.message : null
        error.errors?.price ? errorMessage.price = error.errors.price.message : null
        error.errors?.image ? errorMessage.image = error.errors.image.message : null
        error.errors?.items ? errorMessage.items = error.errors.items.message : null

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            })
        }
    }
}

async function getRecord(req, res) {
    try {
        let data = await Combo.find().sort({ _id: -1 })
            .populate("items", ["name", "pic", "price", "variants", "discount"])
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Combo.findOne({ _id: req.params._id })
            .populate("items", ["name", "pic", "price", "variants", "discount"])
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

async function updateRecord(req, res) {
    try {
        let data = await Combo.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.items = req.body.items ?? data.items
            data.description = req.body.description ?? data.description
            data.price = req.body.price ?? data.price
            data.costFloor = req.body.costFloor ?? data.costFloor
            data.minProfit = req.body.minProfit ?? data.minProfit
            data.originalPrice = req.body.originalPrice ?? data.originalPrice
            data.discount = req.body.discount ?? data.discount
            if (typeof req.body.products === "string") {
                try {
                    data.products = JSON.parse(req.body.products);
                } catch (e) {
                    data.products = req.body.products ?? data.products;
                }
            } else if (req.body.products) {
                data.products = req.body.products;
            }

            const newImageUrl = req.body.imageUrl || req.body.image || req.body.pic;
            if (req.file) {
                if (data.image && data.image.includes("cloudinary")) {
                    await deleteFromCloudinary(data.image);
                }
                data.image = req.file.path;
            } else if (newImageUrl && newImageUrl !== data.image) {
                if (data.image && data.image.includes("cloudinary")) {
                    await deleteFromCloudinary(data.image);
                }
                data.image = newImageUrl;
            }

            await data.save();
            let finalData = await Combo.findOne({ _id: data._id })
                .populate("items", ["name", "pic", "price", "variants", "discount"])
            res.send({
                result: "Done",
                data: finalData
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path);
        let errorMessage = {}
        error.keyValue ? errorMessage.name = "Combo Already Exists" : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.description ? errorMessage.description = error.errors.description.message : null
        error.errors?.price ? errorMessage.price = error.errors.price.message : null
        error.errors?.image ? errorMessage.image = error.errors.image.message : null
        console.log(error)
        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            })
        }
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Combo.findOne({ _id: req.params._id })
        if (data) {
            if (data.image) await deleteFromCloudinary(data.image);
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
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}