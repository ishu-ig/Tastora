const CartRouter = require("express").Router()

const { createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/CartController")

// FIX: the old `GET /:userid` and `GET /:_id` were the same pattern, so
// getSingleRecord was unreachable, and plain `GET /cart` (what the saga
// calls) matched neither. Now: GET /cart (optionally ?user=<id>) and GET /cart/:_id
CartRouter.post("", createRecord)
CartRouter.get("", getRecord)
CartRouter.get("/user/:userid", getRecord)
CartRouter.get("/:_id", getSingleRecord)
CartRouter.put("/:_id", updateRecord)
CartRouter.delete("/:_id", deleteRecord)

module.exports = CartRouter