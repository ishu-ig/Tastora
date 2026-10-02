"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Bike,
  Phone,
  MessageSquare,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Sparkles,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Flame,
  Store,
  Navigation,
  HelpCircle,
  Share2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Zap,
  ChevronRight,
  Star,
  Package,
  Timer,
  Truck,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import api from "../../../lib/axiosInstance";

const isCoordinate = (point) =>
  Number.isFinite(Number(point?.lat)) &&
  Number.isFinite(Number(point?.lng)) &&
  Number(point.lat) >= -90 && Number(point.lat) <= 90 &&
  Number(point.lng) >= -180 && Number(point.lng) <= 180;

const distanceInKm = (start, end) => {
  if (!isCoordinate(start) || !isCoordinate(end)) return null;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latDelta = radians(Number(end.lat) - Number(start.lat));
  const lngDelta = radians(Number(end.lng) - Number(start.lng));
  const value = Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(Number(start.lat))) * Math.cos(radians(Number(end.lat))) * Math.sin(lngDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

function LiveTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");

  const { ordersHistory } = useCart();

  // Find only a real order. Tracking never renders sample orders or sample GPS.
  const targetOrder = useMemo(() => {
    if (orderIdParam) {
      const found = (ordersHistory || []).find(
        (o) => String(o.id) === String(orderIdParam) || String(o.dbId) === String(orderIdParam)
      );
      if (found) return found;
      return null;
    }
    const active = (ordersHistory || []).find(
      (o) => ["Order is Placed", "Confirmed", "Preparing", "In Kitchen", "Packing", "Out for Delivery", "Picked Up"].includes(o.status)
    );
    if (active) return active;
    return ordersHistory?.[0] || null;
  }, [ordersHistory, orderIdParam]);

  const trackingOrderId = targetOrder?.dbId || (/^[a-f\d]{24}$/i.test(orderIdParam || "") ? orderIdParam : null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const trackingLoading = Boolean(trackingOrderId) && !trackingData && !trackingError;
  const [orderLookupTimedOut, setOrderLookupTimedOut] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const hasCenteredMapRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Help & Support Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState(false);
  const [helpNote, setHelpNote] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setOrderLookupTimedOut(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [orderIdParam]);

  useEffect(() => {
    if (!trackingOrderId) {
      return;
    }
    let isActive = true;
    let requestInFlight = false;
    const loadTracking = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const response = await api.get(`/checkout/tracking/${encodeURIComponent(trackingOrderId)}`);
        if (response.data?.result !== "Done") {
          throw new Error(response.data?.reason || "Tracking data is unavailable.");
        }
        if (isActive) {
          setTrackingData(response.data.data);
          setTrackingError("");
        }
      } catch (error) {
        if (isActive) setTrackingError(error.response?.data?.reason || error.message || "Could not load live location.");
      } finally {
        requestInFlight = false;
      }
    };
    loadTracking();
    const interval = window.setInterval(loadTracking, 5000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [trackingOrderId]);

  const liveLocation = isCoordinate(trackingData?.location) ? trackingData.location : null;
  const destination = isCoordinate(targetOrder?.deliveryCoordinates)
    ? targetOrder.deliveryCoordinates
    : isCoordinate(trackingData?.destination) ? trackingData.destination : null;
  const liveDistanceKm = distanceInKm(liveLocation, destination);

  useEffect(() => {
    if (!liveLocation || !mapContainerRef.current) return;
    let isActive = true;

    import("leaflet").then((leafletModule) => {
      if (!isActive || !mapContainerRef.current) return;
      const L = leafletModule.default;
      let map = mapRef.current;
      if (!map) {
        map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
      }

      const courierLatLng = [Number(liveLocation.lat), Number(liveLocation.lng)];
      if (!courierMarkerRef.current) {
        courierMarkerRef.current = L.marker(courierLatLng, {
          icon: L.divIcon({
            className: "tracking-courier-icon",
            html: '<span class="tracking-courier-dot"></span>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
          title: trackingData?.deliveryBoy?.name || "Delivery partner",
        }).addTo(map);
        courierMarkerRef.current.bindTooltip(trackingData?.deliveryBoy?.name || "Delivery partner");
      } else {
        courierMarkerRef.current.setLatLng(courierLatLng);
      }

      if (destination) {
        const destinationLatLng = [Number(destination.lat), Number(destination.lng)];
        if (!destinationMarkerRef.current) {
          destinationMarkerRef.current = L.circleMarker(destinationLatLng, {
            radius: 8,
            color: "#047857",
            fillColor: "#10b981",
            fillOpacity: 1,
            weight: 3,
          }).addTo(map).bindTooltip("Delivery address");
        } else {
          destinationMarkerRef.current.setLatLng(destinationLatLng);
        }
      }

      if (!hasCenteredMapRef.current) {
        if (destination) {
          map.fitBounds(L.latLngBounds([courierLatLng, [Number(destination.lat), Number(destination.lng)]]), { padding: [40, 40], maxZoom: 15 });
        } else {
          map.setView(courierLatLng, 15);
        }
        hasCenteredMapRef.current = true;
      } else {
        map.panTo(courierLatLng, { animate: true, duration: 0.5 });
      }
      window.setTimeout(() => map.invalidateSize(), 0);
    }).catch(() => {
      if (isActive) setTrackingError("Could not load map tiles. Live coordinates are still being received.");
    });

    return () => {
      isActive = false;
    };
  }, [liveLocation?.lat, liveLocation?.lng, destination?.lat, destination?.lng, trackingData?.deliveryBoy?.name]);

  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const trackingStatus = trackingData?.status || targetOrder?.status || "Waiting for order updates";
  const normalizedStatus = String(trackingStatus).trim().toLowerCase();
  const statusStages = [
    { id: "placed", title: "Order placed", desc: "The restaurant received your order.", icon: <Receipt className="w-3 h-3" />, matches: ["order is placed", "ordered", "confirmed"] },
    { id: "preparing", title: "Preparing", desc: "The kitchen is preparing your order.", icon: <Flame className="w-3 h-3" />, matches: ["preparing", "in kitchen", "order is under process"] },
    { id: "packing", title: "Packing", desc: "Your order is being packed for dispatch.", icon: <Package className="w-3 h-3" />, matches: ["packing", "packed", "order is packed"] },
    { id: "out-for-delivery", title: "Out for delivery", desc: "Your delivery partner is on the way.", icon: <Bike className="w-3 h-3" />, matches: ["out for delivery", "picked up"] },
    { id: "delivered", title: "Delivered", desc: targetOrder?.deliveryAddress || "Order delivered.", icon: <MapPin className="w-3 h-3" />, matches: ["delivered", "completed", "served"] },
  ];
  const currentStageIndex = statusStages.findIndex((stage) => stage.matches.includes(normalizedStatus));
  const isCancelled = normalizedStatus === "cancelled";
  const isDelivered = currentStageIndex === statusStages.length - 1;
  const timelineSteps = statusStages.map((stage, index) => ({
    ...stage,
    time: index === currentStageIndex && trackingData?.statusUpdatedAt
      ? new Date(trackingData.statusUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : index < currentStageIndex ? "Done" : "",
    status: isCancelled ? "upcoming" : isDelivered || index < currentStageIndex ? "completed" : index === currentStageIndex ? "current" : "upcoming",
  }));

  if (!targetOrder) {
    return (
      <main className="min-h-screen bg-zinc-50 pt-36 sm:pt-40 flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-3">
          {orderLookupTimedOut ? <MapPin className="mx-auto h-9 w-9 text-zinc-400" /> : <span className="mx-auto block h-8 w-8 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />}
          <h1 className="text-lg font-black text-zinc-900">{orderLookupTimedOut ? "Order tracking unavailable" : "Loading order details"}</h1>
          {orderLookupTimedOut && <p className="text-sm text-zinc-500">This order could not be found for your account.</p>}
          <Link href="/orders" className="inline-flex text-sm font-bold text-rose-600">Back to orders</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-36 sm:pt-40 pb-24 selection:bg-rose-500 selection:text-white">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-zinc-200">

          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Orders</span>
            </Link>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-600">
                  Real-time GPS Tracking
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${liveLocation ? "bg-emerald-500 animate-ping" : "bg-zinc-400"}`} />
                  <span className={`text-[10px] font-bold ${liveLocation ? "text-emerald-600" : "text-zinc-500"}`}>
                    {liveLocation ? "LIVE" : trackingLoading ? "CONNECTING" : "GPS WAITING"}
                  </span>
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight font-mono">
                Order #{targetOrder.displayId || targetOrder.id}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer text-zinc-700 hover:text-rose-600 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share Link"}</span>
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Need Help?</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

        {/* ══════════════════════════════════════════
            LEFT: LIVE GPS MAP + RIDER HUD (7 Cols)
        ═════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-4">

          {/* ETA Quick Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">ETA</p>
              <p className="text-lg sm:text-xl font-black text-zinc-900 font-mono">{trackingData?.eta || "—"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-xs sm:text-sm font-black text-rose-700 truncate">{trackingStatus}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Distance</p>
              <p className="text-lg sm:text-xl font-black text-zinc-900 font-mono">
                {liveDistanceKm === null ? "—" : `${liveDistanceKm.toFixed(1)} km`}
              </p>
            </div>
          </div>

          {/* Live Map Canvas */}
          <div className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden bg-white border border-zinc-200 shadow-lg">
            <div ref={mapContainerRef} className="absolute inset-0" aria-label="Live delivery map" />
            {!liveLocation && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-zinc-50/90 p-6 text-center pointer-events-none">
                <div className="max-w-xs space-y-2">
                  <MapPin className="mx-auto h-8 w-8 text-rose-600" />
                  <p className="text-sm font-bold text-zinc-900">
                    {trackingLoading ? "Connecting to delivery GPS…" : "Waiting for delivery partner GPS"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {trackingError || "The map will center on the courier when the backend receives their location."}
                  </p>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 z-20 space-y-2">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-zinc-200 shadow-lg space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${liveLocation ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    {liveLocation ? "Backend GPS" : "GPS unavailable"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-zinc-900">{trackingStatus}</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {trackingData?.location?.updatedAt
                    ? `Updated ${new Date(trackingData.location.updatedAt).toLocaleTimeString()}`
                    : "Waiting for latest location"}
                </p>
              </div>
            </div>

            {liveLocation && (
              <div className="absolute bottom-3 left-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-[10px] font-semibold text-zinc-700 shadow">
                {liveDistanceKm === null ? "Courier location received" : `${liveDistanceKm.toFixed(1)} km from your drop-off`}
              </div>
            )}
          </div>

          {/* Rider Profile Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Rider Avatar */}
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">🛵</span>
                  </div>
                  {trackingData?.deliveryBoy && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-black">
                      ✓
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-zinc-900">
                      {trackingData?.deliveryBoy?.name || "Delivery partner not assigned"}
                    </h3>
                    {trackingData?.deliveryBoy && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                        Assigned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-zinc-500">
                      {liveLocation ? "Live GPS location received" : "Waiting for delivery GPS"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rider Action Buttons */}
              <div className="flex items-center gap-2">
                {trackingData?.deliveryBoy?.phone ? (
                  <a
                    href={`tel:${trackingData.deliveryBoy.phone}`}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Rider</span>
                  </a>
                ) : (
                  <span className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-zinc-100 text-zinc-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone unavailable</span>
                  </span>
                )}
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border border-zinc-200 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-rose-500" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Satvik Certified Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-emerald-800 text-xs">
                  100% Thermal Hot-Bag • Contactless & Satvik Guaranteed
                </p>
                <p className="text-[11px] text-emerald-600 truncate">
                  Sealed with pure veg tamper-proof tape. Temperature checked before dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT: ORDER LIFECYCLE + RECEIPT (5 Cols)
        ═════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4">

          {/* Order Lifecycle Timeline */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-zinc-900">
                  Order Status Lifecycle
                </h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg font-mono">
                5 Stages
              </span>
            </div>

            {/* Vertical Stepper */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={step.id} className="relative space-y-1">
                    {/* Stepper dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                          : isCurrent
                          ? "bg-rose-600 border-white text-white ring-4 ring-rose-500/20 shadow-md"
                          : "bg-white border-zinc-200 text-zinc-400"
                      }`}
                    >
                      {isDone ? "✓" : isCurrent ? <Flame className="w-2.5 h-2.5" /> : idx + 1}
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-black ${
                          isCurrent
                            ? "text-rose-600"
                            : isDone
                            ? "text-zinc-900"
                            : "text-zinc-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold text-zinc-400 shrink-0">
                        {step.time}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-zinc-500">{step.desc}</p>

                    {isCurrent && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-600 font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>
                          {step.id === "out-for-delivery"
                            ? liveLocation ? "Courier GPS is updating live." : "Waiting for the courier's first GPS update."
                            : step.desc}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Items + Delivery Address */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-zinc-900">
                  Ordered Items ({targetOrder.items?.length || 0})
                </h3>
              </div>
              <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-xl">
                ₹{typeof targetOrder.total === "number" ? targetOrder.total.toFixed(2) : targetOrder.total || "0.00"}
              </span>
            </div>

            {/* Dish List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {targetOrder.items?.map((dish, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between gap-3 hover:bg-rose-50/40 hover:border-rose-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                      {dish.image || dish.pic ? (
                        <img
                          src={dish.image || dish.pic}
                          alt={dish.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{dish.title}</p>
                      <p className="text-[10px] text-zinc-500">
                        Qty: {dish.quantity}x •{" "}
                        <span className="text-rose-600 font-mono font-bold">
                          ₹{(dish.price * dish.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full shrink-0">
                    ×{dish.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-50 to-emerald-50/30 border border-zinc-200 space-y-1 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider mb-0.5">
                    Delivering To:
                  </span>
                  <p className="font-bold text-zinc-900 text-xs leading-relaxed">
                    {targetOrder.deliveryAddress || "42 Flavor Street, Manhattan, NY"}
                  </p>
                  {targetOrder.deliveryInstruction && (
                    <p className="text-[11px] text-zinc-500 italic mt-1">
                      "{targetOrder.deliveryInstruction}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {targetOrder.paymentMethod && (
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-zinc-500 font-medium">Payment</span>
                <span className="font-bold text-zinc-900">{targetOrder.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/menu"
              className="p-3.5 rounded-2xl bg-white border border-zinc-200 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all flex items-center gap-2.5 text-xs font-bold text-zinc-700 hover:text-rose-600 group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <span>Order Again</span>
            </Link>
            <Link
              href="/orders"
              className="p-3.5 rounded-2xl bg-white border border-zinc-200 hover:border-amber-200 hover:bg-amber-50 shadow-sm transition-all flex items-center gap-2.5 text-xs font-bold text-zinc-700 hover:text-amber-700 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <Package className="w-4 h-4 text-amber-600" />
              </div>
              <span>All Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HELP & SUPPORT CONCIERGE MODAL
      ═════════════════════════════════════════ */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Live Order Support</h3>
                  <p className="text-[11px] text-rose-100">24/7 Concierge Care Desk</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Order ID badge */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Tracking ID</span>
                  <span className="font-mono font-black text-zinc-900 text-sm">{targetOrder.displayId || targetOrder.id}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                  Live Dispatch
                </span>
              </div>

              {/* Quick Issues */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-700">Quick Assistance Options:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "⏱️ Delivery Delay",
                    "📍 Update Address",
                    "🔔 Special Note",
                    "📞 Call Kitchen",
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setHelpNote(opt)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-left cursor-pointer transition-all ${
                        helpNote === opt
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-rose-50/50 hover:border-rose-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <textarea
                rows="3"
                value={helpNote}
                onChange={(e) => setHelpNote(e.target.value)}
                placeholder="Describe your request to our 24/7 care desk..."
                className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-medium transition-all resize-none"
              />

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                <a
                  href="tel:+18007873834"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>Call Concierge</span>
                </a>
                <button
                  onClick={() => {
                    setHelpSuccess(true);
                    setTimeout(() => {
                      setShowHelpModal(false);
                      setHelpSuccess(false);
                      setHelpNote("");
                    }, 1800);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-black text-xs text-center transition-all cursor-pointer shadow-md shadow-rose-500/20"
                >
                  Submit Query
                </button>
              </div>

              {helpSuccess && (
                <p className="text-center text-emerald-600 font-bold flex items-center justify-center gap-1.5 py-1 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket received. We'll resolve immediately!</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <span className="text-2xl">🛵</span>
            </div>
            <p className="text-sm font-bold text-zinc-600">Loading Live Tracking...</p>
          </div>
        </div>
      }
    >
      <LiveTrackingContent />
    </Suspense>
  );
}
