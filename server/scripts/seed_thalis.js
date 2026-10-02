const mongoose = require("mongoose");
require("dotenv").config({ path: "/Users/ishaan/Developer/Next app/MyFoodApp/server/.env" });

const Thali = require("../models/Thali");

// ── 10 Thali Seed Data ────────────────────────────────────────────────────────
const thalisData = [
  {
    name: "Rajasthani Royal Thali",
    thaliType: "Rajasthani",
    price: 349,
    originalPrice: 449,
    discount: 22,
    servingFor: 1,
    description:
      "A royal feast straight from the land of kings! Features dal baati churma, gatte ki sabzi, ker sangri, bajra roti, missi roti, papad, pickle, and a generous helping of rabdi to finish.",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Dal Baati Churma", quantity: 2 },
      { customName: "Gatte Ki Sabzi", quantity: 1 },
      { customName: "Ker Sangri", quantity: 1 },
      { customName: "Bajra Roti", quantity: 3 },
      { customName: "Missi Roti", quantity: 2 },
      { customName: "Papad", quantity: 2 },
      { customName: "Mixed Pickle", quantity: 1 },
      { customName: "Rabdi (Dessert)", quantity: 1 },
      { customName: "Chaas (Buttermilk)", quantity: 1 },
    ],
    isAvailable: true,
  },

  {
    name: "Gujarati Satvik Thali",
    thaliType: "Gujarati",
    price: 299,
    originalPrice: 399,
    discount: 25,
    servingFor: 1,
    description:
      "A wholesome, pure-veg spread from Gujarat's vibrant kitchen. Includes dal dhokli, undhiyu, shrikhand, rotli, steamed rice, kadhi, farsan, and sweet jalebi – a perfect balance of sweet, sour & spicy.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Dal Dhokli", quantity: 1 },
      { customName: "Undhiyu", quantity: 1 },
      { customName: "Gujarati Kadhi", quantity: 1 },
      { customName: "Rotli (Chapati)", quantity: 4 },
      { customName: "Steamed Rice", quantity: 1 },
      { customName: "Farsan (Mixed Snack)", quantity: 1 },
      { customName: "Shrikhand", quantity: 1 },
      { customName: "Jalebi (Dessert)", quantity: 2 },
      { customName: "Chaas (Buttermilk)", quantity: 1 },
    ],
    isAvailable: true,
  },

  {
    name: "North Indian Deluxe Thali",
    thaliType: "North Indian",
    price: 379,
    originalPrice: 479,
    discount: 21,
    servingFor: 1,
    description:
      "A hearty North Indian platter with rich gravies and tandoori breads. Dal makhani, paneer butter masala, aloo gobi, tandoori roti, jeera rice, raita, papad, pickle, and gulab jamun to end the meal.",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Dal Makhani", quantity: 1 },
      { customName: "Paneer Butter Masala", quantity: 1 },
      { customName: "Aloo Gobi", quantity: 1 },
      { customName: "Tandoori Roti", quantity: 3 },
      { customName: "Butter Naan", quantity: 1 },
      { customName: "Jeera Rice", quantity: 1 },
      { customName: "Boondi Raita", quantity: 1 },
      { customName: "Papad", quantity: 2 },
      { customName: "Pickle", quantity: 1 },
      { customName: "Gulab Jamun (Dessert)", quantity: 2 },
    ],
    isAvailable: true,
  },

  {
    name: "South Indian Grand Thali",
    thaliType: "South Indian",
    price: 329,
    originalPrice: 429,
    discount: 23,
    servingFor: 1,
    description:
      "An authentic banana-leaf experience from South India. Sambar rice, rasam, curd rice, avial, kootu, poriyal, papad, pickle, payasam, and steamed rice served with love from the deep South.",
    image:
      "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Steamed Rice", quantity: 2 },
      { customName: "Sambar", quantity: 1 },
      { customName: "Rasam", quantity: 1 },
      { customName: "Avial (Mixed Veg)", quantity: 1 },
      { customName: "Kootu (Lentil Veg)", quantity: 1 },
      { customName: "Poriyal (Stir-fry)", quantity: 1 },
      { customName: "Papad", quantity: 2 },
      { customName: "Pickle", quantity: 1 },
      { customName: "Curd", quantity: 1 },
      { customName: "Payasam (Dessert)", quantity: 1 },
    ],
    isAvailable: true,
  },

  {
    name: "Punjabi Dhaba Thali",
    thaliType: "Punjabi",
    price: 359,
    originalPrice: 459,
    discount: 22,
    servingFor: 1,
    description:
      "Straight from the iconic Punjabi roadside dhaba. Sarson da saag with makki di roti, rajma chawal, paneer tikka, mixed dal, lassi, salad, and mukhwas – the taste of Punjab in one big plate!",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Sarson Da Saag", quantity: 1 },
      { customName: "Makki Di Roti", quantity: 3 },
      { customName: "Rajma Masala", quantity: 1 },
      { customName: "Paneer Tikka", quantity: 2 },
      { customName: "Mixed Dal (Tadka)", quantity: 1 },
      { customName: "Steamed Rice", quantity: 1 },
      { customName: "Fresh Salad", quantity: 1 },
      { customName: "Lassi (Sweet)", quantity: 1 },
      { customName: "Mukhwas", quantity: 1 },
    ],
    isAvailable: true,
  },

  {
    name: "Bengali Bhojon Thali",
    thaliType: "Bengali",
    price: 319,
    originalPrice: 419,
    discount: 24,
    servingFor: 1,
    description:
      "A traditional Bengali meal with layers of flavour. Shukto, aloo bhaja, mochar ghonto, dal, steamed rice, mishti doi, rosogolla, and a refreshing aamsotto to finish the platter.",
    image:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Shukto (Bitter Starter)", quantity: 1 },
      { customName: "Aloo Bhaja", quantity: 1 },
      { customName: "Mochar Ghonto", quantity: 1 },
      { customName: "Cholar Dal", quantity: 1 },
      { customName: "Steamed Rice", quantity: 2 },
      { customName: "Mishti Doi", quantity: 1 },
      { customName: "Rosogolla", quantity: 2 },
    ],
    isAvailable: true,
  },

  {
    name: "Maharashtrian Thali",
    thaliType: "Maharashtrian",
    price: 289,
    originalPrice: 389,
    discount: 26,
    servingFor: 1,
    description:
      "An earthy, flavour-packed thali from Maharashtra. Puran poli, varan (dal), ukadiche modak, bhakri, kairichi amti, koshimbir, and solkadhi – a complete meal rich in tradition.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Puran Poli", quantity: 2 },
      { customName: "Varan (Dal)", quantity: 1 },
      { customName: "Kairichi Amti (Raw Mango Dal)", quantity: 1 },
      { customName: "Bhakri (Jowar Bread)", quantity: 2 },
      { customName: "Steamed Rice", quantity: 1 },
      { customName: "Koshimbir (Salad)", quantity: 1 },
      { customName: "Solkadhi", quantity: 1 },
      { customName: "Ukadiche Modak (Dessert)", quantity: 2 },
    ],
    isAvailable: true,
  },

  {
    name: "Tastora Special Thali",
    thaliType: "Special",
    price: 499,
    originalPrice: 649,
    discount: 23,
    servingFor: 2,
    description:
      "Our chef's pride – a premium thali for two featuring the best from across Indian cuisines. Paneer lababdar, dal makhani, mix veg, butter naan, biryani, raita, soup, dessert platter, and welcome drink included.",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Paneer Lababdar", quantity: 1 },
      { customName: "Dal Makhani", quantity: 1 },
      { customName: "Mix Veg", quantity: 1 },
      { customName: "Butter Naan", quantity: 4 },
      { customName: "Veg Biryani", quantity: 1 },
      { customName: "Boondi Raita", quantity: 1 },
      { customName: "Tomato Shorba (Soup)", quantity: 2 },
      { customName: "Gulab Jamun", quantity: 2 },
      { customName: "Rasgulla", quantity: 2 },
      { customName: "Welcome Rose Drink", quantity: 2 },
    ],
    isAvailable: true,
  },

  {
    name: "Jain Satvik Thali",
    thaliType: "Special",
    price: 279,
    originalPrice: 349,
    discount: 20,
    servingFor: 1,
    description:
      "A pure Jain-friendly thali prepared without root vegetables (no onion, garlic, potato, carrot). Includes khatta meetha dal, cabbage sabzi, rajma, phulka, steamed rice, curd, and a sweet kheer.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Khatta Meetha Dal (No Onion/Garlic)", quantity: 1 },
      { customName: "Cabbage & Capsicum Sabzi", quantity: 1 },
      { customName: "Rajma (No Onion)", quantity: 1 },
      { customName: "Phulka / Chapati", quantity: 4 },
      { customName: "Steamed Rice", quantity: 1 },
      { customName: "Plain Curd", quantity: 1 },
      { customName: "Papad", quantity: 2 },
      { customName: "Rice Kheer (Dessert)", quantity: 1 },
    ],
    isAvailable: true,
  },

  {
    name: "Mini Lunch Thali",
    thaliType: "North Indian",
    price: 179,
    originalPrice: 229,
    discount: 22,
    servingFor: 1,
    description:
      "Perfect for a quick, satisfying lunch on the go. A compact yet complete plate with one sabzi, one dal, two rotis, steamed rice, pickle, salad, and a small dessert. Great value everyday meal!",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
    items: [
      { customName: "Seasonal Sabzi", quantity: 1 },
      { customName: "Yellow Dal (Tadka)", quantity: 1 },
      { customName: "Chapati / Roti", quantity: 2 },
      { customName: "Steamed Rice", quantity: 1 },
      { customName: "Pickle", quantity: 1 },
      { customName: "Fresh Salad", quantity: 1 },
      { customName: "Sweet (Halwa or Kheer)", quantity: 1 },
    ],
    isAvailable: true,
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    const dbUri = process.env.DB_Key || process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB for seeding thalis...\n");

    let created = 0;
    let skipped = 0;

    for (const thali of thalisData) {
      const existing = await Thali.findOne({ name: thali.name });
      if (existing) {
        console.log(`  Skipped (already exists): "${thali.name}"`);
        skipped++;
      } else {
        await Thali.create(thali);
        console.log(`  Created: "${thali.name}" (${thali.thaliType}) - Rs.${thali.price}`);
        created++;
      }
    }

    const total = await Thali.countDocuments();
    console.log("\n=================================");
    console.log("Seeding complete!");
    console.log(`Newly created  : ${created}`);
    console.log(`Skipped        : ${skipped}`);
    console.log(`Total in DB    : ${total}`);
    console.log("=================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
