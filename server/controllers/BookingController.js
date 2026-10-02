const Booking = require("../models/Booking")
const Razorpay = require("razorpay")
const mailer = require("../mailer/index")
const crypto = require("crypto");
const mongoose = require("mongoose")
require("../models/Restaurant")

const userIdFromRequest = (req) => req.user?._id || req.user?.id || req.headers["x-user-id"]

async function order(req, res) {
    try {
        const userId = userIdFromRequest(req)
        const checkid = req.body.checkid
        if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(checkid)) {
            return res.status(400).json({ result: "Fail", reason: "Valid booking is required" })
        }

        const booking = await Booking.findOne({ _id: checkid, user: userId })
        if (!booking || booking.bookingState !== "pending-payment") {
            return res.status(404).json({ result: "Fail", reason: "Pending booking not found" })
        }
        if (booking.razorpayOrderId) {
            return res.json({ result: "Done", data: { id: booking.razorpayOrderId, amount: Math.round(booking.total * 100), currency: "INR" } })
        }

        const amount = Math.round(Number(booking.total) * 100)
        if (!Number.isSafeInteger(amount) || amount < 100) {
            return res.status(400).json({ result: "Fail", reason: "Booking total is invalid" })
        }

        const instance = new Razorpay({
            key_id: process.env.RPKEYID,
            key_secret: process.env.RPSECRETKEY,
        });

        const razorpayOrder = await instance.orders.create({
            amount,
            currency: "INR",
            receipt: `booking_${booking._id}`
        });
        booking.razorpayOrderId = razorpayOrder.id
        await booking.save()
        res.json({ result: "Done", data: razorpayOrder })
    } catch (error) {
        console.error("Create booking payment order error:", error)
        res.status(500).json({ result: "Fail", reason: "Could not start payment" })
    }
}

