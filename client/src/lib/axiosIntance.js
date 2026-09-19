// lib/axiosInstance.js
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_SERVER + "/api",
    timeout: 10000,
    withCredentials: true, // sends/receives HttpOnly cookies
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;