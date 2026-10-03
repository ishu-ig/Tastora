const mongoose = require("mongoose")
const Checkout = require("../models/Checkout")
const User = require("../models/User")
const Membership = require("../models/Membership")
const Product = require("../models/Product")
const Thali = require("../models/Thali")
const Combo = require("../models/Combo")
const DeliveryBoy = require("../models/DeliveryBoy")
const { applyCoupon } = require("./CouponController")
require("../models/Restaurant")
require("../models/Maincategory")
const Razorpay = require("razorpay")
const mailer = require("../mailer/index")

// ── Credit Coins award helper ────────────────────────────────────────────────
// Awards Credit Coins to a user after a confirmed paid order.
// Formula: coins = floor(subtotal × 10%)
// Idempotency: checks creditCoinsAwarded flag — will never award twice.
// Non-fatal: any error is logged but does NOT roll back the order.
async function awardCreditCoins(checkoutId) {
    try {
        // Re-fetch with lean for minimal overhead
        const order = await Checkout.findById(checkoutId)
            .select("user subtotal creditCoinsEarned creditCoinsAwarded")
            .lean();

        if (!order) return null;
        if (order.creditCoinsAwarded) return null; // idempotency guard
        let multiplier = 1;
        try {
            const activeMem = await Membership.findOne({
                user: order.user,
                status: "active",
                endDate: { $gt: new Date() }
            });
            if (activeMem) multiplier = 2; // VIP 2x coins bonus
        } catch { }

        const coinsToAward = Math.floor((Number(order.subtotal) || 0) * 0.10 * multiplier);
        if (coinsToAward <= 0) return null;

        // Credit coins atomically using $inc
        const updatedUser = await User.findByIdAndUpdate(
            order.user,
            { $inc: { cridetCoin: coinsToAward } },
            { returnDocument: "after" }
        );

        // Mark as awarded and record how many coins were given
        await Checkout.findByIdAndUpdate(checkoutId, {
            creditCoinsEarned: coinsToAward,
            creditCoinsAwarded: true
        });

        console.log(`[CreditCoins] Awarded ${coinsToAward} coins to user ${order.user} for order ${checkoutId}. New balance: ${updatedUser?.cridetCoin}`);
        return { coinsAwarded: coinsToAward, newBalance: updatedUser?.cridetCoin };
    } catch (err) {
        console.error(`[CreditCoins] Failed to award coins for order ${checkoutId}:`, err.message);
        return null;
    }
}

const RESTURENT_FIELDS = "name pic permanentLocation phone"

const USER_POPULATE = {
    path: "user",
    select: "name username email phone defaultAddress",
    populate: { path: "defaultAddress", select: "address city state pin" }
}

async function attachProductNames(products = []) {
    return Promise.all(products.map(async (line) => {
        const item = line?.toObject ? line.toObject() : { ...line }
        const productId = item.product?._id || item.product
        const submittedName =
            item.productName ||
            item.name ||
            item.title ||
            (typeof item.product === "object" ? item.product?.name : "")
        const submittedImage =
            item.image ||
            item.pic ||
            (typeof item.product === "object" ? item.product?.pic || item.product?.image : "")

        if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            try {
                let catalogItem = await Product.findById(productId).select("name pic").lean()
                if (!catalogItem) catalogItem = await Thali.findById(productId).select("name image").lean()
                if (!catalogItem) catalogItem = await Combo.findById(productId).select("name image").lean()
                if (catalogItem?.name) item.productName = catalogItem.name
                if (catalogItem?.pic || catalogItem?.image) item.image = catalogItem.pic || catalogItem.image
            } catch (error) {
                console.warn("Could not resolve checkout product name:", error.message)
            }
        }

        if (!item.productName && typeof submittedName === "string") {
            item.productName = submittedName.trim()
        }
        if (!item.image && typeof submittedImage === "string") {
            item.image = submittedImage.trim()
        }
        return item
    }))
}

