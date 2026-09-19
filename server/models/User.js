const mongoose = require('mongoose')
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, "Name Is Mendatory"]
    },
    email: {
        type: String,
        require: [true, "Email Is Mendatory"],
        unique: true
    },
    phoneNo: {
        type: Number,
        require: [
            true,
            "Phone Number is Mendatory"
        ],
        unique: true
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }],

    defaultAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        default: null
    },
    role: {
        type: String,
        enum: [
            'Customer',
            'Admin',
            'Staff',
        ],
        default: 'Customer'
    },
    superCoins: {
        type: Number,
        default: 0
    },
    otp: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        select: false,
        required: function () {
            return this.role === "Admin" || this.role === "Staff";
        }
    },

    otpExpiresAt: {
        type: Date,
        default: null
    },
    islogin: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('User', UserSchema)