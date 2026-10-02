const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
require("./db_connect");

const app = express();
const server = http.createServer(app);

const Router = require("./routes/index");

// ---------------- CORS ----------------

const whitelist = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:8000",
    "https://easy-dine-iota.vercel.app",
    "https://easydine-86b9.onrender.com",
    'https://admin-easydine.ishaanportfolio.com',
    'https://easydine.ishaanportfolio.com'
];

const corsOptions = {
    origin: function (origin, callback) {

        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS Error"));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------- Socket.IO ----------------

const io = new Server(server, {
    cors: {
        origin: whitelist,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io available inside controllers/routes
app.set("io", io);

// ---------------- Routes ----------------

app.use("/api", Router);

// ---------------- React Build ----------------

app.use(express.static(path.join(__dirname, "admin/build")));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "admin/build", "index.html"));
});

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});