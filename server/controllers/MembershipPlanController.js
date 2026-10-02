const Membership = require("../models/Membership")
const MembershipPlan = require("../models/MembershipPlan")

const PLAN_FIELDS = [
    "name", "description", "price", "durationInMonths",
    "discountPercent", "freeDelivery", "bonusCoins", "active",
]

// Only take the fields we expect from the request body
function pickPlanFields(body) {
    const out = {}
    PLAN_FIELDS.forEach((f) => {
        if (body[f] !== undefined) out[f] = body[f]
    })
    return out
}

// Collect mongoose validation messages, e.g. { name: "Plan name is mandatory" }
function getErrorMessages(error) {
    const messages = {}
    if (error.errors) {
        Object.keys(error.errors).forEach((k) => {
            messages[k] = error.errors[k].message
        })
    }
    return messages
}

// Whole-number checks that the schema does not enforce
function checkWholeNumbers(fields) {
    const messages = {}
    if (fields.durationInMonths !== undefined && !Number.isInteger(Number(fields.durationInMonths))) {
        messages.durationInMonths = "Duration must be a whole number of months"
    }
    if (fields.bonusCoins !== undefined && !Number.isInteger(Number(fields.bonusCoins))) {
        messages.bonusCoins = "Bonus coins must be a whole number"
    }
    return messages
}

// Case-insensitive duplicate name check
async function nameExists(name, excludeId) {
    const filter = { name: String(name).trim() }
    if (excludeId) filter._id = { $ne: excludeId }
    const found = await MembershipPlan.findOne(filter).collation({ locale: "en", strength: 2 })
    return !!found
}

async function createRecord(req, res) {
    try {
        const fields = pickPlanFields(req.body)

        const wholeErr = checkWholeNumbers(fields)
        if (Object.keys(wholeErr).length) {
            return res.status(400).send({ result: "Fail", reason: wholeErr })
        }
        if (fields.name && await nameExists(fields.name)) {
            return res.status(400).send({ result: "Fail", reason: { name: "Plan Already Exist" } })
        }

        const data = new MembershipPlan(fields)
        await data.save()
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {
        const errorMessage = getErrorMessages(error)
        if (Object.values(errorMessage).length === 0) {
            console.log(error)
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

// All plans (admin list)
async function getRecord(req, res) {
    try {
        let data = await MembershipPlan.find().sort({ _id: -1 })
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

// Only active plans (what customers can buy)
async function getActiveRecord(req, res) {
    try {
        let data = await MembershipPlan.find({ active: true }).sort({ price: 1 })
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
        let data = await MembershipPlan.findOne({ _id: req.params._id })
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
        let data = await MembershipPlan.findOne({ _id: req.params._id })
        if (data) {
            const fields = pickPlanFields(req.body)

            const wholeErr = checkWholeNumbers(fields)
            if (Object.keys(wholeErr).length) {
                return res.status(400).send({ result: "Fail", reason: wholeErr })
            }
            if (fields.name && await nameExists(fields.name, data._id)) {
                return res.status(400).send({ result: "Fail", reason: { name: "Plan Already Exist" } })
            }

            Object.assign(data, fields)
            await data.save()
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
        const errorMessage = getErrorMessages(error)
        if (Object.values(errorMessage).length === 0) {
            console.log(error)
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
        let data = await MembershipPlan.findOne({ _id: req.params._id })
        if (data) {
            // Don't delete a plan that people are currently using
            const inUse = await Membership.exists({ plan: data._id, status: "active" })
            if (inUse) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "This plan has active members. Deactivate it instead of deleting."
                })
            }
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
    getActiveRecord: getActiveRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}