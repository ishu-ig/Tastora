"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../lib/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ------------------------------------------
    // GLOBAL AUTH MODAL STATE
    // Any component can call openAuthModal() to show the
    // login/signup modal without navigating to /login.
    // Pass an optional onSuccess callback to run after login.
    // ------------------------------------------
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "signup"
    const authSuccessCallbackRef = useRef(null);

    const openAuthModal = useCallback((mode = "login", onSuccess = null) => {
        authSuccessCallbackRef.current = onSuccess || null;
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setAuthModalOpen(false);
        authSuccessCallbackRef.current = null;
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await api.get("/auth/me");
            const userData = res.data?.data;
            if (userData) {
                if (process.env.NODE_ENV !== "production") {
                    console.log("[AuthContext] /auth/me cridetCoin:", userData.cridetCoin, "| creditCoins:", userData.creditCoins);
                }
                setUser(userData);
                return userData;
            }
        } catch (err) {
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

    function loginUser(userData) {
        setUser(userData);
    }

    function logoutUser() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("userid");
            localStorage.removeItem("role");
        }
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                checkAuth,
                setUser,
                loginUser,
                logoutUser,
                // Global auth modal controls
                authModalOpen,
                authModalMode,
                authSuccessCallbackRef,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
