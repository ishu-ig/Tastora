const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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
    "https://tastora-seven.vercel.app",
    "https://tastora.onrender.com",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Same-origin requests (admin served from this server) and
        // non-browser clients have no origin, so they are allowed.
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

// ---------------- API Routes ----------------

app.use("/api", Router);

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Unknown API routes -> JSON 404
app.use("/api", (req, res) => {
    res.status(404).json({ result: "Fail", reason: "API route not found" });
});

// ---------------- Admin Build (server/admin/build) ----------------

const adminBuild = path.join(__dirname, "admin", "build");
const adminIndex = path.join(adminBuild, "index.html");

app.use(express.static(adminBuild));

// Any other route -> admin app (supports client-side routing)
app.use((req, res) => {
    if (!fs.existsSync(adminIndex)) {
        return res
            .status(404)
            .json({ result: "Fail", reason: "Admin build not found" });
    }
    res.sendFile(adminIndex);
});

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});