import { useEffect, useRef, useState } from "react";
import socket from "./Socket"; // your existing shared socket instance

const API_BASE = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
const REST_BACKUP_INTERVAL_MS = 5000;

// Fire-and-forget REST call — persists via PATCH /api/deliveryboy/:_id/location.
// Used as (a) a one-time "seed" the moment an order is accepted, so the
// customer's map has a starting pin before the first watchPosition tick
// arrives, and (b) a periodic backup in case the socket connection drops.
export async function saveLocationOnce(userId, { lat, lng, orderId } = {}) {
    if (!userId || lat == null || lng == null) return;
    try {
        await fetch(`${API_BASE}/api/deliveryboy/${userId}/location`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem("token") || ""
            },
            body: JSON.stringify({ lat, lng, orderId })
        });
    } catch (err) {
        console.error("saveLocationOnce failed:", err.message);
    }
}

// Convenience wrapper: grabs the browser's current position once and saves
// it immediately. Call this right after a successful claimOrder so the
// customer sees a pin without waiting for the continuous watch to kick in.
export function seedLocationFromBrowser(userId, orderId) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        (pos) => saveLocationOnce(userId, { lat: pos.coords.latitude, lng: pos.coords.longitude, orderId }),
        (err) => console.error("seedLocationFromBrowser geolocation error:", err.message),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/**
 * Delivery boy side hook.
 *
 * Call once when the app opens / delivery boy logs in:
 *   useDeliveryLocationBroadcast({ userId: deliveryBoy._id });
 *
 * Call again (or pass a live orderId) once they accept an order, so their
 * ticks also update that order's tracking room:
 *   useDeliveryLocationBroadcast({ userId: deliveryBoy._id, orderId: activeOrder._id });
 *
 * - Registers the delivery boy once (`registerPartner`) so the server knows
 *   which User doc this socket belongs to, even before any order exists.
 * - Joins the order room (`joinOrderRoom`) whenever orderId is set/changes.
 * - Reads GPS continuously with watchPosition.
 * - PATCHes /api/deliveryboy/:_id/location every 5s. The server validates
 *   the courier assignment and persists the location to the order and courier.
 */
export default function useDeliveryLocationBroadcast({ userId, orderId }) {
    const watchIdRef = useRef(null);
    const registeredRef = useRef(false);
    const joinedOrderRef = useRef(null);
    const lastRestCallRef = useRef(0);

    // Live GPS reading, exposed so callers (e.g. a live-tracking map) can
    // render the delivery boy's own position without re-implementing
    // watchPosition. null until the first fix comes in.
    const [position, setPosition] = useState(null);
    const [geoError, setGeoError] = useState(null);

    // Register the partner once per login session.
    useEffect(() => {
        if (!userId) return;

        function register() {
            socket.emit("registerPartner", { userId, role: "delivery" });
            registeredRef.current = true;
        }

        if (socket.connected) register();
        socket.on("connect", register);

        return () => socket.off("connect", register);
    }, [userId]);

    // Join/leave the order room as the active order changes.
    useEffect(() => {
        if (!orderId || !userId) return;

        socket.emit("joinOrderRoom", { orderId, role: "delivery", userId });
        joinedOrderRef.current = orderId;

        return () => {
            socket.emit("leaveOrderRoom", { orderId });
            joinedOrderRef.current = null;
        };
    }, [orderId, userId]);

    // Stream GPS ticks continuously while this hook is mounted.
    useEffect(() => {
        if (!userId || !navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, accuracy, heading } = pos.coords;

                setPosition({ lat, lng, accuracy, heading, updatedAt: Date.now() });
                setGeoError(null);

                // Real-time path — every tick, low latency.
                socket.emit("partner:locationUpdate", { lat, lng });

                // Backup path — throttled, keeps working if the socket drops.
                const now = Date.now();
                if (now - lastRestCallRef.current > REST_BACKUP_INTERVAL_MS) {
                    lastRestCallRef.current = now;
                    saveLocationOnce(userId, { lat, lng, orderId });
                }
            },
            (err) => {
                console.error("Geolocation error:", err.message);
                setGeoError(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000, // reuse a cached fix up to 5s old
                timeout: 10000
            }
        );

        return () => {
            if (watchIdRef.current != null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [userId, orderId]);

    return { position, geoError };
}