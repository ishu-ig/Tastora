const mongoose = require("mongoose")

const SubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Subcategory Name Is Mandatory"]
    },
    maincategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maincategory",
        required: [true, "Select Maincategory"]
    },
    pic: {
        type: String,
        required: [true, "Subcategory Pic Is Mandatory"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema)

module.exports = Subcategory 