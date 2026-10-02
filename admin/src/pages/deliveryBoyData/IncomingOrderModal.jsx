import React, { useEffect, useState } from "react";
import socket from "../../util/Socket"; // adjust path if your project layout differs
import { seedLocationFromBrowser } from "../../util/useDeliveryLocationBroadcast"; // adjust path if needed

// Small floating notification for the (rare) case a modal closes itself
// because someone else claimed the order first.
function TakenToast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div
            className="alert alert-warning shadow-sm py-2 px-3 mb-0"
            role="status"
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 2000,
                maxWidth: 320,
            }}
        >
            <i className="bi bi-info-circle me-2"></i>
            {message}
        </div>
    );
}

/**
 * Mount this ONCE near the top of the delivery boy's layout/dashboard:
 *   <IncomingOrderModal deliveryBoyId={_id} />
 *
 * It shows a claimable-order modal to every online delivery boy the moment
 * an admin/restaurant marks an order "Packing"/"Packed". Whoever taps
 * Accept first gets it — the server (`claimOrder` in trackingSocket.js)
 * enforces this atomically, so a race between two taps can't double-assign.
 */
export default function IncomingOrderModal({ deliveryBoyId, onOrderAccepted }) {
    const [queue, setQueue] = useState([]); // pending order requests, oldest first
    const [claiming, setClaiming] = useState(false);
    const [toast, setToast] = useState("");

    const current = queue[0] || null;

    useEffect(() => {
        if (!deliveryBoyId) return;

        function onNewOrder(order) {
            setQueue((q) => (q.some((o) => o.orderId === order.orderId) ? q : [...q, order]));
        }

        function onOrderClaimed({ orderId, deliveryBoy }) {
            // Someone else (not us) took it — drop it from our queue.
            setQueue((q) => {
                const wasShowingIt = q[0]?.orderId === orderId;
                const next = q.filter((o) => o.orderId !== orderId);
                if (wasShowingIt && deliveryBoy !== deliveryBoyId) {
                    setToast("That order was just picked up by another delivery partner.");
                }
                return next;
            });
        }

        function onClaimResult({ orderId, success, reason }) {
            setClaiming(false);
            if (success) {
                setQueue((q) => q.filter((o) => o.orderId !== orderId));
                setToast("Order assigned to you — check Assigned Orders.");

                // Save a location fix right away so the customer's map isn't
                // blank while waiting for the first continuous GPS tick.
                seedLocationFromBrowser(deliveryBoyId, orderId);

                // Let the parent know so it can set this as the active order
                // (e.g. pass it into useDeliveryLocationBroadcast's orderId).
                onOrderAccepted?.(orderId);
            } else {
                setQueue((q) => q.filter((o) => o.orderId !== orderId));
                setToast(reason || "Could not claim this order.");
            }
        }

        socket.on("newOrderRequest", onNewOrder);
        socket.on("orderClaimed", onOrderClaimed);
        socket.on("claimResult", onClaimResult);

        return () => {
            socket.off("newOrderRequest", onNewOrder);
            socket.off("orderClaimed", onOrderClaimed);
            socket.off("claimResult", onClaimResult);
        };
    }, [deliveryBoyId]);

    function accept() {
        if (!current || claiming) return;
        setClaiming(true);
        socket.emit("claimOrder", { orderId: current.orderId, userId: deliveryBoyId });
    }

    function decline() {
        // Local-only: just stop showing it to this delivery boy. Still visible
        // to everyone else, still claimable by anyone until someone accepts.
        setQueue((q) => q.slice(1));
    }

    return (
        <>
            {current && (
                <div className="aob-overlay">
                    <div className="aob-modal" style={{ maxWidth: 420 }}>
                        <div className="aob-modal-header">
                            <div>
                                <h2 className="h5 mb-0">
                                    <i className="bi bi-bell-fill text-warning me-2"></i>
                                    New order ready for pickup
                                </h2>
                                <p className="text-muted small mb-0">
                                    {queue.length > 1 ? `${queue.length} orders waiting` : "First to accept gets it"}
                                </p>
                            </div>
                        </div>

                        <div className="aob-modal-body">
                            <div className="mb-3">
                                <h3 className="h6 text-uppercase text-muted mb-2">Pickup from</h3>
                                <div className="aob-detail-row">
                                    <i className="bi bi-shop text-primary"></i>
                                    <span>{current.resturent?.name || "Restaurant"}</span>
                                </div>
                                {current.resturent?.address && (
                                    <div className="aob-detail-row">
                                        <i className="bi bi-geo-alt text-primary"></i>
                                        <span>{current.resturent.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <h3 className="h6 text-uppercase text-muted mb-2">Drop off at</h3>
                                <div className="aob-detail-row">
                                    <i className="bi bi-pin-map text-primary"></i>
                                    <span>
                                        {[current.dropoff?.address, current.dropoff?.city, current.dropoff?.state, current.dropoff?.pin]
                                            .filter(Boolean)
                                            .join(", ") || "Address on file"}
                                    </span>
                                </div>
                            </div>

                            <div className="aob-summary-row">
                                <span>Items</span>
                                <span>{current.itemCount}</span>
                            </div>
                            <div className="aob-summary-row">
                                <span>Payment mode</span>
                                <span>{current.paymentMode || "COD"}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="aob-summary-row total">
                                <span>Order total</span>
                                <span>₹{current.total || 0}</span>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button type="button" className="btn btn-outline-secondary" onClick={decline} disabled={claiming}>
                                    Skip
                                </button>
                                <button type="button" className="btn btn-success" onClick={accept} disabled={claiming}>
                                    {claiming ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Claiming…
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2-circle me-1"></i> Accept order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <TakenToast message={toast} onDone={() => setToast("")} />}
        </>
    );
}