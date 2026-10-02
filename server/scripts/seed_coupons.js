require("dotenv").config()
const mongoose = require("mongoose")
const Coupon = require("../models/Coupon")

const validTill = new Date()
validTill.setFullYear(validTill.getFullYear() + 1)

const coupons = [
  { code: "WELCOME10", description: "10% off your first order", discountType: "percentage", discountValue: 10, maxDiscountAmount: 100, minOrderValue: 299 },
  { code: "WELCOME15", description: "15% off your first order", discountType: "percentage", discountValue: 15, maxDiscountAmount: 150, minOrderValue: 499 },
  { code: "FOODIE20", description: "20% off orders above Rs. 799", discountType: "percentage", discountValue: 20, maxDiscountAmount: 200, minOrderValue: 799 },
  { code: "SAVE50", description: "Rs. 50 off your order", discountType: "flat", discountValue: 50, minOrderValue: 299 },
  { code: "SAVE100", description: "Rs. 100 off orders above Rs. 699", discountType: "flat", discountValue: 100, minOrderValue: 699 },
  { code: "LUNCH10", description: "10% off lunch orders", discountType: "percentage", discountValue: 10, maxDiscountAmount: 120, minOrderValue: 399 },
  { code: "DINNER15", description: "15% off dinner orders", discountType: "percentage", discountValue: 15, maxDiscountAmount: 180, minOrderValue: 599 },
  { code: "BIRYANI75", description: "Rs. 75 off biryani orders", discountType: "flat", discountValue: 75, minOrderValue: 449 },
  { code: "SWEETTREATS", description: "20% off dessert orders", discountType: "percentage", discountValue: 20, maxDiscountAmount: 100, minOrderValue: 249 },
  { code: "FAMILY250", description: "Rs. 250 off family orders", discountType: "flat", discountValue: 250, minOrderValue: 1499 },
]

async function seedCoupons() {
  const dbUri = process.env.DB_Key || process.env.MONGODB_URI
  if (!dbUri) {
    throw new Error("MongoDB URI not found in DB_Key or MONGODB_URI")
  }

  await mongoose.connect(dbUri)

  const results = await Coupon.bulkWrite(
    coupons.map((coupon) => ({
      updateOne: {
        filter: { code: coupon.code },
        update: {
          $setOnInsert: {
            ...coupon,
            validFrom: new Date(),
            validTill,
            active: true,
          },
        },
        upsert: true,
      },
    }))
  )

  const seededCount = await Coupon.countDocuments({ code: { $in: coupons.map(({ code }) => code) } })
  console.log(`Coupon seeding complete: ${results.upsertedCount} created, ${seededCount} seed coupons available.`)
}

seedCoupons()
  .catch((error) => {
    console.error("Coupon seeding failed:", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })