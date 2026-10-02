// lib/axiosInstance.js
import axios from "axios";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_SERVER ||
    process.env.REACT_APP_BACKEND_SERVER ||
    "http://localhost:8000";

const api = axios.create({
    baseURL: `${BACKEND_URL.replace(/\/+$/, "")}/api`,
    timeout: 15000,
    withCredentials: true, // sends/receives HttpOnly cookies
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    // Prevent duplicate /api/api/... if callers provide a leading /api
    if (config.url && config.url.startsWith("/api/")) {
        config.url = config.url.replace(/^\/api\//, "/");
    } else if (config.url === "/api") {
        config.url = "/";
    }

    if (typeof window !== "undefined") {
        try {
            const token = localStorage.getItem("token") || 
                (document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1]);
            if (token) {
                config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
                config.headers.token = decodeURIComponent(token);
            }
            const userid = localStorage.getItem("userid") || localStorage.getItem("userId");
            if (userid) {
                config.headers["x-user-id"] = userid;
            }
        } catch { }
    }
    return config;
});

export default api;