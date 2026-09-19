const mongoose = require('mongoose');

const dbUri = process.env.DB_Key || process.env.MONGODB_URI;

if (!dbUri) {
    console.error("❌ MongoDB URI not found in environment variables (DB_Key or MONGODB_URI)");
} else {
    mongoose.connect(dbUri)
        .then(() => {
            console.log("Database Connected Successfully");
        })
        .catch((err) => {
            console.error("Failed to connect to database:", err.message);
        });
}