//Payment API
async function order(req, res) {
    try {
        const instance = new Razorpay({
            key_id: process.env.RPKEYID,
            key_secret: process.env.RPSECRETKEY,
        });

        const options = {
            amount: req.body.amount * 100,
            currency: "INR"
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.json({ data: order });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
}

// In verifyOrder — after Razorpay payment success, confirm order and award Credit Coins
async function verifyOrder(req, res) {
    try {
        var check = await Checkout.findOne({ _id: req.body.checkid })
        if (!check) {
            return res.status(404).json({ message: "Order not found!" });
        }

        // Verify Razorpay signature first
        const crypto = require("crypto");
        const generated_signature = crypto
            .createHmac("sha256", process.env.RPSECRETKEY)
            .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== req.body.razorpay_signature) {
            // ❌ Payment failed — delete the pending order
            await Checkout.findByIdAndDelete(req.body.checkid);
            return res.status(400).json({ result: "Fail", message: "Payment verification failed! Order cancelled." });
        }

        // ✅ Payment success — confirm the order
        check.rppid = req.body.razorpay_payment_id;
        check.paymentStatus = "Done";
        check.paymentMode = "Net Banking";
        check.orderStatus = "Order is Placed";
        await check.save();

        // ── Award Credit Coins for successful online payment ──────────────────
        let awardResult = null;
        try {
            awardResult = await awardCreditCoins(check._id);
        } catch (e) {
            console.error("verifyOrder awardCreditCoins error:", e);
        }

        let currentCreditCoins = null;
        if (check.user) {
            const u = await User.findById(check.user).select("cridetCoin").lean();
            currentCreditCoins = u?.cridetCoin ?? null;
        }

        res.send({
            result: "Done",
            message: "Payment Successful",
            creditCoinsEarned: awardResult?.coinsAwarded ?? check.creditCoinsEarned ?? 0,
            creditCoinsBalance: currentCreditCoins
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

async function createRecord(req, res) {
    try {
        // If user is missing or invalid ObjectId, fallback to existing customer user
        let userId = req.body.user;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            const fallbackUser = await User.findOne({ role: "Customer" }) || await User.findOne({});
            if (fallbackUser) {
                userId = fallbackUser._id;
            }
        }
        if (userId) {
            req.body.user = userId;
        }

        let isVIP = false;
        // Apply active membership perks (e.g. Free Delivery & member discount)
        if (req.body.user) {
            try {
                const activeMem = await Membership.findOne({
                    user: req.body.user,
                    status: "active",
                    endDate: { $gt: new Date() }
                }).populate("plan");
                if (activeMem) {
                    isVIP = true;
                    req.body.deliveryCharge = 0;
                    if (activeMem.plan?.discountPercent && !req.body.memberDiscountApplied) {
                        const mDiscount = Math.round((Number(req.body.subtotal || 0) * activeMem.plan.discountPercent) / 100);
                        req.body.discount = (Number(req.body.discount) || 0) + mDiscount;
                    }
                }
            } catch (memErr) {
                console.warn("Membership check on checkout:", memErr.message);
            }
        }

        // If Net Banking, save with "Payment Pending" status initially
        const isNetBanking = req.body.paymentMode === "Net Banking";
        const expectedEarnedCoins = Math.floor((Number(req.body.subtotal) || 0) * 0.10 * (isVIP ? 2 : 1));
        const products = await attachProductNames(req.body.products);

        let data = new Checkout({
            ...req.body,
            products,
            creditCoinsEarned: expectedEarnedCoins,
            orderStatusUpdatedAt: new Date(),
            orderStatus: isNetBanking ? "Awaiting Payment" : (req.body.orderStatus || "Order is Placed"),
            paymentStatus: isNetBanking ? "Pending" : (req.body.paymentStatus || "Done"),
        });

        await data.save();

        // ── Enforce coupon usage limit per user (server-side) ─────────────────
        // The client already called /coupon/validate (read-only). Now we do the
        // actual atomic consumption — write CouponUsage + increment totalUsedCount.
        // This re-checks all constraints, so a user who opens two tabs
        // simultaneously cannot double-redeem the same single-use coupon.
        const couponCode = (req.body.coupon || "").trim().toUpperCase();
        if (couponCode && req.body.user) {
            try {
                const serverDiscount = await applyCoupon({
                    code: couponCode,
                    userId: req.body.user,
                    orderId: data._id,
                    orderValue: Number(req.body.subtotal) || 0,
                });
                // Replace the client-supplied discount with the authoritative
                // server-calculated value to prevent tampering.
                if (typeof serverDiscount === "number" && serverDiscount >= 0) {
                    const baseDiscount = serverDiscount;
                    const memberExtra = req.body.memberDiscountApplied ? (Number(req.body.memberDiscount) || 0) : 0;
                    data.discount = baseDiscount + memberExtra;
                    await data.save();
                }
            } catch (couponErr) {
                // Coupon consumption failed (already used, expired, limit hit…)
                // Roll back the freshly-created order so the user can correct the issue.
                await Checkout.findByIdAndDelete(data._id);
                return res.status(400).send({
                    result: "Fail",
                    reason: couponErr.message || "Coupon could not be applied"
                });
            }
        }

        // ── Deduct CreditCoins atomically ──────────────────────────────────────
        // coinsUsed is sent from the client when the user chose to redeem coins.
        // We ensure coins cannot exceed available user balance and cannot go negative.
        const reqCoinsUsed = Number(req.body.coinsUsed) || 0;
        if (reqCoinsUsed > 0 && req.body.user) {
            try {
                const userDoc = await User.findById(req.body.user).select("cridetCoin");
                const currentBalance = Number(userDoc?.cridetCoin) || 0;
                // Clamp coinsUsed so it never exceeds available user balance
                const coinsToDeduct = Math.min(reqCoinsUsed, currentBalance);
                if (coinsToDeduct > 0) {
                    await User.findByIdAndUpdate(
                        req.body.user,
                        { $inc: { cridetCoin: -coinsToDeduct } }
                    );
                }
            } catch (coinErr) {
                // Non-fatal — log but don't fail the order
                console.error("Failed to deduct cridetCoin:", coinErr.message);
            }
        }

        let finalData = data;
        try {
            finalData = await Checkout.findOne({ _id: data._id })
                .populate(USER_POPULATE)
                .populate(
                    "deliveryBoy",
                    "name username email phone pic permanentLocation currentLocation isaccept isfree active"
                )
                .populate({
                    path: "products.product",
                    select: "name mincategory resturent basePrice pic",
                    populate: [
                        { path: "maincategory", select: "-_id name" },
                        { path: "resturent", select: "-_id name" }
                    ],
                });
        } catch (popErr) {
            console.warn("Populate fallback on checkout create:", popErr.message);
        }

        // ── Award Credit Coins for non-NetBanking (COD / UPI / Card / Dine-in / Takeaway) ──
        // For NetBanking / Razorpay, coins are awarded in verifyOrder() once
        // the payment signature is confirmed. COD/UPI orders are awarded now.
        let awardResult = null;
        if (!isNetBanking) {
            try {
                awardResult = await awardCreditCoins(data._id);
            } catch (awardErr) {
                console.error("awardCreditCoins error:", awardErr);
            }
        }

        let currentCreditCoins = null;
        if (req.body.user) {
            const u = await User.findById(req.body.user).select("cridetCoin").lean();
            currentCreditCoins = u?.cridetCoin ?? null;
        }

        res.send({
            result: "Done",
            data: finalData || data,
            creditCoinsEarned: awardResult?.coinsAwarded ?? data.creditCoinsEarned ?? 0,
            creditCoinsBalance: currentCreditCoins
        });

    } catch (error) {
        console.error("Checkout createRecord error:", error);
        let errorMessage = {};
        error.errors?.user ? errorMessage.user = error.errors.user.message : null;
        error.errors?.resturent ? errorMessage.resturent = error.errors.resturent.message : null;
        error.errors?.subtotal ? errorMessage.subtotal = error.errors.subtotal.message : null;
        error.errors?.deliveryCharge ? errorMessage.deliveryCharge = error.errors.deliveryCharge.message : null;
        error.errors?.total ? errorMessage.total = error.errors.total.message : null;

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        } else {
            res.status(400).send({ result: "Fail", reason: errorMessage });
        }
    }
}
async function getRecord(req, res) {
    try {
        let data = await Checkout.find().sort({ _id: -1 })
            .populate(USER_POPULATE)
            .populate(
                "deliveryBoy",
                "name username email phone pic permanentLocation currentLocation isaccept isfree active"
            )
        await Promise.all(data.map(async (order) => {
            order.set("products", await attachProductNames(order.products || []))
        }))
        await Checkout.populate(data, {
            path: "products.product",
            select: "name mincategory resturent basePrice pic",
            populate: [
                { path: "maincategory", select: "-_id name" },
                { path: "resturent", select: "-_id name" }
            ],
            options: { slice: { pic: 1 } }
        })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getUserRecord(req, res) {
    try {
        let data = await Checkout.find({ user: req.params.userid }).sort({ _id: -1 })
            .populate(USER_POPULATE)
            .populate(
                "deliveryBoy",
                "name username email phone pic permanentLocation currentLocation isaccept isfree active"
            )
        await Promise.all(data.map(async (order) => {
            order.set("products", await attachProductNames(order.products || []))
        }))
        await Checkout.populate(data, {
            path: "products.product",
            select: "name mincategory resturent basePrice pic",
            populate: [
                { path: "maincategory", select: "-_id name" },
                { path: "resturent", select: "-_id name" }
            ],
            options: { slice: { pic: 1 } }
        })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate(USER_POPULATE)
            .populate(
                "deliveryBoy",
                "name username email phone pic permanentLocation currentLocation isaccept isfree active"
            )
            .populate({
                path: "products.product",
                select: "name mincategory resturent basePrice pic",
                populate: [
                    {
                        path: "maincategory",
                        select: "-_id name"
                    },
                    {
                        path: "resturent",
                        select: "-_id name"
                    }
                ],
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
        if (data) {
            let previousOrderStatus = data.orderStatus
            let previousDeliveryBoy = data.deliveryBoy ? data.deliveryBoy.toString() : null
            let previousIsAccept = data.isaccept
            data.orderStatus = req.body.orderStatus ?? data.orderStatus
            if (req.body.orderStatus && req.body.orderStatus !== previousOrderStatus) {
                data.orderStatusUpdatedAt = new Date()
            }
            data.paymentMode = req.body.paymentMode ?? data.paymentMode
            data.paymentStatus = req.body.paymentStatus ?? data.paymentStatus
            data.deliveryBoy = req.body.deliveryBoy ?? data.deliveryBoy
            // Delivery boy's own confirmation that they're taking this order
            // (set from the Accept modal on Assigned Orders). Checked with
            // typeof so `false` isn't treated the same as "not provided".
            data.isaccept = typeof req.body.isaccept === "boolean" ? req.body.isaccept : data.isaccept
            data.rppid = req.body.rppid ?? data.rppid
            await data.save()

            // ── Push real-time update to anyone in this order's tracking room ──
            // Covers the case where status is changed here (REST, e.g. from an
            // admin/restaurant dashboard) instead of via the updateOrderStatus
            // socket event. Without this, live tracking screens go stale.
            const io = req.app.get("io")
            if (io && req.body.orderStatus && req.body.orderStatus !== previousOrderStatus) {
                io.to(`order_${data._id}`).emit("orderStatusUpdate", {
                    orderId: data._id,
                    status: data.orderStatus,
                    updatedAt: Date.now()
                })
            }
            if (io && req.body.deliveryBoy && req.body.deliveryBoy.toString() !== previousDeliveryBoy) {
                io.to(`order_${data._id}`).emit("deliveryBoyAssigned", {
                    orderId: data._id,
                    deliveryBoy: data.deliveryBoy
                })
            }

            // ── Delivery boy confirmed pickup from Assigned Orders ─────────────
            // Lets any customer/restaurant screen already watching this order's
            // tracking room know the order has actually been accepted (as
            // opposed to merely admin-assigned).
            if (io && data.isaccept && data.isaccept !== previousIsAccept) {
                io.to(`order_${data._id}`).emit("orderAccepted", {
                    orderId: data._id,
                    deliveryBoy: data.deliveryBoy,
                    updatedAt: Date.now()
                })
            }

            // ── Push to every online delivery boy the moment it's ready ──────
            // "Packing" is the signal (set by the admin/restaurant) that the
            // order can be claimed. IncomingOrderModal.jsx is listening for
            // this on every delivery boy's dashboard.
            if (io && req.body.orderStatus && req.body.orderStatus !== previousOrderStatus
                && req.body.orderStatus.toLowerCase() === "packing" && !data.deliveryBoy) {

                const populated = await Checkout.findById(data._id)
                    .populate("user", "address city state pin")
                    .populate(
                        "deliveryBoy",
                        "name username email phone pic permanentLocation currentLocation isaccept isfree active"
                    )
                    .populate("resturent", "name address")
                    .lean();

                broadcastNewOrder(io, {
                    orderId: data._id.toString(),
                    resturent: {
                        name: populated?.resturent?.name,
                        address: populated?.resturent?.address
                    },
                    dropoff: {
                        address: populated?.user?.address,
                        city: populated?.user?.city,
                        state: populated?.user?.state,
                        pin: populated?.user?.pin
                    },
                    itemCount: Array.isArray(populated?.products) ? populated.products.length : 0,
                    paymentMode: populated?.paymentMode,
                    total: populated?.total
                });
            }

            let finalData = await Checkout.findOne({ _id: data._id })
                .populate(USER_POPULATE)
                .populate(
                    "deliveryBoy",
                    "name username email phone pic permanentLocation currentLocation isaccept isfree active"
                )
                .populate({
                    path: "products.product",
                    select: "name mincategory resturent basePrice pic",
                    populate: [
                        {
                            path: "maincategory",
                            select: "-_id name"
                        },
                        {
                            path: "resturent",
                            select: "-_id name"
                        }
                    ],
                    options: {
                        slice: {
                            pic: 1
                        }
                    }
                })
            if (req.body.orderStatus && req.body.orderStatus !== previousOrderStatus) {
                let statusMessage = "";

                // Customize email message based on the order status
                switch (req.body.orderStatus.toLowerCase()) {
                    case "order is under Process":
                        statusMessage = "Your order will be packed soon. It will reach you soon!";
                        break;
                    case "order is placed":
                        statusMessage = "Your order has been shipped. It will reach you soon!";
                        break;
                    case "order is packed":
                        statusMessage = "Your order has been packed. It will reach you soon!";
                        break;
                    case "out for delivery":
                        statusMessage = "Your order is out for delivery. Please be ready to receive it.";
                        break;
                    case "delivered":
                        statusMessage = "Your order has been successfully delivered. Thank you for choosing us!";
                        break;
                    default:
                        statusMessage = `Your order status has been updated to: ${req.body.orderStatus}.`;
                        break;
                }
                mailer.sendMail({
                    from: process.env.RESEND_FROM || process.env.MAIL_SENDER,
                    to: finalData.user.email,
                    subject: `Order Status Updated - Team ${process.env.SITE_NAME}`,
                    html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                                <h2 style="color: #28a745;">Hello,</h2>
                                <p style="color: #555;">
                                ${statusMessage}
                                </p>
                                <p style="color: #555;">
                                    If you have any questions, please <a href="${process.env.SERVER}/contact" style="color: #007bff;">contact us</a>.
                                </p>
                                <p style="color: #555;">Best Regards, <br> Team ${process.env.SITE_NAME}</p>
                            </div>
                        `,
                }, (error) => {
                    if (error) console.log("Error sending email:", error);
                    // else console.log("Order status update email sent successfully.");
                });

            }
            res.send({
                result: "Done",
                data: finalData
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// ── REST fallback for tracking (GET /api/checkout/:orderid/tracking) ─────────
// Used for the very first paint before the socket connects, or as a backup
// if a client can't hold a websocket open. Reads the fast in-memory cache
// from trackingsocket.js first, falls back to the DB (Checkout.currentLocation)
// if the server just restarted and the cache is cold.
const { getOrderState, broadcastNewOrder } = require("../socket/trackingSocket");

async function getTrackingRecord(req, res) {
    try {
        const orderId = req.params.id
        const userId = req.user?._id || req.user?.id || req.headers["x-user-id"]
        if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).send({ result: "Fail", reason: "Valid authenticated order is required" })
        }

        const checkout = await Checkout.findById(orderId)
            .select("user currentLocation orderStatus orderStatusUpdatedAt updatedAt createdAt deliveryBoy address")
            .lean()
        if (!checkout) return res.status(404).send({ result: "Fail", reason: "Order Not Found" })
        if (String(checkout.user) !== String(userId)) {
            return res.status(403).send({ result: "Fail", reason: "You cannot view tracking for this order" })
        }

        const deliveryBoyId = checkout.deliveryBoy?._id || checkout.deliveryBoy
        let deliveryBoy = deliveryBoyId
            ? await DeliveryBoy.findById(deliveryBoyId).select("name phone pic currentLocation").lean()
            : null
        if (!deliveryBoy && deliveryBoyId) {
            deliveryBoy = await User.findOne({ _id: deliveryBoyId, role: "deliveryBoy" })
                .select("name phoneNo pic currentLocation")
                .lean()
            if (deliveryBoy?.phoneNo && !deliveryBoy.phone) deliveryBoy.phone = String(deliveryBoy.phoneNo)
        }

        const location = checkout.currentLocation?.lat != null
            ? checkout.currentLocation
            : deliveryBoy?.currentLocation?.lat != null
                ? deliveryBoy.currentLocation
                : null
        const address = checkout.address && typeof checkout.address === "object" ? checkout.address : null
        const destination = Number.isFinite(Number(address?.lat)) && Number.isFinite(Number(address?.lng))
            ? { lat: Number(address.lat), lng: Number(address.lng) }
            : null

        res.send({
            result: "Done",
            data: {
                orderId,
                location: location || null,
                destination,
                status: checkout.orderStatus || null,
                statusUpdatedAt: checkout.orderStatusUpdatedAt || checkout.updatedAt || checkout.createdAt || null,
                deliveryBoy: deliveryBoy ? {
                    id: deliveryBoy._id,
                    name: deliveryBoy.name || "Delivery partner",
                    phone: deliveryBoy.phone || "",
                    pic: deliveryBoy.pic || ""
                } : null
            }
        });

    } catch (error) {
        console.error("getTrackingRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function commentOnOrder(req, res) {
    try {
        const userId = req.user?._id || req.user?.id || req.headers["x-user-id"]
        const { comment, rating } = req.body
        const cleanComment = typeof comment === "string" ? comment.trim() : ""
        const numericRating = Number(rating)

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).send({ result: "Fail", reason: "Please sign in to comment on an order" })
        }
        if (cleanComment.length < 5 || cleanComment.length > 1000) {
            return res.status(400).send({ result: "Fail", reason: "Comment must be between 5 and 1000 characters" })
        }
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).send({ result: "Fail", reason: "Rating must be from 1 to 5" })
        }

        let order = await Checkout.findOne({ _id: req.params._id, user: userId })
        if (!order) return res.status(404).send({ result: "Fail", reason: "Order not found for this account" })

        const normalizedStatus = String(order.orderStatus || "").trim().toLowerCase()
        if (!["delivered", "completed", "served"].includes(normalizedStatus)) {
            return res.status(409).send({ result: "Fail", reason: "You can comment after this order is completed" })
        }
        if (order.customerComment && order.customerComment !== cleanComment) {
            return res.status(409).send({ result: "Fail", reason: "A comment has already been submitted for this order" })
        }

        if (!order.customerComment) {
            const claimedOrder = await Checkout.findOneAndUpdate(
                { _id: order._id, user: userId, customerComment: { $in: ["", null] } },
                {
                    $set: {
                        customerComment: cleanComment,
                        customerRating: numericRating,
                        customerCommentedAt: new Date(),
                        commentRewarded: true
                    }
                },
                { new: true }
            )
            if (claimedOrder) {
                order = claimedOrder
            } else {
                order = await Checkout.findById(order._id)
                if (!order || order.customerComment !== cleanComment) {
                    return res.status(409).send({ result: "Fail", reason: "A comment has already been submitted for this order" })
                }
            }
        }

        const customerReward = await User.updateOne(
            { _id: userId, commentedOrderRewards: { $ne: order._id } },
            { $addToSet: { commentedOrderRewards: order._id }, $inc: { cridetCoin: 5 } }
        )
        const customerCoinsAdded = customerReward.modifiedCount === 1 ? 5 : 0
        await Checkout.updateOne(
            { _id: order._id },
            {
                $set: {
                    commentRewarded: true,
                    customerCommentCoinsAwarded: true
                }
            }
        )

        const customer = await User.findById(userId).select("cridetCoin").lean()

        res.send({
            result: "Done",
            data: {
                orderId: order._id,
                comment: order.customerComment,
                rating: order.customerRating,
                customerCoinsAdded,
                customerCoinBalance: customer?.cridetCoin ?? null
            }
        })
    } catch (error) {
        console.error("Comment on order error:", error)
        res.status(500).send({ result: "Fail", reason: "Could not save order comment or award coins" })
    }
}

async function rateDeliveryOrder(req, res) {
    try {
        const userId = req.user?._id || req.user?.id || req.headers["x-user-id"]
        const rating = Number(req.body.rating)
        const feedback = typeof req.body.feedback === "string" ? req.body.feedback.trim() : ""
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).send({ result: "Fail", reason: "Please sign in to rate your delivery" })
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).send({ result: "Fail", reason: "Rating must be from 1 to 5" })
        }
        if (feedback.length > 1000) {
            return res.status(400).send({ result: "Fail", reason: "Delivery feedback must be 1000 characters or fewer" })
        }

        let order = await Checkout.findOne({ _id: req.params._id, user: userId })
        if (!order) return res.status(404).send({ result: "Fail", reason: "Order not found for this account" })
        const normalizedStatus = String(order.orderStatus || "").trim().toLowerCase()
        if (!["delivered", "completed", "served"].includes(normalizedStatus)) {
            return res.status(409).send({ result: "Fail", reason: "You can rate delivery after this order is completed" })
        }

        const deliveryBoyId = order.deliveryBoy?._id || order.deliveryBoy
        if (!deliveryBoyId || !mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
            return res.status(409).send({ result: "Fail", reason: "No delivery partner is assigned to this order" })
        }
        if (order.deliveryRating && Number(order.deliveryRating) !== rating) {
            return res.status(409).send({ result: "Fail", reason: "A delivery rating has already been submitted" })
        }

        if (!order.deliveryRating) {
            const claimedOrder = await Checkout.findOneAndUpdate(
                { _id: order._id, user: userId, deliveryRating: { $in: [null, undefined] } },
                {
                    $set: {
                        deliveryRating: rating,
                        deliveryFeedback: feedback,
                        deliveryRatedAt: new Date()
                    }
                },
                { new: true }
            )
            if (claimedOrder) {
                order = claimedOrder
            } else {
                order = await Checkout.findById(order._id)
                if (!order || Number(order.deliveryRating) !== rating) {
                    return res.status(409).send({ result: "Fail", reason: "A delivery rating has already been submitted" })
                }
            }
        }

        const rewardResult = await DeliveryBoy.updateOne(
            { _id: deliveryBoyId, commentedOrderRewards: { $ne: order._id } },
            { $addToSet: { commentedOrderRewards: order._id }, $inc: { creditCoins: 10 } }
        )
        const deliveryBoyCoinsAdded = rewardResult.modifiedCount === 1 ? 10 : 0
        if (deliveryBoyCoinsAdded) {
            await Checkout.updateOne({ _id: order._id }, { $set: { deliveryRatingRewarded: true } })
        }

        const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select("creditCoins").lean()
        res.send({
            result: "Done",
            data: {
                orderId: order._id,
                rating: order.deliveryRating,
                feedback: order.deliveryFeedback,
                deliveryBoyCoinsAdded,
                deliveryBoyCoinBalance: deliveryBoy?.creditCoins ?? null
            }
        })
    } catch (error) {
        console.error("Delivery rating error:", error)
        res.status(500).send({ result: "Fail", reason: "Could not save delivery rating or award coins" })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    getUserRecord: getUserRecord,
    deleteRecord: deleteRecord,
    order: order,
    verifyOrder: verifyOrder,
    getTrackingRecord: getTrackingRecord,
    commentOnOrder: commentOnOrder,
    rateDeliveryOrder: rateDeliveryOrder
}