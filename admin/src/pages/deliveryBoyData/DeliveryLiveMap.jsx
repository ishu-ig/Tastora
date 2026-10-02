import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import socket from "../../util/Socket"; // adjust path if your project layout differs
import useDeliveryLocationBroadcast from "../../util/useDeliveryLocationBroadcast"; // adjust path if needed
import {
  getCheckout,
  updateCheckout,
} from "../../Redux/ActionCreators/CheckoutActionCreators";

// Suggested route: /delivery/:_id/live-map
// Add a link to it wherever the delivery boy navigates from (Dashboard's
// quickActions, a nav item, etc.) — see the "Live Tracking" quick action
// added to DeliveryBoyDasboard.jsx.

const STATUS_BADGE = {
  "Out for Delivery": "text-bg-warning",
  Delivered: "text-bg-success",
  Cancelled: "text-bg-danger",
};

const AUTO_CLOSE_SECONDS = 10;

function unwrap(slice) {
  if (!slice) return [];
  if (Array.isArray(slice)) return slice;
  if (Array.isArray(slice.data)) return slice.data;
  return [];
}

function timeAgo(ts) {
  if (!ts) return null;
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function DeliveryLiveMap() {
  const { _id, orderId } = useParams(); // _id = delivery boy's own userid; orderId = optional, picked from Assigned Orders' Track button
  const dispatch = useDispatch();
  const CheckoutStateData = useSelector((s) => s.CheckoutStateData);

  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [remoteStatus, setRemoteStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [cashCollected, setCashCollected] = useState(false);
  const [deliveredAt, setDeliveredAt] = useState(null);
  const [, forceTick] = useState(0); // re-render once a second so "updated Xs ago" / countdown stay live

  // Back button target: the delivery boy's own Assigned Orders list.
  const backHref = `/deliveryBoy/${localStorage.getItem("userid")}/orders`;

  useEffect(() => {
    dispatch(getCheckout());
  }, [dispatch]);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const orders = unwrap(CheckoutStateData);

  // The order this delivery boy has accepted and is currently out
  // delivering. If we arrived here via a specific order's "Track" button
  // (Assigned Orders), lock onto that one; otherwise fall back to
  // auto-detecting the most recently updated active order.
  const activeOrder = useMemo(() => {
    const mine = orders.filter((o) => {
      const did = o.deliveryBoy?._id?.toString?.() ?? o.deliveryBoy?.toString?.();
      return did === _id && o.isaccept && o.orderStatus === "Out for Delivery";
    });
    if (orderId) {
      return mine.find((o) => o._id === orderId) || null;
    }
    return (
      mine.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ||
      null
    );
  }, [orders, _id, orderId]);

  const { position } = useDeliveryLocationBroadcast({
    userId: _id,
    orderId: activeOrder?._id,
  });

  // Live updates scoped to the active order's tracking room.
  useEffect(() => {
    setRestaurantLocation(null);
    setRemoteStatus(null);
    if (!activeOrder?._id) return;

    function onSnapshot(payload) {
      if (payload.orderId !== activeOrder._id) return;
      setRestaurantLocation(payload.restaurantLocation || null);
      if (payload.status) setRemoteStatus(payload.status);
    }
    function onStatus(payload) {
      if (payload.orderId !== activeOrder._id) return;
      setRemoteStatus(payload.status);
      // Order wrapped up — refresh so this page falls back to the empty state.
      if (payload.status === "Delivered" || payload.status === "Cancelled") {
        dispatch(getCheckout());
      }
    }

    socket.on("trackingSnapshot", onSnapshot);
    socket.on("orderStatusUpdate", onStatus);
    return () => {
      socket.off("trackingSnapshot", onSnapshot);
      socket.off("orderStatusUpdate", onStatus);
    };
  }, [activeOrder?._id, dispatch]);

  // Reset the cash-collected confirmation whenever we land on a new order.
  useEffect(() => {
    setCashCollected(false);
    setDeliveredAt(null);
  }, [activeOrder?._id]);

  // Once marked delivered, auto-close this tab/window after a short delay.
  useEffect(() => {
    if (!deliveredAt) return;
    const t = setTimeout(() => {
      // Browsers only allow script-initiated `window.close()` on windows/tabs
      // that were opened by script. If that's blocked (e.g. this was opened
      // by the user typing a URL), fall back to sending them back to the
      // Assigned Orders list instead of leaving them stranded on a dead page.
      window.close();
      setTimeout(() => {
        window.location.href = backHref;
      }, 300);
    }, AUTO_CLOSE_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [deliveredAt, backHref]);

  // ── Map setup ──────────────────────────────────────────────────────────
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const selfMarkerRef = useRef(null);
  const restMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, { zoomControl: false }).setView(
      [20.5937, 78.9629], // India-wide fallback view until a GPS fix arrives
      5,
    );
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      hasFitRef.current = false;
      selfMarkerRef.current = null;
      restMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  // Reset the "already fitted the view" flag whenever the active order changes.
  useEffect(() => {
    hasFitRef.current = false;
  }, [activeOrder?._id]);

  // Self position — pulsing beacon.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    const latlng = [position.lat, position.lng];

    if (!selfMarkerRef.current) {
      const icon = L.divIcon({
        className: "",
        html:
          '<span class="dlm-beacon"><span class="dlm-beacon-ring"></span><span class="dlm-beacon-dot"></span></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      selfMarkerRef.current = L.marker(latlng, {
        icon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      selfMarkerRef.current.setLatLng(latlng);
    }

    if (!hasFitRef.current && !restaurantLocation?.lat) {
      map.setView(latlng, 15);
    }
  }, [position, restaurantLocation]);

  // Restaurant pickup point.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || restaurantLocation?.lat == null || restaurantLocation?.lng == null)
      return;
    const latlng = [restaurantLocation.lat, restaurantLocation.lng];

    if (!restMarkerRef.current) {
      const icon = L.divIcon({
        className: "",
        html: '<span class="dlm-pin dlm-pin-restaurant"><i class="bi bi-shop"></i></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 28],
      });
      restMarkerRef.current = L.marker(latlng, { icon }).addTo(map);
    } else {
      restMarkerRef.current.setLatLng(latlng);
    }
  }, [restaurantLocation]);

  // Route line between rider and restaurant, and a one-time fit-to-bounds.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position || restaurantLocation?.lat == null) return;
    const a = [position.lat, position.lng];
    const b = [restaurantLocation.lat, restaurantLocation.lng];

    if (!routeLineRef.current) {
      routeLineRef.current = L.polyline([a, b], {
        color: "#0d6efd",
        weight: 3,
        dashArray: "6 8",
        opacity: 0.85,
      }).addTo(map);
    } else {
      routeLineRef.current.setLatLngs([a, b]);
    }

    if (!hasFitRef.current) {
      map.fitBounds(L.latLngBounds([a, b]), { padding: [48, 48], maxZoom: 16 });
      hasFitRef.current = true;
    }
  }, [position, restaurantLocation]);

  function recenter() {
    const map = mapRef.current;
    if (!map || !position) return;
    if (restaurantLocation?.lat != null) {
      map.fitBounds(
        L.latLngBounds([
          [position.lat, position.lng],
          [restaurantLocation.lat, restaurantLocation.lng],
        ]),
        { padding: [48, 48], maxZoom: 16 },
      );
    } else {
      map.setView([position.lat, position.lng], 16);
    }
  }

  async function markDelivered() {
    if (!activeOrder) return;
    if (requireCashConfirm && !cashCollected) return; // guarded again below, belt & braces
    if (!window.confirm("Confirm this order has been delivered?")) return;

    setUpdating(true);
    setUpdateError("");
    try {
      await dispatch(
        updateCheckout({
          ...activeOrder,
          orderStatus: "Delivered",
          // Cash collection was confirmed above (or wasn't required, e.g.
          // already-paid online orders) — either way payment is settled now.
          paymentStatus: "Done",
        }),
      );
      setDeliveredAt(Date.now());
    } catch (err) {
      console.error(err);
      setUpdateError("Failed to update order. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  // ── Empty state — nothing currently out for delivery ──────────────────
  if (!activeOrder) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading mb-4 d-flex align-items-start gap-2">
            <Link to={backHref} className="btn btn-outline-secondary btn-sm dlm-back-btn" aria-label="Back to Assigned Orders">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-geo-alt" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Delivery</p>
                <h1 className="h3 mb-1">Live Tracking</h1>
                <p className="text-muted mb-0">
                  Your live position and route while an order is out for delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="panel text-center py-5">
            <i className="bi bi-signpost-2 text-muted" style={{ fontSize: 40 }}></i>
            <h2 className="h5 mt-3 mb-1">Nothing to track right now</h2>
            <p className="text-muted mb-3">
              {orderId
                ? "This order isn't out for delivery — it may already be delivered, or hasn't been accepted yet."
                : "Accept an order from Assigned Orders to start live tracking."}
            </p>
            <Link to={backHref} className="btn btn-primary btn-sm">
              Go to Assigned Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const status = deliveredAt ? "Delivered" : remoteStatus || activeOrder.orderStatus;
  const freshness = position ? timeAgo(position.updatedAt) : null;
  const dropoffAddress = [
    activeOrder.user?.address,
    activeOrder.user?.city,
    activeOrder.user?.state,
    activeOrder.user?.pin,
  ]
    .filter(Boolean)
    .join(", ");
  const directionsHref = dropoffAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropoffAddress)}`
    : null;
  const codDue =
    activeOrder.paymentMode === "COD" && activeOrder.paymentStatus === "Pending"
      ? activeOrder.total
      : 0;

  // Cash-collected confirmation is only mandatory when there's actually
  // cash to collect (COD + payment still pending).
  const requireCashConfirm = codDue > 0;
  const canMarkDelivered =
    !updating && !deliveredAt && (!requireCashConfirm || cashCollected);

  const closingIn = deliveredAt
    ? Math.max(0, AUTO_CLOSE_SECONDS - Math.floor((Date.now() - deliveredAt) / 1000))
    : null;

  return (
    <main className="dashboard-content">
      <style>{DLM_STYLES}</style>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-start gap-2">
            <Link to={backHref} className="btn btn-outline-secondary btn-sm dlm-back-btn" aria-label="Back to Assigned Orders">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-geo-alt" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Delivery</p>
                <h1 className="h3 mb-1">Live Tracking</h1>
                <p className="text-muted mb-0">
                  Order #{activeOrder._id?.slice(-6)?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <span className={`badge ${STATUS_BADGE[status] ?? "text-bg-info"} fs-6`}>
            {status}
          </span>
        </div>

        <div className="dlm-layout">
          <section className="panel dlm-map-panel p-0">
            <div ref={mapElRef} className="dlm-map" />

            <button
              type="button"
              className="dlm-recenter"
              onClick={recenter}
              aria-label="Recenter map on my location"
              disabled={!position}
            >
              <i className="bi bi-crosshair"></i>
            </button>

            {position ? (
              <div className="dlm-freshness">
                <span className="dlm-freshness-dot"></span> Updated {freshness}
              </div>
            ) : (
              <div className="dlm-geo-warning">
                <i className="bi bi-exclamation-triangle"></i> Waiting for GPS…
              </div>
            )}
          </section>

          <aside className="dlm-side">
            <div className="panel">
              <h3 className="h6 text-uppercase text-muted mb-2">Pickup from</h3>
              <div className="aob-detail-row">
                <i className="bi bi-shop text-primary"></i>
                <span>{activeOrder.resturent?.name || "Restaurant"}</span>
              </div>
              {activeOrder.resturent?.address && (
                <div className="aob-detail-row">
                  <i className="bi bi-geo-alt text-primary"></i>
                  <span>{activeOrder.resturent.address}</span>
                </div>
              )}
              {activeOrder.resturent?.phone && (
                <a
                  className="btn btn-outline-primary btn-sm mt-2"
                  href={`tel:${activeOrder.resturent.phone}`}
                >
                  <i className="bi bi-telephone me-1"></i> Call restaurant
                </a>
              )}
            </div>

            <div className="panel">
              <h3 className="h6 text-uppercase text-muted mb-2">Deliver to</h3>
              <div className="aob-detail-row">
                <i className="bi bi-person text-primary"></i>
                <span>{activeOrder.user?.name || activeOrder.user?.email}</span>
              </div>
              {dropoffAddress && (
                <div className="aob-detail-row">
                  <i className="bi bi-geo-alt text-primary"></i>
                  <span>{dropoffAddress}</span>
                </div>
              )}
              <div className="d-flex flex-wrap gap-2 mt-2">
                {activeOrder.user?.phone && (
                  <a
                    className="btn btn-outline-primary btn-sm"
                    href={`tel:${activeOrder.user.phone}`}
                  >
                    <i className="bi bi-telephone me-1"></i> Call
                  </a>
                )}
                {directionsHref && (
                  <a
                    className="btn btn-outline-secondary btn-sm"
                    href={directionsHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="bi bi-signpost-2 me-1"></i> Directions
                  </a>
                )}
              </div>
            </div>

            <div className="panel">
              <h3 className="h6 text-uppercase text-muted mb-2">Order summary</h3>
              <div className="aob-summary-row">
                <span>Payment mode</span>
                <span>{activeOrder.paymentMode || "COD"}</span>
              </div>
              {codDue > 0 && (
                <div className="aob-summary-row">
                  <span className="text-danger">Cash to collect</span>
                  <span className="text-danger fw-semibold">₹{codDue}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="aob-summary-row total">
                <span>Order total</span>
                <span>₹{activeOrder.total || 0}</span>
              </div>

              {requireCashConfirm && !deliveredAt && (
                <div className="form-check dlm-cash-check mt-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="dlmCashCollected"
                    checked={cashCollected}
                    onChange={(e) => setCashCollected(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="dlmCashCollected">
                    I have collected <strong>₹{codDue}</strong> cash from the
                    customer
                  </label>
                </div>
              )}
            </div>

            {updateError && (
              <div className="alert alert-danger py-2" role="alert">
                {updateError}
              </div>
            )}

            {deliveredAt ? (
              <div className="alert alert-success py-2 mb-0" role="status">
                <i className="bi bi-check2-circle me-1"></i> Order marked as
                delivered. Closing this page in {closingIn}s…
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={markDelivered}
                disabled={!canMarkDelivered}
                title={
                  requireCashConfirm && !cashCollected
                    ? "Confirm you've collected the cash before marking delivered"
                    : undefined
                }
              >
                {updating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Updating…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> Mark as delivered
                  </>
                )}
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

// Scoped styles for this page only, prefixed "dlm-" to avoid clashing with
// the app's global stylesheet. The one deliberate signature touch here is
// the live beacon: a soft expanding ring around the rider's dot so a static
// screenshot still reads as "this pin moves," which is the whole point of
// the page.
const DLM_STYLES = `
.dlm-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 992px) {
  .dlm-layout { grid-template-columns: 2fr 1fr; align-items: start; }
}
.dlm-map-panel { position: relative; overflow: hidden; }
.dlm-map { width: 100%; height: 440px; }
@media (min-width: 992px) { .dlm-map { height: 640px; } }

