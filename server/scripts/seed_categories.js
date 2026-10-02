const mongoose = require("mongoose");
require("dotenv").config({ path: "/Users/ishaan/Developer/Next app/MyFoodApp/server/.env" });

const Maincategory = require("../models/Maincategory");
const Subcategory = require("../models/Subcategory");

const categoriesData = [
  {
    name: "Fast Food",
    pic: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Burger",
        pic: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "French Fries & Sides",
        pic: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Sandwiches & Subs",
        pic: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Crispy Fried Chicken",
        pic: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "South Indian",
    pic: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Crispy Dosa",
        pic: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Idli & Medu Vada",
        pic: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Uttapam & Appam",
        pic: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "South Indian Thali",
        pic: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "North Indian",
    pic: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Paneer Specialties",
        pic: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Dal Makhani & Curries",
        pic: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Tandoori Roti & Naan",
        pic: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "North Indian Deluxe Thali",
        pic: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Chinese & Asian",
    pic: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Hakka Noodles & Chowmein",
        pic: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Steamed Momos & Dim Sum",
        pic: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Fried Rice & Bowls",
        pic: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Manchurian & Chilli Gravy",
        pic: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Italian & Continental",
    pic: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Gourmet Pizzas",
        pic: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Creamy & Red Sauce Pastas",
        pic: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Garlic Breads & Bruschetta",
        pic: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Baked Lasagna & Risotto",
        pic: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Biryani & Rice Bowls",
    pic: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Hyderabadi Dum Biryani",
        pic: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Kolkata & Lucknowi Biryani",
        pic: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Pulao & Jeera Rice",
        pic: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Seekh Kebabs & Tikka",
        pic: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Desserts & Bakery",
    pic: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Cakes & Pastries",
        pic: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Ice Creams & Sundaes",
        pic: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Waffles & Brownies",
        pic: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Gulab Jamun & Sweets",
        pic: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Beverages & Shakes",
    pic: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Thick Milkshakes",
        pic: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Cold Coffee & Frappe",
        pic: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Fresh Fruit Juices",
        pic: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Refreshing Mocktails",
        pic: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Street Food & Chaat",
    pic: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Pani Puri & Gol Gappe",
        pic: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Mumbai Pav Bhaji",
        pic: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Dahi Bhalla & Papdi Chaat",
        pic: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Kathi Rolls & Frankies",
        pic: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    name: "Healthy & Diet Food",
    pic: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      {
        name: "Fresh Garden Salads",
        pic: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "High Protein Bowls",
        pic: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Smoothie & Acai Bowls",
        pic: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Fresh Fruit Platters",
        pic: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
];

async function seed() {
  try {
    const dbUri = process.env.DB_Key || process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB for seeding...");

    let totalMainCreated = 0;
    let totalSubCreated = 0;

    for (const cat of categoriesData) {
      let mainDoc = await Maincategory.findOne({ name: cat.name });
      if (!mainDoc) {
        mainDoc = new Maincategory({
          name: cat.name,
          pic: cat.pic,
          active: true,
        });
        await mainDoc.save();
        totalMainCreated++;
        console.log(` Created Maincategory: "${cat.name}"`);
      } else {
        // If image wasn't set or was a placeholder, we can preserve if already set
        console.log(` Found existing Maincategory: "${cat.name}"`);
      }

      for (const sub of cat.subcategories) {
        let subDoc = await Subcategory.findOne({ name: sub.name });
        if (!subDoc) {
          subDoc = new Subcategory({
            name: sub.name,
            maincategory: mainDoc._id,
            pic: sub.pic,
            active: true,
          });
          await subDoc.save();
          totalSubCreated++;
          console.log(`    Created Subcategory: "${sub.name}" -> ${cat.name}`);
        } else {
          // Update linked maincategory and active
          subDoc.maincategory = mainDoc._id;
          subDoc.active = true;
          if (!subDoc.pic) subDoc.pic = sub.pic;
          await subDoc.save();
          console.log(`    Found existing Subcategory: "${sub.name}"`);
        }
      }
    }

    const allMain = await Maincategory.find();
    const allSub = await Subcategory.find();

    console.log("\n=================================");
    console.log(`Seeding complete!`);
    console.log(`Total Maincategories in DB: ${allMain.length}`);
    console.log(`Total Subcategories in DB: ${allSub.length}`);
    console.log(`Newly created Maincategories: ${totalMainCreated}`);
    console.log(`Newly created Subcategories: ${totalSubCreated}`);
    console.log("=================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
