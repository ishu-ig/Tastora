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
            const res = await api.get("/auth/me");
            setUser(res.data.data);
        } catch {
            setUser(null); // not logged in / session expired
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
