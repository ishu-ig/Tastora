import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import api from "../lib/axiosInstance";

/**
 * Returns the user's real CreditCoin balance.
 *
 * Source priority:
 *  1. AuthContext.user.cridetCoin  — set immediately after OTP login (loginUser call)
 *     or after checkAuth() resolves on page load. All three field aliases are
 *     checked because stripSensitive() normalizes all three.
 *  2. CartContext.creditCoinsBalance — synced from AuthContext via its own
 *     useEffect. Fallback while AuthContext is still loading.
 *  3. Direct API call to /auth/me  — last resort if both contexts are 0 but
 *     there is a userid in localStorage (user is logged in but context hasn't
 *     resolved yet, e.g. on first render before useEffect fires).
 */
export default function useCreditCoins() {
    const { user } = useAuth() || {};
    const { creditCoinsBalance } = useCart() || {};
    const [apiCoins, setApiCoins] = useState(null);

    // Derive from AuthContext (most authoritative)
    const fromAuth = (() => {
        if (!user) return null;
        const raw = user.cridetCoin ?? user.creditCoins ?? user.creditCoin;
        if (raw === undefined || raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    })();

    // Derive from CartContext (kept in sync with AuthContext)
    const fromCart = (() => {
        if (typeof creditCoinsBalance !== "number") return null;
        return creditCoinsBalance >= 0 ? creditCoinsBalance : null;
    })();

    // Last-resort: fetch directly if both sources show 0 and user appears logged in
    useEffect(() => {
        if (fromAuth !== null || (fromCart !== null && fromCart > 0)) return;
        if (typeof window === "undefined") return;
        const storedId = localStorage.getItem("userid");
        if (!storedId) return;

        api.get("/auth/me")
            .then((res) => {
                const u = res.data?.data;
                if (u) {
                    const raw = u.cridetCoin ?? u.creditCoins ?? u.creditCoin;
                    const n = raw !== undefined && raw !== null ? Number(raw) : NaN;
                    if (Number.isFinite(n)) setApiCoins(n);
                }
            })
            .catch(() => {}); // Silent fallback
    }, [fromAuth, fromCart]);

    return fromAuth ?? fromCart ?? apiCoins ?? 0;
}