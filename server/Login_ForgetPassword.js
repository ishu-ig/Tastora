const mailer = require("./mailer/index")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const schema = require("./Password")

/**
 * All functions below are FACTORIES: call them with the Mongoose
 * model you want to authenticate/reset/check against, and they return
 * the actual Express (req, res) handler.
 *
 *   const { login } = require("./Login_ForgetPassword")
 *   const User = require("../models/User")
 *   router.post("/login", login(User))
 *
 * This is what makes them reusable for User, Doctor, Nurse, Hospital,
 * Lab, etc. instead of being hardcoded to one collection.
 */

/**
 * @param {import("mongoose").Model} Model
 * @param {Object} [options]
 * @param {(doc: any) => string} [options.getSecretKey]
 *   Given the found document, return which JWT secret to sign with.
 *   Defaults to the original User behaviour (role-based Customer/Admin
 *   split). Models that don't have a `role` field (Doctor, Nurse,
 *   Hospital, Lab, ...) should pass their own, e.g.:
 *     login(Doctor, { getSecretKey: () => process.env.JWT_SECRET_KEY_ADMIN })
 */
function login(Model, options = {}) {
    const getSecretKey = options.getSecretKey
        ?? ((data) => {
            if (data.role === "customer") return process.env.JWT_SECRET_KEY_CUSTOMER;
            if (data.role === "staff")    return process.env.JWT_SECRET_KEY_STAFF;
            return process.env.JWT_SECRET_KEY_ADMIN; // admin, deliveryBoy, etc.
        })

    return async function (req, res) {
        try {
            const identifier = (req.body.email || req.body.phone || "").trim();
            if (!req.body || !identifier || typeof req.body.password !== "string") {
            return res.status(400).send({
                result: "Fail",
                reason: "Email and password are required"
            })
        }

        // Build query conditions: always match by email; only add phoneNo
        // when the identifier is purely numeric to avoid a Mongoose CastError
        // (phoneNo is stored as Number, so passing an email string crashes the query).
        const orConditions = [{ email: identifier }];
        if (/^\d+$/.test(identifier)) {
            orConditions.push({ phoneNo: Number(identifier) });
        }

        let data = await Model.findOne({ $or: orConditions }).select("+password")

        if (data) {
            if (await bcrypt.compare(req.body.password, data.password)) {
                let key = getSecretKey(data)

                if (!key) {
                    console.log(`Missing JWT secret for "${Model.modelName}" (role "${data.role}")`)
                    return res.status(500).send({
                        result: "Fail",
                        reason: "Internal Server Error"
                    })
                }

                // Update islogin flag without re-saving the full document
                // (avoids Mongoose re-validation on the password field)
                await Model.updateOne({ _id: data._id }, { islogin: true });

                // Build a clean response object — strip sensitive fields before
                // embedding in the JWT and sending back to the client
                const userResponse = data.toObject();
                delete userResponse.password;
                delete userResponse.otp;
                delete userResponse.otpExpiresAt;

                jwt.sign({ data: userResponse }, key, { expiresIn: "15d" }, (error, token) => {
                    if (error) {
                        console.log(error)
                        res.status(500).send({
                            result: "Fail",
                            reason: "Internal Server Error"
                        })
                    } else {
                        const cookieOptions = {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                            maxAge: 15 * 24 * 60 * 60 * 1000,
                            path: "/"
                        };
                        const publicCookieOptions = {
                            ...cookieOptions,
                            httpOnly: false
                        };
                        res.cookie("token", token, cookieOptions);
                        res.cookie("userid", data._id.toString(), publicCookieOptions);
                        res.cookie("islogin", "true", publicCookieOptions);
                        res.cookie("login", "true", publicCookieOptions);
                        res.cookie("role", (userResponse.role || "").toLowerCase(), publicCookieOptions);
                        res.cookie("name", encodeURIComponent(userResponse.name || ""), publicCookieOptions);

                        res.send({
                            result: "Done",
                            message: "Login Successful",
                            token: token,
                            userid: data._id,
                            islogin: true,
                            data: userResponse
                        })
                    }
                })
            } else {
                res.status(401).send({
                    result: "Fail",
                    reason: "Invalid Email or Password"
                })
            }
        } else {
            res.status(401).send({
                result: "Fail",
                reason: "Invalid Email or Password"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}
}

/** @param {import("mongoose").Model} Model */
function forgetPassword1(Model) {
    return async function (req, res) {
        try {
            const identifier = (req.body.email || req.body.phone || "").trim();
            if (!req.body || !identifier) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "Email is required"
                })
            }

            let data = await Model.findOne({
                $or: [
                    { email: identifier },
                    { phone: identifier }
                ]
            })
            if (data) {
                let otp = Number(Number(Math.random().toString().slice(2, 8).toString().padEnd(6, 1)))
                data.otp = otp
                await data.save()

                mailer.sendMail({
                    from: process.env.RESEND_FROM || process.env.MAIL_SENDER,
                    to: data.email,
                    subject: `Your OTP for Password Reset – Team ${process.env.SITE_NAME}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                            <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                            <p>Hello <strong>${data.name}</strong>,</p>
                            <p>You have requested a password reset.</p>
                            <div style="text-align: center; font-size: 18px; font-weight: bold; padding: 10px; background-color: #f3f3f3; border-radius: 5px;">
                                Your OTP: <span style="color: #d32f2f; font-size: 22px;">${data.otp}</span>
                            </div>
                            <p style="color: #d32f2f; text-align: center; font-size: 14px;">Please do not share this OTP with anyone.</p>
                            <p>This OTP is valid for a limited time.</p>
                            <p>Regards,</p>
                            <p><strong>Team ${process.env.SITE_NAME}</strong></p>
                        </div>
                    `
                }, (error) => {
                    if (error) {
                        console.log(error);
                    }
                });

                res.send({
                    result: "Done",
                    message: "OTP Has Been Send On Your Registered Email Address"
                })
            } else {
                res.status(404).send({
                    result: "Fail",
                    reason: "User Not Found"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
    }
}

/** @param {import("mongoose").Model} Model */
function forgetPassword2(Model) {
    return async function (req, res) {
        try {
            const identifier = (req.body.email || req.body.phone || "").trim();
            if (!req.body || !identifier) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "Email is required"
                })
            }

            let data = await Model.findOne({
                $or: [
                    { email: identifier },
                    { phone: identifier }
                ]
            })
            if (data) {
                if (data.otp === req.body.otp) {
                    res.send({
                        result: "Done"
                    })
                } else {
                    res.status(400).send({
                        result: "Fail",
                        reason: "Invalid OTP"
                    })
                }
            } else {
                res.status(401).send({
                    result: "Fail",
                    reason: "UnAuthorized Activity"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
    }
}

/** @param {import("mongoose").Model} Model */
function forgetPassword3(Model) {
    return async function (req, res) {
        try {
            const identifier = (req.body.email || req.body.phone || "").trim();
            if (!req.body || !identifier || typeof req.body.password !== "string") {
                return res.status(400).send({
                    result: "Fail",
                    reason: "Email and new password are required"
                })
            }

            let data = await Model.findOne({
                $or: [
                    { email: identifier },
                    { phone: identifier }
                ]
            });

            if (!data) {
                return res.status(401).send({
                    result: "Fail",
                    reason: "Unauthorized Activity"
                });
            }

            const validationErrors = schema.validate(req.body.password, { list: true });

            if (validationErrors.length > 0) {
                const errorMessages = validationErrors.map(error => {
                    switch (error) {
                        case 'min': return "Password must be at least 8 characters long.";
                        case 'max': return "Password must not exceed 100 characters.";
                        case 'uppercase': return "Password must contain at least one uppercase letter.";
                        case 'lowercase': return "Password must contain at least one lowercase letter.";
                        case 'digits': return "Password must contain at least one digit.";
                        case 'symbols': return "Password must contain at least one special character.";
                        case 'spaces': return "Password should not contain spaces.";
                        case 'oneOf': return "This password is too common. Please choose another one.";
                        default: return "Invalid password.";
                    }
                });

                return res.status(400).send({
                    result: "Fail",
                    reason: errorMessages
                });
            }

            const hash = await bcrypt.hash(req.body.password, 12);
            data.password = hash;
            await data.save();
            res.send({
                result: "Done",
                reason: "Password has been successfully reset"
            });

        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            });
        }
    }
}

/**
 * @param {import("mongoose").Model} Model
 * Returns an Express handler for GET /check-email?email=xyz against
 * whichever model it's given (User, Doctor, Nurse, Lab, ...).
 */
function checkEmail(Model) {
    return async function (req, res) {
        try {
            const raw = req.query.email
            const role = req.query.role // or however role is passed/derived
            const email = typeof raw === "string" ? raw.trim().toLowerCase() : ""

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "A valid email is required"
                })
            }

            const existing = await Model.findOne({ email, role }).select("_id")

            res.send({
                result: "Done",
                available: !existing
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
    }
}

/**
 * @param {import("mongoose").Model} Model
 * Returns an Express handler for GET /check-email?email=xyz against
 * whichever model it's given (User, Doctor, Nurse, Lab, ...).
 */
function checkPhone(Model) {
    return async function (req, res) {
        try {
            // The User model stores the phone number in `phoneNo`, so we accept
            // both `phone` and `phoneNo` query params for backward compatibility.
            const raw = req.query.phoneNo || req.query.phone
            const role = req.query.role
            const phone = typeof raw === "string" ? raw.trim() : ""

            if (!phone || !/^[0-9]{10}$/.test(phone)) {
                return res.status(400).send({
                    result: "Fail",
                    reason: "A valid phone number is required"
                })
            }

            // Same phone is allowed if the role differs — uniqueness is per {phoneNo, role}
            const existing = await Model.findOne({ phoneNo: phone, role }).select("_id")

            res.send({
                result: "Done",
                available: !existing
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
    }
}

module.exports = {
    login: login,
    forgetPassword1: forgetPassword1,
    forgetPassword2: forgetPassword2,
    forgetPassword3: forgetPassword3,
    checkEmail: checkEmail,
    checkPhone: checkPhone,
}