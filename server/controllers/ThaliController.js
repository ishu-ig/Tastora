const Thali = require("../models/Thali")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

function parseItems(rawItems) {
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems !== "string") return null;

    try {
        const items = JSON.parse(rawItems);
        return Array.isArray(items) ? items : null;
    } catch {
        return null;
    }
}

async function createRecord(req, res) {
    try {
        const payload = { ...req.body };
        if (payload.items !== undefined) {
            payload.items = parseItems(payload.items);
            if (!payload.items) {
                return res.status(400).send({ result: "Fail", reason: { items: "Invalid thali items format" } });
            }
        }

        let data = new Thali(payload)

        if (req.file) {
            data.image = req.file.path
        } else if (req.body.image) {
            data.image = req.body.image
        } else if (req.body.imageUrl) {
            data.image = req.body.imageUrl
        }

        await data.save()
        const populatedData = await Thali.findById(data._id).populate("items.product");
        res.send({
            result: "Done",
            data: populatedData || data
        })
    } catch (error) {

        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {}
        error.keyValue ? errorMessage.name = "Thali Already Exist" : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.description ? errorMessage.description = error.errors.description.message : null
        error.errors?.price ? errorMessage.price = error.errors.price.message : null
        error.errors?.image ? errorMessage.image = error.errors.image.message : null

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
        let data = await Thali.find()
            .populate("items.product")
            .sort({ _id: -1 })

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
        let data = await Thali.findOne({ _id: req.params._id })
            .populate("items.product")

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
        let data = await Thali.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.description = req.body.description ?? data.description
            data.price = req.body.price ?? data.price
            data.originalPrice = req.body.originalPrice ?? data.originalPrice
            data.discount = req.body.discount ?? data.discount
            data.servingFor = req.body.servingFor ?? data.servingFor
            data.thaliType = req.body.thaliType ?? data.thaliType
            data.isVeg = req.body.isVeg ?? data.isVeg
            data.isAvailable = req.body.isAvailable ?? data.isAvailable

            if (req.body.items !== undefined) {
                const items = parseItems(req.body.items);
                if (!items) {
                    return res.status(400).send({ result: "Fail", reason: { items: "Invalid thali items format" } });
                }
                data.items = items;
            }

            const newImageUrl = req.body.imageUrl || req.body.image
            if (req.file) {
                if (data.image && data.image.includes("cloudinary")) {
                    await deleteFromCloudinary(data.image)
                }
                data.image = req.file.path
            } else if (newImageUrl && newImageUrl !== data.image) {
                if (data.image && data.image.includes("cloudinary")) {
                    await deleteFromCloudinary(data.image)
                }
                data.image = newImageUrl
            }

            await data.save()
            const populatedData = await Thali.findById(data._id).populate("items.product");
            res.send({
                result: "Done",
                data: populatedData || data
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
        error.keyValue ? errorMessage.name = "Thali already Exist" : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.description ? errorMessage.description = error.errors.description.message : null
        error.errors?.price ? errorMessage.price = error.errors.price.message : null

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
        let data = await Thali.findOne({ _id: req.params._id })
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