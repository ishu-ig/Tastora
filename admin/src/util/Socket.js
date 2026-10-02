import { io } from "socket.io-client";

// Point this at your deployed API in production via an env var
const SOCKET_URL = process.env.REACT_APP_BACKEND_SERVER || process.env.REACT_APP_API_URL || "http://localhost:8000";

// A single shared socket instance — imported wherever needed instead of
// creating a new connection per component (which would multiply sockets
// every time a component re-mounts).
const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true
});

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Socket disconnected");
});

export default socket;