async function verifyOrder(req, res) {
    try {
        const userId = userIdFromRequest(req)
        const checkid = req.body.checkid
        if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(checkid)) {
            return res.status(400).json({ result: "Fail", reason: "Valid booking is required" })
        }

        const booking = await Booking.findOne({ _id: checkid, user: userId });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }
        if (booking.paymentStatus === "Done" && booking.rppid === req.body.razorpay_payment_id) {
            return res.send({ result: "Done", message: "Payment already verified" })
        }
        if (!booking.razorpayOrderId || booking.razorpayOrderId !== req.body.razorpay_order_id) {
            return res.status(400).json({ result: "Fail", message: "Payment order does not match this booking" })
        }

        const generated_signature = crypto
            .createHmac("sha256", process.env.RPSECRETKEY)
            .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
            .digest("hex");

        const receivedSignature = String(req.body.razorpay_signature || "")
        const generatedBuffer = Buffer.from(generated_signature)
        const receivedBuffer = Buffer.from(receivedSignature)
        if (generatedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)) {
            return res.status(400).json({ result: "Fail", message: "Payment verification failed" });
        }

        booking.rppid = req.body.razorpay_payment_id;
        booking.paymentStatus = "Done";
        booking.paymentMode = "Razorpay";
        booking.bookingStatus = true;
        booking.bookingState = "confirmed";
        await booking.save();

        res.send({ result: "Done", message: "Payment Successful" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

async function createRecord(req, res) {
    try {
        const userId = userIdFromRequest(req)
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).send({ result: "Fail", reason: "Please sign in to reserve a table" })
        }

        const isOnlinePayment = req.body.paymentMode === "Razorpay"
        const total = Number(req.body.total)
        if (!Number.isFinite(total) || total <= 0) {
            return res.status(400).send({ result: "Fail", reason: "A valid booking total is required" })
        }

        let data = new Booking({
            ...req.body,
            user: userId,
            total,
            bookingStatus: !isOnlinePayment,
            bookingState: isOnlinePayment ? "pending-payment" : "confirmed",
            paymentStatus: "Pending",
        });

        await data.save();

        let finalData = await Booking.findOne({ _id: data._id })
            .populate("user", ["name", "username", "email", "phone", "address", "state", "city", "pin"])
            .populate("resturent", ["name", "finalPrice", "address", "phone"]);

        // Send confirmation email only after a booking is confirmed.
        const recipientEmail = finalData.user?.email || finalData.guestEmail
        if (finalData.bookingStatus && recipientEmail) {
            mailer.sendMail({
                from: process.env.RESEND_FROM || process.env.MAIL_SENDER,
            to: recipientEmail,
                subject: `Booking Status Update - Team ${process.env.SITE_NAME}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #28a745; text-align: center;">Booking Confirmation</h2>
                        <p style="color: #555; font-size: 16px; text-align: center;">
                            We are happy to inform you that your booking has been <strong>confirmed</strong>! 🎉
                        </p>
                        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-top: 15px; box-shadow: 0px 0px 5px rgba(0,0,0,0.1);">
                            <p style="font-size: 16px; margin: 8px 0;"><strong>Restaurant:</strong> ${finalData.resturent?.name || finalData.restaurantName || "Tastora"}</p>
                            <p style="font-size: 16px; margin: 8px 0;"><strong>Seats Reserved:</strong> ${finalData.seats}</p>
                            <p style="font-size: 16px; margin: 8px 0;"><strong>Date:</strong> ${finalData.date}</p>
                            <p style="font-size: 16px; margin: 8px 0;"><strong>Time:</strong> ${finalData.time}</p>
                        </div>
                        <p style="color: #555; font-size: 16px; text-align: center; margin-top: 20px;">
                            If you have any questions, please 
                            <a href="${process.env.SERVER}/contact" style="color: #007bff; text-decoration: none;">contact us</a>.
                        </p>
                        <p style="color: #555; font-size: 16px; text-align: center; margin-top: 10px;">
                            Best Regards, <br> <strong>Team ${process.env.SITE_NAME}</strong>
                        </p>
                    </div>
                `,
            }, (error) => {
                if (error) console.log("Error sending email:", error);
                else console.log("Booking confirmation email sent successfully.");
            });
        }

        res.send({ result: "Done", data: finalData });

    } catch (error) {
        let errorMessage = {};
        if (error.errors?.user) errorMessage.user = error.errors.user.message;
        if (error.errors?.resturent) errorMessage.resturent = error.errors.resturent.message;
        if (error.errors?.seats) errorMessage.seats = error.errors.seats.message;
        if (error.errors?.date) errorMessage.date = error.errors.date.message;
        if (error.errors?.time) errorMessage.time = error.errors.time.message;
        if (error.errors?.finalReservationPrice) errorMessage.finalReservationPrice = error.errors.finalReservationPrice.message;

        if (Object.keys(errorMessage).length > 0) {
            res.status(400).send({ result: "Fail", reason: errorMessage });
        } else {
            console.log(error);
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
    }
}
async function getRecord(req, res) {
    try {
        let data = await Booking.find().sort({ _id: -1 })
            .populate("user", ["name", "username", "email", "phone", "address", "state", "city", "pin"])
            .populate("resturent", ["name", "finalPrice", "address", "phone"])
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
        let data = await Booking.find({ user: req.params.userid }).sort({ _id: -1 })
            .populate("user", ["name", "username", "email", "phone", "address", "pin", "city", "state"])
            .populate("resturent", ["name", "finalPrice", "address", "phone"])
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
        let data = await Booking.findOne({ _id: req.params._id })
            .populate("user", ["name", "username", "email", "phone", "address", "state", "city", "pin"])
            .populate("resturent", ["name", "finalPrice", "address", "phone"])
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
        let data = await Booking.findOne({ _id: req.params._id });
        if (data) {
            data.paymentMode = req.body.paymentMode ?? data.paymentMode;
            data.paymentStatus = req.body.paymentStatus ?? data.paymentStatus;
            if (req.body.bookingStatus !== undefined) {
                data.bookingStatus = req.body.bookingStatus === true || String(req.body.bookingStatus).toLowerCase() === "true";
                data.bookingState = data.bookingStatus ? "confirmed" : "cancelled";
            }
            data.rppid = req.body.rppid ?? data.rppid;
            await data.save();

            let finalData = await Booking.findOne({ _id: data._id })
                .populate("user", ["name", "username", "email", "phone", "address", "state", "city", "pin"])
                .populate("resturent", ["name", "finalPrice", "address", "phone"]);
            const cancellationEmail = finalData.user?.email || finalData.guestEmail;
            if (finalData.bookingState === "cancelled" && cancellationEmail) {
                mailer.sendMail({
                    from: process.env.RESEND_FROM || process.env.MAIL_SENDER,
                    to: cancellationEmail,
                    subject: `Booking Cancellation Notice - Team ${process.env.SITE_NAME}`,
                    html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                                    <h2 style="color: #dc3545; text-align: center;">Booking Cancellation</h2>
                                    <p style="color: #555; font-size: 16px; text-align: center;">
                                        We regret to inform you that your booking has been <strong>cancelled</strong>. 😞
                                    </p>
                                    
                                    <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-top: 15px; box-shadow: 0px 0px 5px rgba(0,0,0,0.1);">
                                        <p style="font-size: 16px; margin: 8px 0;">
                                            <strong>Restaurant:</strong> ${finalData.resturent?.name || finalData.restaurantName || "Tastora"}
                                        </p>
                                        <p style="font-size: 16px; margin: 8px 0;">
                                            <strong>Seats Reserved:</strong> ${finalData.seats}
                                        </p>
                                        <p style="font-size: 16px; margin: 8px 0;">
                                            <strong>Date:</strong> ${finalData.date}
                                        </p>
                                        <p style="font-size: 16px; margin: 8px 0;">
                                            <strong>Time:</strong> ${finalData.time}
                                        </p>
                                    </div>
                        
                                    <p style="color: #555; font-size: 16px; text-align: center; margin-top: 20px;">
                                        If this was a mistake or you’d like to rebook, please visit 
                                        <a href="${process.env.SERVER}/resturent" style="color: #007bff; text-decoration: none;">your bookings</a>.
                                    </p>
                        
                                    <p style="color: #555; font-size: 16px; text-align: center; margin-top: 10px;">
                                        We hope to serve you in the future. If you have any concerns, 
                                        <a href="${process.env.SERVER}/contact" style="color: #007bff; text-decoration: none;">contact us</a>.
                                    </p>
                        
                                    <p style="color: #555; font-size: 16px; text-align: center; margin-top: 10px;">
                                        Best Regards, <br> <strong>Team ${process.env.SITE_NAME}</strong>
                                    </p>
                                </div>
                            `,
                }, (error) => {
                    if (error) console.log("Error sending email:", error);
                    else console.log("Booking cancellation email sent successfully.");
                });
            }


            res.send({
                result: "Done",
                data: finalData
            });
        } else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function cancelOwnRecord(req, res) {
    try {
        const userId = userIdFromRequest(req)
        const booking = await Booking.findOne({ _id: req.params._id, user: userId })
        if (!booking) return res.status(404).send({ result: "Fail", reason: "Booking not found" })
        if (booking.bookingState !== "cancelled") {
            booking.bookingState = "cancelled"
            booking.bookingStatus = false
            await booking.save()
        }
        res.send({ result: "Done", data: booking })
    } catch (error) {
        console.error("Cancel booking error:", error)
        res.status(500).send({ result: "Fail", reason: "Could not cancel booking" })
    }
}

async function rateOwnRecord(req, res) {
    try {
        const userId = userIdFromRequest(req)
        const rating = Number(req.body.ratingGiven)
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).send({ result: "Fail", reason: "Rating must be from 1 to 5" })
        }
        const booking = await Booking.findOne({ _id: req.params._id, user: userId })
        if (!booking) return res.status(404).send({ result: "Fail", reason: "Booking not found" })
        booking.ratingGiven = rating
        booking.feedback = String(req.body.feedback || "").trim()
        await booking.save()
        res.send({ result: "Done", data: booking })
    } catch (error) {
        console.error("Rate booking error:", error)
        res.status(500).send({ result: "Fail", reason: "Could not save booking rating" })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Booking.findOne({ _id: req.params._id })
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

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    getUserRecord: getUserRecord,
    deleteRecord: deleteRecord,
    order: order,
    verifyOrder: verifyOrder,
    cancelOwnRecord: cancelOwnRecord,
    rateOwnRecord: rateOwnRecord
}