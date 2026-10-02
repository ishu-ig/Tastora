const WishlistRouter = require("express").Router()

const {
    createRecord,
    getRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/WishlistController")

WishlistRouter.post("", createRecord)
WishlistRouter.get("", getRecord)
WishlistRouter.get("/user/:userid", getRecord)
WishlistRouter.get("/:userid", getRecord)
WishlistRouter.delete("/:_id", deleteRecord)

module.exports = WishlistRouter