"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            // The axios interceptor reads token from localStorage and attaches it
            // as Authorization + token headers, so this works cross-origin.
            const res = await api.get("/auth/me");
            const userData = res.data?.data;
            if (userData) {
                // Debug: log coin value so we can confirm the server is returning it
                if (process.env.NODE_ENV !== "production") {
                    console.log("[AuthContext] /auth/me cridetCoin:", userData.cridetCoin, "| creditCoins:", userData.creditCoins);
                }
                setUser(userData);
                return userData;
            }
        } catch (err) {
            // /auth/me failed (token expired, no token, network error).
            // Try fallback: fetch by stored userid.
            if (typeof window !== "undefined") {
                const storedId = localStorage.getItem("userid");
                if (storedId) {
                    try {
                        const fallbackRes = await api.get(`/user/${encodeURIComponent(storedId)}`);
                        const fallbackData = fallbackRes.data?.data;
                        if (fallbackData) {
                            if (process.env.NODE_ENV !== "production") {
                                console.log("[AuthContext] fallback /user/:id cridetCoin:", fallbackData.cridetCoin);
                            }
                            setUser(fallbackData);
                            return fallbackData;
                        }
                    } catch (fallbackErr) {
                        console.warn("[AuthContext] Both /auth/me and fallback /user/:id failed");
                    }
                }
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    // loginUser: directly set user state immediately after login
    // (called from AuthModal's onAuthSuccess so the Navbar updates instantly)
    function loginUser(userData) {
        setUser(userData);
    }

    // logoutUser: clear state and localStorage
    function logoutUser() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("userid");
            localStorage.removeItem("role");
        }
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, setUser, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
