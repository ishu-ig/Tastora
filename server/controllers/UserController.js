const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const Membership = require("../models/Membership");
const mailer = require("../mailer/index");
const schema = require("../Password");
const {
    checkPhone,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    checkEmail,
    login
} = require("../Login_ForgetPassword");

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

// Must match User schema enum exactly (case-sensitive)
const ALLOWED_ROLES = ["admin", "customer", "staff", "deliveryBoy"];
const PASSWORD_ROLES = ["admin", "staff", "deliveryBoy"];
const OTP_LOGIN_ROLES = ["customer", "deliveryBoy"]; // roles allowed to log in by phone OTP

const PHONE_OTP_TTL = 5 * 60 * 1000;
const EMAIL_OTP_TTL = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MESSAGES = {
    min: "Password must be at least 8 characters long.",
    max: "Password must not exceed 100 characters.",
    uppercase: "Password must contain at least one uppercase letter.",
    lowercase: "Password must contain at least one lowercase letter.",
    digits: "Password must contain at least one digit.",
    symbols: "Password must contain at least one special character.",
    spaces: "Password should not contain spaces.",
    oneOf: "This password is too common. Please choose another one."
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getJwtSecretKey(role) {
    switch (role) {
        case "admin":
            return process.env.JWT_SECRET_KEY_ADMIN;
        case "staff":
            return process.env.JWT_SECRET_KEY_STAFF;
        case "deliveryBoy":
            return process.env.JWT_SECRET_KEY_DELIVERYBOY || process.env.JWT_SECRET_KEY_DELIVERY;
        default:
            return process.env.JWT_SECRET_KEY_CUSTOMER;
    }
}

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

function safeEqual(a, b) {
    const A = Buffer.from(String(a));
    const B = Buffer.from(String(b));
    return A.length === B.length && crypto.timingSafeEqual(A, B);
}

const normEmail = (e) => String(e).trim().toLowerCase();
const toBool = (v) => v === true || v === 1 || v === "1" || v === "true";

function toNum(v) {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

// Auth helpers (expect your auth middleware to set req.user = { _id, role })
const isAdmin = (req) => req.user?.role === "admin";
const isStaffOrAdmin = (req) => ["admin", "staff"].includes(req.user?.role);
const isSelf = (req, id) => {
    const callerId = req.user?._id || req.headers?.["x-user-id"] || req.cookies?.userid;
    return callerId && String(callerId) === String(id);
};

function deny(req, res) {
    return res.status(req.user ? 403 : 401).send({
        result: "Fail",
        reason: req.user ? "Forbidden" : "Unauthorized"
    });
}

function passwordErrors(password) {
    const errs = schema.validate(password, { list: true });
    return errs.length ? errs.map((e) => PASSWORD_MESSAGES[e] || "Invalid password.") : null;
}

function handleWriteError(error, res, label) {
    console.error(`${label}:`, error);

    if (error.code === 11000) {
        // keyPattern looks like { email: 1, role: 1 } or { phoneNo: 1, role: 1 }
        const keys = Object.keys(error.keyPattern || {});
        const reason = {};
        if (keys.includes("email")) {
            reason.email = "An account with this email already exists for this role.";
        } else if (keys.includes("phoneNo")) {
            reason.phoneNo = "An account with this phone number already exists for this role.";
        } else {
            reason[keys[0] || "field"] = "Duplicate value.";
        }
        return res.status(409).send({ result: "Fail", reason });
    }

    if (error.name === "ValidationError") {
        const reason = {};
        for (const [field, err] of Object.entries(error.errors)) {
            reason[field] = err.message;
        }
        return res.status(400).send({ result: "Fail", reason });
    }

    return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
}

function cooldownLeft(user) {
    if (!user.otpLastSentAt) return 0;
    const left = OTP_RESEND_COOLDOWN - (Date.now() - new Date(user.otpLastSentAt).getTime());
    return left > 0 ? Math.ceil(left / 1000) : 0;
}

function clearOtp(user) {
    user.otp = "";
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
}

function setAuthCookies(res, token, user) {
    const isProd = process.env.NODE_ENV === "production";
    const base = {
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000,
        path: "/"
    };
    // Only the token is httpOnly. The others are UI hints - never trust them on the server.
    res.cookie("token", token, { ...base, httpOnly: true });
    const pub = { ...base, httpOnly: false };
    res.cookie("userid", user._id.toString(), pub);
    res.cookie("islogin", "true", pub);
    res.cookie("login", "true", pub);
    res.cookie("role", (user.role || "").toLowerCase(), pub);
    res.cookie("name", encodeURIComponent(user.name || ""), pub);
}

// ------------------------------------------------------------------
// CRUD
// ------------------------------------------------------------------

async function createRecord(req, res) {
    try {
        const { name, email, phoneNo, password, role } = req.body;

        // Only a logged-in admin may create non-customer accounts.
        const userRole = isAdmin(req) && ALLOWED_ROLES.includes(role) ? role : "customer";

        const errors = {};

        if (!name || !String(name).trim()) {
            errors.name = "Name is mandatory";
        }

        if (!email) {
            errors.email = "Email is mandatory";
        } else if (!EMAIL_REGEX.test(normEmail(email))) {
            errors.email = "Please enter a valid email address";
        }

        if (userRole === "customer") {
            if (!phoneNo) {
                errors.phoneNo = "Phone number is mandatory";
            } else if (!PHONE_REGEX.test(String(phoneNo).trim())) {
                errors.phoneNo = "Phone number must be exactly 10 digits";
            }
        } else {
            if (phoneNo && !PHONE_REGEX.test(String(phoneNo).trim())) {
                errors.phoneNo = "Phone number must be exactly 10 digits";
            }
            if (!password) {
                errors.password = "Password is mandatory";
            } else {
                const pwErrors = passwordErrors(password);
                if (pwErrors) errors.password = pwErrors;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).send({ result: "Fail", reason: errors });
        }

        const doc = {
            name: String(name).trim(),
            email: normEmail(email),
            role: userRole
        };
        if (phoneNo) doc.phoneNo = Number(String(phoneNo).trim());
        if (userRole !== "customer") doc.password = await bcrypt.hash(password, 12);

        const user = await User.create(doc);

        return res.status(201).send({
            result: "Done",
            message: `${userRole} created successfully`,
            data: user.toObject() // sensitive fields stripped by schema transform
        });
    } catch (error) {
        return handleWriteError(error, res, "Create User Error");
    }
}

async function getRecord(req, res) {
    try {
        if (!isStaffOrAdmin(req)) return deny(req, res);

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

        const filter = {};
        if (ALLOWED_ROLES.includes(req.query.role)) filter.role = req.query.role;

        const [data, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("addresses")
                .populate("defaultAddress"),
            User.countDocuments(filter)
        ]);

        return res.send({
            result: "Done",
            count: data.length,
            total,
            page,
            data
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function getSingleRecord(req, res) {
    try {
        const { _id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send({ result: "Fail", reason: "Invalid user id" });
        }
        if (!(isStaffOrAdmin(req) || isSelf(req, _id))) return deny(req, res);

        const data = await User.findById(_id)
            .populate("addresses")
            .populate("defaultAddress");

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "User Not Found" });
        }

        const activeMembership = await Membership.findOne({
            user: data._id,
            status: "active",
            endDate: { $gt: new Date() }
        }).populate("plan");

        const userObj = data.toObject();
        userObj.phone = userObj.phoneNo != null ? String(userObj.phoneNo) : "";
        userObj.activeMembership = activeMembership || null;
        userObj.membership = activeMembership || null;
        userObj.ismembership = Boolean(activeMembership);

        return res.send({ result: "Done", data: userObj });
    } catch (error) {
        console.error("Get Single User Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function UpdateRecord(req, res) {
    try {
        const { _id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send({ result: "Fail", reason: "Invalid user id" });
        }

        const admin = isAdmin(req);
        if (!(admin || isSelf(req, _id))) return deny(req, res);

        const data = await User.findById(_id);
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        const b = req.body;

        // ---------- Fields a user may edit on their own profile ----------
        if (b.name !== undefined) {
            const n = String(b.name).trim();
            if (!n) {
                return res.status(400).send({ result: "Fail", reason: { name: "Name is mandatory" } });
            }
            data.name = n;
        }

        if (b.email !== undefined) {
            const e = normEmail(b.email);
            if (!EMAIL_REGEX.test(e)) {
                return res.status(400).send({ result: "Fail", reason: { email: "Please enter a valid email address" } });
            }
            data.email = e;
        }

        const phone = b.phoneNo !== undefined ? b.phoneNo : b.phone;
        if (phone !== undefined && phone !== "") {
            const p = String(phone).trim();
            if (!PHONE_REGEX.test(p)) {
                return res.status(400).send({ result: "Fail", reason: { phoneNo: "Phone number must be exactly 10 digits" } });
            }
            data.phoneNo = Number(p);
        }

        if (req.file) {
            data.pic = req.file.path;
        }

        if (b.permanentLocation) {
            let loc = b.permanentLocation;
            if (typeof loc === "string") {
                try { loc = JSON.parse(loc); } catch (e) { loc = null; }
            }
            if (loc && typeof loc === "object") {
                const cur = data.permanentLocation || {};
                data.permanentLocation = {
                    lat: loc.lat != null ? Number(loc.lat) : (cur.lat ?? null),
                    lng: loc.lng != null ? Number(loc.lng) : (cur.lng ?? null),
                    address: loc.address !== undefined ? loc.address : (cur.address || ""),
                    city: loc.city !== undefined ? loc.city : (cur.city || ""),
                    state: loc.state !== undefined ? loc.state : (cur.state || ""),
                    pin: loc.pin !== undefined ? String(loc.pin) : (cur.pin || "")
                };
            }
        }

        // ---------- Admin-only fields ----------
        if (admin) {
            if (b.active !== undefined) data.active = toBool(b.active);
            if (b.isreservation !== undefined) data.isreservation = toBool(b.isreservation);

            for (const field of ["reservationPrice", "discount", "finalPrice", "seatAvailable"]) {
                if (b[field] !== undefined) {
                    const n = toNum(b[field]);
                    if (n !== undefined) data[field] = n;
                }
            }

            // Accepts the old/misspelled names too; schema field is "cridetCoin"
            const coins = toNum(b.cridetCoin ?? b.creditCoin ?? b.creditCoins);
            if (coins !== undefined) data.cridetCoin = coins;

            if (b.openTime !== undefined) data.openTime = b.openTime;
            if (b.closeTime !== undefined) data.closeTime = b.closeTime;

            if (b.role !== undefined && ALLOWED_ROLES.includes(b.role)) {
                if (isSelf(req, _id) && b.role !== data.role) {
                    return res.status(400).send({
                        result: "Fail",
                        reason: { role: "You cannot change your own role" }
                    });
                }
                data.role = b.role;
            }
        }

        await data.save();

        const userResponse = data.toObject();
        userResponse.phone = userResponse.phoneNo != null ? String(userResponse.phoneNo) : "";

        return res.send({
            result: "Done",
            message: "Record Updated Successfully",
            data: userResponse
        });
    } catch (error) {
        return handleWriteError(error, res, "Update User Error");
    }
}

async function deleteRecord(req, res) {
    try {
        if (!isAdmin(req)) return deny(req, res);

        const { _id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send({ result: "Fail", reason: "Invalid user id" });
        }

        const data = await User.findById(_id);
        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }
        await data.deleteOne();

        return res.send({
            result: "Done",
            message: "User Deleted Successfully",
            data
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ------------------------------------------------------------------
// Phone OTP login / signup
// ------------------------------------------------------------------

async function otpSend(req, res) {
    try {
        const phone = String(req.body.phone ?? req.body.phoneNo ?? "").trim();
        const name = req.body.name ? String(req.body.name).trim() : "";
        const email = req.body.email ? String(req.body.email).trim() : "";
        const otpRole = OTP_LOGIN_ROLES.includes(req.body.role) ? req.body.role : "customer";

        if (!phone) {
            return res.status(400).json({ result: "Fail", reason: "Phone Number Is Required" });
        }
        if (!PHONE_REGEX.test(phone)) {
            return res.status(400).json({ result: "Fail", reason: "Please Enter A Valid 10-Digit Phone Number" });
        }

        let user = await User.findOne({ phoneNo: Number(phone), role: otpRole });

        if (!user) {
            // Signup: only customers can self-register, and name + email are required.
            if (otpRole !== "customer" || !name || !email) {
                return res.status(404).json({
                    result: "Fail",
                    reason: "No account found with this phone number. Please sign up."
                });
            }
            if (!EMAIL_REGEX.test(normEmail(email))) {
                return res.status(400).json({ result: "Fail", reason: "Please enter a valid email address" });
            }
            const emailTaken = await User.exists({ email: normEmail(email), role: "customer" });
            if (emailTaken) {
                return res.status(409).json({
                    result: "Fail",
                    reason: "Email is already registered with another phone number."
                });
            }

            user = new User({
                name,
                email: normEmail(email),
                phoneNo: Number(phone),
                role: "customer"
            });
        }
        // NOTE: for an existing user, any name/email in the request is ignored,
        // so nobody can change someone else's profile before verifying the OTP.

        if (user.active === false) {
            return res.status(403).json({ result: "Fail", reason: "Your Account Is Inactive" });
        }

        const wait = cooldownLeft(user);
        if (wait > 0) {
            return res.status(429).json({
                result: "Fail",
                reason: `Please wait ${wait}s before requesting another OTP`
            });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + PHONE_OTP_TTL);
        user.otpAttempts = 0;
        user.otpLastSentAt = new Date();
        await user.save();

        const isProd = process.env.NODE_ENV === "production";
        // Always log OTP in non-production for easy testing without Twilio
        if (!isProd) {
            console.log(`\n========================================`);
            console.log(`[OTP-DEBUG] Phone: +91${phone}`);
            console.log(`[OTP-DEBUG] Code:  ${otp}`);
            console.log(`========================================\n`);
        }

        let smsSent = false;
        if (client && process.env.TWILIO_PHONE_NUMBER) {
            try {
                await client.messages.create({
                    body: `Your ${process.env.SITE_NAME || "Tastora"} verification code is ${otp}. This code will expire in 5 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${phone}`
                });
                smsSent = true;
            } catch (smsError) {
                console.error("SMS delivery failed:", smsError.message);
                if (isProd) {
                    // In production, SMS failure is fatal
                    return res.status(502).json({
                        result: "Fail",
                        reason: "Could not send the OTP right now. Please try again."
                    });
                }
                // In dev/staging: SMS failed but OTP is logged — proceed gracefully
            }
        } else if (isProd) {
            console.error("Twilio is not configured in production");
            return res.status(500).json({ result: "Fail", reason: "SMS service is not available" });
        }

        const responsePayload = { result: "Done", message: "OTP Sent Successfully", smsSent };
        // In non-production, include OTP in response so UI can display it as a hint
        if (!isProd) {
            responsePayload.devOtp = otp;
            responsePayload.devNote = "OTP is shown for development only. Remove in production.";
        }
        return res.status(200).json(responsePayload);
    } catch (error) {
        return handleWriteError(error, res, "OTP Send Error");
    }
}

async function validateOtp(req, res) {
    try {
        const phone = String(req.body.phone ?? req.body.phoneNo ?? "").trim();
        const otp = String(req.body.otp ?? "").trim();
        const otpRole = OTP_LOGIN_ROLES.includes(req.body.role) ? req.body.role : "customer";

        if (!phone || !otp) {
            return res.status(400).send({ result: "Fail", reason: "Phone Number And OTP Are Required" });
        }
        if (!PHONE_REGEX.test(phone)) {
            return res.status(400).send({ result: "Fail", reason: "Please Enter A Valid 10-Digit Phone Number" });
        }

        const user = await User.findOne({ phoneNo: Number(phone), role: otpRole });
        if (!user) {
            return res.status(404).send({ result: "Fail", reason: "User Not Found" });
        }

        if (user.active === false) {
            return res.status(403).send({ result: "Fail", reason: "Your Account Is Inactive" });
        }

        if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            clearOtp(user);
            await user.save();
            return res.status(400).send({ result: "Fail", reason: "OTP Has Expired" });
        }

        if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
            clearOtp(user);
            await user.save();
            return res.status(429).send({
                result: "Fail",
                reason: "Too many wrong attempts. Please request a new OTP."
            });
        }

        if (!safeEqual(user.otp, otp)) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            await user.save();
            return res.status(400).send({ result: "Fail", reason: "Invalid OTP" });
        }

        const key = getJwtSecretKey(user.role);
        if (!key) {
            console.error(`JWT secret missing for role: ${user.role}`);
            return res.status(500).send({ result: "Fail", reason: "JWT Configuration Error" });
        }

        clearOtp(user);
        user.islogin = true;
        await user.save();

        const token = jwt.sign(
            {
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phoneNo,
                    role: user.role
                }
            },
            key,
            { expiresIn: "15d" }
        );

        setAuthCookies(res, token, user);

        return res.send({
            result: "Done",
            message: "OTP Verified Successfully",
            token,
            userid: user._id,
            islogin: true,
            data: user.toObject()
        });
    } catch (error) {
        console.error("OTP Validation Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ------------------------------------------------------------------
// Email OTP (password reset for admin / staff / deliveryBoy)
// ------------------------------------------------------------------

function emailRoleFilter(req) {
    return PASSWORD_ROLES.includes(req.body.role) ? req.body.role : { $in: PASSWORD_ROLES };
}

async function sendemailOtp(req, res) {
    try {
        if (!req.body.email) {
            return res.status(400).send({ result: "Fail", reason: "Email is required" });
        }
        const email = normEmail(req.body.email);

        const user = await User.findOne({ email, role: emailRoleFilter(req) });
        if (!user) {
            return res.status(404).send({ result: "Fail", reason: "User Not Found" });
        }

        const wait = cooldownLeft(user);
        if (wait > 0) {
            return res.status(429).send({
                result: "Fail",
                reason: `Please wait ${wait}s before requesting another OTP`
            });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + EMAIL_OTP_TTL);
        user.otpAttempts = 0;
        user.otpLastSentAt = new Date();
        await user.save();

        const site = escapeHtml(process.env.SITE_NAME || "Tastora");

        try {
            await mailer.sendMail({
                from: process.env.EMAIL_USER || process.env.MAIL_SENDER || `no-reply@${process.env.SITE_NAME || "tastora.com"}`,
                to: user.email,
                subject: `Your OTP for Password Reset – Team ${process.env.SITE_NAME || "Tastora"}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                        <p>Hello <strong>${escapeHtml(user.name)}</strong>,</p>
                        <p>You have requested a password reset.</p>
                        <div style="text-align: center; font-size: 18px; font-weight: bold; padding: 10px; background-color: #f3f3f3; border-radius: 5px;">
                            Your OTP: <span style="color: #d32f2f; font-size: 22px;">${otp}</span>
                        </div>
                        <p style="color: #d32f2f; text-align: center; font-size: 14px;">Please do not share this OTP with anyone.</p>
                        <p>This OTP is valid for 10 minutes.</p>
                        <p>Regards,</p>
                        <p><strong>Team ${site}</strong></p>
                    </div>
                `
            });
        } catch (mailError) {
            console.error("Email send error:", mailError.message);
            return res.status(502).send({
                result: "Fail",
                reason: "Could not send the email right now. Please try again."
            });
        }

        return res.send({
            result: "Done",
            message: "OTP Has Been Sent To Your Registered Email Address"
        });
    } catch (error) {
        console.error("Send Email OTP Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function validateEmailOtp(req, res) {
    try {
        const otp = String(req.body.otp ?? "").trim();
        if (!req.body.email || !otp) {
            return res.status(400).send({ result: "Fail", reason: "Email and OTP are required" });
        }
        const email = normEmail(req.body.email);

        const user = await User.findOne({ email, role: emailRoleFilter(req) });
        if (!user) {
            return res.status(401).send({ result: "Fail", reason: "Unauthorized Activity" });
        }

        if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).send({ result: "Fail", reason: "OTP Has Expired" });
        }

        if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
            clearOtp(user);
            await user.save();
            return res.status(429).send({
                result: "Fail",
                reason: "Too many wrong attempts. Please request a new OTP."
            });
        }

        if (!safeEqual(user.otp, otp)) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            await user.save();
            return res.status(400).send({ result: "Fail", reason: "Invalid OTP" });
        }

        // The OTP is intentionally NOT cleared here because forgetPassword2/3
        // may still need it. Call clearOtp() once the password is actually changed.
        return res.send({ result: "Done", message: "OTP Verified Successfully" });
    } catch (error) {
        console.error("Validate Email OTP Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ------------------------------------------------------------------
// Session
// ------------------------------------------------------------------

async function getMe(req, res) {
    try {
        const userId = req.user?._id || req.headers?.["x-user-id"] || req.cookies?.userid;
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
            return res.status(404).json({ result: "Fail", reason: "User not found" });
        }

        const activeMembership = await Membership.findOne({
            user: data._id,
            status: "active",
            endDate: { $gt: new Date() }
        }).populate("plan");

        const userObj = data.toObject();
        userObj.phone = userObj.phoneNo != null ? String(userObj.phoneNo) : "";
        userObj.activeMembership = activeMembership || null;
        userObj.membership = activeMembership || null;
        userObj.ismembership = Boolean(activeMembership);

        return res.json({ result: "Done", data: userObj });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function logout(req, res) {
    try {
        let userId = req.user?._id;
        if (!userId) {
            const rawToken = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.headers.token;
            if (rawToken) {
                try {
                    const decoded = jwt.decode(rawToken);
                    userId = decoded?.data?._id;
                } catch (_) {}
            }
        }
        if (userId) {
            await User.findByIdAndUpdate(userId, { islogin: false });
        }

        const isProd = process.env.NODE_ENV === "production";
        const clearOptions = {
            path: "/",
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        };
        ["token", "userid", "islogin", "login", "role", "name"].forEach((c) =>
            res.clearCookie(c, clearOptions)
        );

        return res.send({
            result: "Done",
            message: "Logged out successfully",
            islogin: false
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
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