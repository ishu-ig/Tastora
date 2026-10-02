const mongoose = require("mongoose");

// Roles that log in with email + password
const PASSWORD_ROLES = ["admin", "staff", "deliveryBoy"];

// Removes sensitive fields from every toJSON() / toObject() output,
// so they can never leak through res.send(user) by accident.
function stripSensitive(doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiresAt;
    delete ret.otpAttempts;
    delete ret.otpLastSentAt;
    const coins = ret.cridetCoin ?? ret.creditCoins ?? ret.creditCoin ?? doc?.cridetCoin ?? 0;
    ret.cridetCoin = coins;
    ret.creditCoin = coins;
    ret.creditCoins = coins;
    return ret;
}

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is mandatory"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is mandatory"],
            trim: true,
            lowercase: true,
            // Not globally unique: same email may exist under different roles.
            // Uniqueness is enforced by the compound index below: { email, role }.
        },
        phoneNo: {
            type: Number,
            // Customers log in with their phone, so it is mandatory for them only.
            required: [
                function () {
                    return this.role === "customer";
                },
                "Phone number is mandatory",
            ],
            validate: {
                validator: (v) => /^\d{10}$/.test(String(v)),
                message: "Phone number must be exactly 10 digits",
            },
            // Not globally unique: uniqueness is { phoneNo, role } (see below).
        },
        addresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],
        defaultAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
        },
        role: {
            type: String,
            enum: ["customer", "admin", "staff", "deliveryBoy"],
            default: "customer",
        },
        // NOTE: field name kept as-is ("cridetCoin") to avoid a data migration.
        cridetCoin: { type: Number, default: 10, min: 0 },
        commentedOrderRewards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Checkout"
        }],

        // ---- OTP / auth ----
        otp: { type: String, default: "" },
        otpExpiresAt: { type: Date, default: null },
        otpAttempts: { type: Number, default: 0 },
        otpLastSentAt: { type: Date, default: null },
        password: {
            type: String,
            select: false,
            required: function () {
                return PASSWORD_ROLES.includes(this.role);
            },
        },
        islogin: { type: Boolean, default: false },
        active: { type: Boolean, default: true },
        pic: { type: String, default: "" },

        // ---- reservation / restaurant settings ----
        isreservation: { type: Boolean, default: true },
        reservationPrice: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        finalPrice: { type: Number, default: 0, min: 0 },
        seatAvailable: { type: Number, default: 0, min: 0 },
        openTime: { type: String, default: "" },
        closeTime: { type: String, default: "" },
        ismembership: { type: Boolean, default: false },

        permanentLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            address: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pin: { type: String, default: "" },
        },
        currentLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            updatedAt: { type: Date, default: null },
        },
    },
    {
        timestamps: true,
        toJSON: { transform: stripSensitive },
        toObject: { transform: stripSensitive },
    }
);

// Same email / phone is allowed across different roles,
// but { email + role } and { phoneNo + role } must each be unique.
UserSchema.index({ email: 1, role: 1 }, { unique: true });

// Partial index: users without a phone (e.g. staff) don't collide on "null".
// If you already have the old index, drop it first:
//   db.users.dropIndex("phoneNo_1_role_1")
UserSchema.index(
    { phoneNo: 1, role: 1 },
    { unique: true, partialFilterExpression: { phoneNo: { $type: "number" } } }
);

UserSchema.virtual("creditCoins").get(function () {
    return this.cridetCoin != null ? this.cridetCoin : 0;
}).set(function (val) {
    this.cridetCoin = val;
});

module.exports = mongoose.model("User", UserSchema);