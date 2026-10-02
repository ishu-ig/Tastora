const mongoose = require("mongoose");

const ThaliSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    default: null,
                },

                customName: {
                    type: String,
                    trim: true,
                    default: "",
                },

                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },

                isOptional: {
                    type: Boolean,
                    default: false,
                },
                note: {
                    type: String,
                    trim: true,
                    default: "",
                },
                others:{
                    type:String,
                    default:""
                }
            },
        ],

        description: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        originalPrice: {
            type: Number,
            default: 0,
        },

        discount: {
            type: Number,
            default: 0,
        },

        servingFor: {
            type: Number,
            default: 1,
            min: 1,
        },

        thaliType: {
            type: String,
            enum: [
                "North Indian",
                "South Indian",
                "Punjabi",
                "Gujarati",
                "Rajasthani",
                "Bengali",
                "Maharashtrian",
                "Special",
            ],
            default: "Special",
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Thali", ThaliSchema);