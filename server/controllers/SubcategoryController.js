const Subcategory = require("../models/Subcategory")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        let data = new Subcategory(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        let finalData = await Subcategory.findOne({ _id: data._id })
            .populate("maincategory", ["name"])
        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {

        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {}
        error.keyValue ? errorMessage.name = "Subcategory Already Exist" : null
        error.errors?.maincategory ? errorMessage.maincategory = error.errors.maincategory.message : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.pic ? errorMessage.pic = error.errors.pic.message : null

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
        let data = await Subcategory.find().sort({ _id: -1 })
            .populate("maincategory", ["name"])
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
        let data = await Subcategory.findOne({ _id: req.params._id })
            .populate("maincategory", ["name"])
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
        let data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.maincategory = req.body.maincategory ?? data.maincategory
            data.active = req.body.active ?? data.active
            if (req.file) {
                await deleteFromCloudinary(data.pic); // delete old BEFORE overwriting
                data.pic = req.file.path;
            }
            await data.save();
            let finalData = await Subcategory.findOne({ _id: data._id })
                .populate("maincategory", ["name"])
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
        error.keyValue ? errorMessage.name = "Subcategory already Exist" : null
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
        let data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            if (data.pic) await deleteFromCloudinary(data.pic);
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