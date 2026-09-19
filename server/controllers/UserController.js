const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const bcrypt = require("bcrypt");
const mailer = require('../mailer/index');
const schema = require('../Password');
const {
    checkPhone,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    checkEmail,
    login
} = require('../Login_ForgetPassword');

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const ALLOWED_ROLES = ["Admin", "Customer", "Staff"];

function getJwtSecretKey(role) {
    switch (role) {
        case "Admin":
            return process.env.JWT_SECRET_KEY_ADMIN;
        case "Staff":
            return process.env.JWT_SECRET_KEY_STAFF;
        default:
            return process.env.JWT_SECRET_KEY_CUSTOMER;
    }
}

async function createRecord(req, res) {
    try {
        const { name, email, phoneNo, password, role } = req.body;
        const userRole = ALLOWED_ROLES.includes(role) ? role : "Customer";

        if (!name) {
            return res.status(400).send({
                result: "Fail",
                reason: { name: "Name is mandatory" }
            });
        }

        // ------------------------------------
        // CUSTOMER FLOW
        // ------------------------------------
        if (userRole === "Customer") {
            if (!phoneNo) {
                return res.status(400).send({
                    result: "Fail",
                    reason: { phoneNo: "Phone number is mandatory" }
                });
            }

            if (!email) {
                return res.status(400).send({
                    result: "Fail",
                    reason: { email: "Email is mandatory" }
                });
            }

            const user = new User({ name, email, phoneNo, role: "Customer" });
            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.otp;
            delete userResponse.otpExpiresAt;

            return res.status(201).send({
                result: "Done",
                message: "Customer created successfully",
                data: userResponse
            });
        }

        // ------------------------------------
        // ADMIN / STAFF FLOW
        // ------------------------------------
        if (userRole === "Admin" || userRole === "Staff") {
            if (!email) {
                return res.status(400).send({
                    result: "Fail",
                    reason: { email: "Email is mandatory" }
                });
            }

            if (!password) {
                return res.status(400).send({
                    result: "Fail",
                    reason: { password: "Password is mandatory" }
                });
            }

            const validationErrors = schema.validate(password, { list: true });

            if (validationErrors.length > 0) {
                const messages = {
                    min: "Password must be at least 8 characters long.",
                    max: "Password must not exceed 100 characters.",
                    uppercase: "Password must contain at least one uppercase letter.",
                    lowercase: "Password must contain at least one lowercase letter.",
                    digits: "Password must contain at least one digit.",
                    symbols: "Password must contain at least one special character.",
                    spaces: "Password should not contain spaces.",
                    oneOf: "This password is too common. Please choose another one."
                };

                return res.status(400).send({
                    result: "Fail",
                    reason: {
                        password: validationErrors.map((e) => messages[e] || "Invalid password.")
                    }
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({
                name,
                email,
                phoneNo,
                password: hashedPassword,
                role: userRole
            });

            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.otp;
            delete userResponse.otpExpiresAt;

            return res.status(201).send({
                result: "Done",
                message: `${userRole} created successfully`,
                data: userResponse
            });
        }

    } catch (error) {
        console.error("Create User Error:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            return res.status(409).send({
                result: "Fail",
                reason: { [field]: `${field} already exists` }
            });
        }

        return res.status(500).send({
            result: "Fail",
            reason: "Something went wrong, please try again"
        });
    }
}

async function getRecord(req, res) {
    try {
        const data = await User.find()
            .populate("addresses")
            .populate("defaultAddress");

        return res.send({
            result: "Done",
            count: data.length,
            data
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function getSingleRecord(req, res) {
    try {
        const data = await User.findById(req.params._id)
            .populate("addresses")
            .populate("defaultAddress");

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "User Not Found"
            });
        }
        return res.send({
            result: "Done",
            data
        });

    } catch (error) {
        console.error("Get Single User Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function UpdateRecord(req, res) {
    try {
        const data = await User.findById(req.params._id);
        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        if (req.body.name !== undefined) data.name = req.body.name;
        if (req.body.email !== undefined) data.email = req.body.email;
        if (req.body.phoneNo !== undefined) data.phoneNo = req.body.phoneNo;
        if (req.body.active !== undefined) data.active = req.body.active;
        if (req.body.role !== undefined && ALLOWED_ROLES.includes(req.body.role)) data.role = req.body.role;

        await data.save();
        return res.send({
            result: "Done",
            message: "Record Updated Successfully",
            data
        });
    } catch (error) {
        console.error("Update User Error:", error);
        let errorMessage = {};

        if (error.keyValue?.email) {
            errorMessage.email = "User with this Email Address Already Exists";
        }
        if (error.keyValue?.phoneNo || error.keyValue?.phone) {
            errorMessage.phoneNo = "User with this Contact Number Already Exists";
        }
        if (error.errors?.name) {
            errorMessage.name = error.errors.name.message;
        }
        if (error.errors?.email) {
            errorMessage.email = error.errors.email.message;
        }
        if (error.errors?.phoneNo) {
            errorMessage.phoneNo = error.errors.phoneNo.message;
        }

        if (Object.keys(errorMessage).length > 0) {
            return res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function deleteRecord(req, res) {
    try {
        const data = await User.findById(req.params._id);
        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }
        await data.deleteOne();

        return res.send({
            result: "Done",
            message: "User Deleted Successfully",
            data: data
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function otpSend(req, res) {
    try {
        const phone = req.body.phone || req.body.phoneNo;
        const name = req.body.name;
        const email = req.body.email;

        if (!phone) {
            return res.status(400).json({
                result: "Fail",
                reason: "Phone Number Is Required"
            });
        }
        if (!/^\d{10}$/.test(String(phone).trim())) {
            return res.status(400).json({
                result: "Fail",
                reason: "Please Enter A Valid 10-Digit Phone Number"
            });
        }

        const cleanPhone = String(phone).trim();
        let data = await User.findOne({
            $or: [
                { phoneNo: Number(cleanPhone) },
                { phoneNo: cleanPhone }
            ]
        });

        // If signup information is passed, handle new customer registration
        if (name && email) {
            // Check if email already belongs to another user
            const existingEmailUser = await User.findOne({ email: email.trim() });
            if (existingEmailUser && String(existingEmailUser.phoneNo) !== cleanPhone) {
                return res.status(409).json({
                    result: "Fail",
                    reason: "Email is already registered with another phone number."
                });
            }

            if (!data) {
                data = new User({
                    name: name.trim(),
                    email: email.trim(),
                    phoneNo: cleanPhone,
                    role: "Customer"
                });
            } else {
                data.name = name.trim();
                data.email = email.trim();
            }
        } else {
            // Login flow requires an existing account
            if (!data) {
                return res.status(404).json({
                    result: "Fail",
                    reason: "No account found with this phone number. Please sign up."
                });
            }
        }

        if (data.active === false) {
            return res.status(403).json({
                result: "Fail",
                reason: "Your Account Is Inactive"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        data.otp = otp;
        data.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await data.save();

        console.log(`\n🔑 [OTP-DEBUG] Phone: +91${cleanPhone} | Verification Code: ${otp}\n`);

        if (client && process.env.TWILIO_PHONE_NUMBER) {
            try {
                await client.messages.create({
                    body: `Your ${process.env.SITE_NAME || "Tastora"} verification code is ${otp}. This code will expire in 5 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${cleanPhone}`
                });
            } catch (smsError) {
                console.warn("⚠️ SMS delivery note:", smsError.message);
            }
        }

        return res.status(200).json({
            result: "Done",
            message: "OTP Sent Successfully"
        });

    } catch (error) {
        console.error("OTP Send Error:", error);
        return res.status(500).json({
            result: "Fail",
            reason: error.message || "Internal Server Error"
        });
    }
}

async function validateOtp(req, res) {
    try {
        const phone = req.body.phone || req.body.phoneNo;
        const otp = req.body.otp;

        if (!phone || !otp) {
            return res.status(400).send({
                result: "Fail",
                reason: "Phone Number And OTP Are Required"
            });
        }

        const data = await User.findOne({
            $or: [
                { phoneNo: Number(phone) },
                { phoneNo: String(phone) }
            ]
        });

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "User Not Found"
            });
        }

        if (!data.otpExpiresAt || data.otpExpiresAt < new Date()) {
            data.otp = "";
            data.otpExpiresAt = null;
            await data.save();
            return res.status(400).send({
                result: "Fail",
                reason: "OTP Has Expired"
            });
        }

        if (!data.otp || String(data.otp) !== String(otp)) {
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid OTP"
            });
        }

        if (!data.active) {
            return res.status(403).send({
                result: "Fail",
                reason: "Your Account Is Inactive"
            });
        }

        data.otp = "";
        data.otpExpiresAt = null;
        await data.save();

        const key = getJwtSecretKey(data.role);
        if (!key) {
            console.error(`JWT secret missing for role: ${data.role}`);
            return res.status(500).send({
                result: "Fail",
                reason: "JWT Configuration Error"
            });
        }

        const token = jwt.sign(
            {
                data: {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    phoneNo: data.phoneNo,
                    role: data.role
                }
            },
            key,
            { expiresIn: "15d" }
        );

        data.islogin = true;
        await data.save();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 24 * 60 * 60 * 1000
        };
        res.cookie("token", token, cookieOptions);
        res.cookie("userid", data._id.toString(), cookieOptions);
        res.cookie("islogin", "true", { ...cookieOptions, httpOnly: false });

        const userResponse = data.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.otpExpiresAt;

        return res.send({
            result: "Done",
            message: "OTP Verified Successfully",
            token,
            userid: data._id,
            islogin: true,
            data: userResponse
        });

    } catch (error) {
        console.error("OTP Validation Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function sendemailOtp(req, res) {
    try {
        const username = req.body.username || req.body.email;
        if (!username) {
            return res.status(400).send({
                result: "Fail",
                reason: "Username or email is required"
            });
        }

        let data = await User.findOne({ email: username.trim() });
        if (data) {
            let otp = String(Math.floor(100000 + Math.random() * 900000));
            data.otp = otp;
            data.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await data.save();

            try {
                await mailer.sendMail({
                    from: process.env.EMAIL_USER || process.env.MAIL_SENDER || `no-reply@${process.env.SITE_NAME || "tastora.com"}`,
                    to: data.email,
                    subject: `Your OTP for Password Reset – Team ${process.env.SITE_NAME || "Tastora"}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                            <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                            <p>Hello <strong>${data.name}</strong>,</p>
                            <p>You have requested a password reset.</p>
                            <div style="text-align: center; font-size: 18px; font-weight: bold; padding: 10px; background-color: #f3f3f3; border-radius: 5px;">
                                Your OTP: <span style="color: #d32f2f; font-size: 22px;">${otp}</span>
                            </div>
                            <p style="color: #d32f2f; text-align: center; font-size: 14px;">Please do not share this OTP with anyone.</p>
                            <p>This OTP is valid for 10 minutes.</p>
                            <p>Regards,</p>
                            <p><strong>Team ${process.env.SITE_NAME || "Tastora"}</strong></p>
                        </div>
                    `
                });
            } catch (mailError) {
                console.error("Email send error:", mailError.message);
            }

            return res.send({
                result: "Done",
                message: "OTP Has Been Sent To Your Registered Email Address"
            });
        } else {
            return res.status(404).send({
                result: "Fail",
                reason: "User Not Found"
            });
        }
    } catch (error) {
        console.error("Send Email OTP Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function validateEmailOtp(req, res) {
    try {
        const username = req.body.username || req.body.email;
        const otp = req.body.otp;

        if (!username || !otp) {
            return res.status(400).send({
                result: "Fail",
                reason: "Email and OTP are required"
            });
        }

        let data = await User.findOne({ email: username.trim() });
        if (data) {
            if (data.otpExpiresAt && data.otpExpiresAt < new Date()) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "OTP Has Expired"
                });
            }

            if (String(data.otp) === String(otp)) {
                return res.send({
                    result: "Done",
                    message: "OTP Verified Successfully"
                });
            } else {
                return res.status(400).send({
                    result: "Fail",
                    reason: "Invalid OTP"
                });
            }
        } else {
            return res.status(401).send({
                result: "Fail",
                reason: "Unauthorized Activity"
            });
        }
    } catch (error) {
        console.error("Validate Email OTP Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                result: "Fail",
                reason: "Unauthorized: No user session found"
            });
        }

        const data = await User.findById(userId)
            .populate("addresses")
            .populate("defaultAddress");

        if (!data) {
            return res.status(404).json({
                result: "Fail",
                reason: "User not found"
            });
        }

        const userResponse = data.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.otpExpiresAt;

        return res.json({
            result: "Done",
            data: userResponse
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function logout(req, res) {
    try {
        const userId = req.user?._id || req.body?.userId || req.body?.userid || req.cookies?.userid;
        if (userId) {
            await User.findByIdAndUpdate(userId, { islogin: false });
        }

        res.clearCookie("token");
        res.clearCookie("userid");
        res.clearCookie("islogin");

        return res.send({
            result: "Done",
            message: "Logged out successfully",
            islogin: false
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

module.exports = {
    createRecord,
    getRecord,
    getSingleRecord,
    getMe,
    UpdateRecord,
    deleteRecord,
    login: login(User, {
        getSecretKey: (user) => getJwtSecretKey(user?.role)
    }),
    logout,
    forgetPassword1: forgetPassword1(User),
    forgetPassword2: forgetPassword2(User),
    forgetPassword3: forgetPassword3(User),
    checkEmail: checkEmail(User),
    checkPhone: checkPhone(User),
    otpSend,
    validateOtp,
    sendemailOtp,
    validateEmailOtp,
};
