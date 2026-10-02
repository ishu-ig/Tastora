const mongoose = require("mongoose");

// ── Review Schema ─────────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            default: "Anonymous"
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

// ── Product Variant Schema ────────────────────────────────────────────────────
const VariantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ["Half", "Full"],
            required: true
        },

        // Original Price
        price: {
            type: Number,
            required: true,
            min: 0
        },

        // Price after discount
        finalPrice: {
            type: Number,
            default: 0
        },

        available: {
            type: Boolean,
            default: true
        }
    },
    { _id: false }
);

// ── Product Schema ────────────────────────────────────────────────────────────
const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product Name Is Mandatory"],
            trim: true
        },

        maincategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Maincategory",
            required: [true, "Select Maincategory"]
        },

        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
            required: [true, "Select Subcategory"]
        },

        ingredient: {
            type: String,
            default: "",
            trim: true
        },

        resturent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resturent",
            default: null
        },

        pic: {
            type: String,
            required: [true, "Product Pic Is Mandatory"]
        },

        variants: {
            type: [VariantSchema],
            default: []
        },

        // One discount for all variants
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        description: {
            type: String,
            required: [true, "Description Is Mandatory"],
            trim: true
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        availability: {
            type: Boolean,
            default: true
        },

        active: {
            type: Boolean,
            default: true
        },

        reviews: {
            type: [ReviewSchema],
            default: []
        }
    },
    { timestamps: true }
);

// ── Automatically calculate final price for every variant ────────────────────
ProductSchema.pre("save", function () {
    this.variants = this.variants.map(item => {
        const base = typeof item.toObject === "function" ? item.toObject() : { ...item };
        return {
            ...base,
            finalPrice: Math.round(
                item.price - (item.price * this.discount) / 100
            )
        };
    });
});

// ── Calculate Average Rating ──────────────────────────────────────────────────
ProductSchema.methods.recalcRating = function () {
    if (!this.reviews.length) {
        this.rating = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    }
};

module.exports = mongoose.model("Product", ProductSchema);