.dlm-back-btn {
  width: 36px; height: 36px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; flex-shrink: 0;
}

.dlm-recenter {
  position: absolute; right: 14px; bottom: 14px; z-index: 500;
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--bs-body-bg, #fff);
  box-shadow: 0 2px 10px rgba(0,0,0,.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--bs-primary, #0d6efd); cursor: pointer;
}
.dlm-recenter:disabled { opacity: .5; cursor: not-allowed; }

.dlm-freshness, .dlm-geo-warning {
  position: absolute; left: 14px; top: 14px; z-index: 500;
  font-size: 12px; padding: 6px 10px; border-radius: 999px;
  display: flex; align-items: center; gap: 6px;
}
.dlm-freshness { background: rgba(15, 23, 42, .82); color: #fff; }
.dlm-geo-warning { background: #fff3cd; color: #664d03; }

.dlm-freshness-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #2ecc71;
  animation: dlm-dot-pulse 1.8s infinite;
}

.dlm-beacon { position: relative; display: block; width: 22px; height: 22px; }
.dlm-beacon-dot {
  position: absolute; top: 7px; left: 7px; width: 8px; height: 8px; border-radius: 50%;
  background: #0d6efd; border: 2px solid #fff; box-shadow: 0 0 0 2px rgba(13,110,253,.35);
}
.dlm-beacon-ring {
  position: absolute; inset: 0; border-radius: 50%; background: rgba(13,110,253,.35);
  animation: dlm-ring-pulse 1.8s ease-out infinite;
}

.dlm-pin {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg); box-shadow: 0 2px 6px rgba(0,0,0,.3);
}
.dlm-pin i { transform: rotate(45deg); font-size: 14px; color: #fff; }
.dlm-pin-restaurant { background: #fd7e14; }

.dlm-side { display: flex; flex-direction: column; gap: 12px; }

.dlm-cash-check {
  background: #fff8e6;
  border: 1px solid #ffe1a8;
  border-radius: 8px;
  padding: 10px 12px 10px 36px;
}
.dlm-cash-check .form-check-input { margin-left: -24px; }

@keyframes dlm-ring-pulse {
  0% { transform: scale(.4); opacity: .8; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes dlm-dot-pulse {
  0% { box-shadow: 0 0 0 0 rgba(46,204,113,.6); }
  70% { box-shadow: 0 0 0 8px rgba(46,204,113,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,204,113,0); }
}
@media (prefers-reduced-motion: reduce) {
  .dlm-beacon-ring, .dlm-freshness-dot { animation: none; }
}
`;