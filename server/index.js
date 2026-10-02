require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("./db_connect.js");

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: true,
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

// Make io accessible in controllers/services if needed
app.set("io", io);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", require("./routes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ── React build (optional) ───────────────────────────────────────────────────
// Served only if a build exists. Default: server/client/build.
// If your React app is a sibling folder, set CLIENT_BUILD_PATH=../client/build
const buildPath = path.resolve(
    __dirname,
    process.env.CLIENT_BUILD_PATH || "admin/build"
);
const indexHtml = path.join(buildPath, "index.html");

if (fs.existsSync(indexHtml)) {
    app.use(express.static(buildPath));

    // Catch-all for client-side routes (works on Express 4 and 5)
    app.use((req, res, next) => {
        if (
            req.method !== "GET" ||
            req.path.startsWith("/api") ||
            req.path.startsWith("/socket.io")
        ) {
            return next();
        }
        res.sendFile(indexHtml);
    });
} else {
    console.log(`No React build found at ${buildPath}. Running as API only.`);
}

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));