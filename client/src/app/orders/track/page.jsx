"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
} from "lucide-react";
import { useCart } from "../../../context/CartContext";

function LiveTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");

  const { ordersHistory, userProfile } = useCart();

  // Find target order or fall back to first active / latest order
  const targetOrder = useMemo(() => {
    if (orderIdParam) {
      const found = (ordersHistory || []).find((o) => o.id === orderIdParam);
      if (found) return found;
    }
    // Default to first active order or first order in history
    const active = (ordersHistory || []).find(
      (o) => o.status === "In Kitchen" || o.status === "Picked Up" || o.status === "Confirmed"
    );
    if (active) return active;
    return ordersHistory?.[0] || {
      id: "ORD-98421",
      date: "Today, 8:30 PM",
      status: "In Kitchen",
      orderMode: "delivery",
      total: 38.45,
      deliveryFee: 0,
      discount: 5.0,
      taxes: 3.45,
      tip: 2.0,
      itemTotal: 38.0,
      deliveryAddress: "42 Flavor Street, Manhattan, NY 10001",
      deliveryInstruction: "Ring doorbell twice, leave at doorstep (Pure Veg Thermal Bag)",
      paymentMethod: "Apple Pay (Verified)",
      eta: "18-22 mins",
      items: [
        {
          title: "Paneer Butter Masala (Satvik)",
          price: 15.99,
          quantity: 1,
          image: "/img/menu/paneer-butter-masala.jpg",
          note: "Mild spice, no onion garlic",
        },
        {
          title: "Garlic Butter Naan (Tandoori)",
          price: 4.49,
          quantity: 2,
          image: "/img/menu/butter-naan.jpg",
          note: "Crispy and warm",
        },
        {
          title: "Royal Saffron Kesar Lassi",
          price: 5.99,
          quantity: 1,
          image: "/img/menu/kesar-lassi.jpg",
          note: "Chilled with pistachio garnishing",
        },
      ],
    };
  }, [ordersHistory, orderIdParam]);

  // Live Simulation / Progress state (0% to 100%)
  const [progressPercent, setProgressPercent] = useState(48);
  const [riderPosition, setRiderPosition] = useState({ x: 48, y: 52 });
  const [mapTheme, setMapTheme] = useState("dark"); // "dark" | "satellite" | "light"
  const [activeStepIndex, setActiveStepIndex] = useState(2); // 0: Placed, 1: Accepted, 2: Cooking, 3: On The Way, 4: Delivered
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Help & Support Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState(false);
  const [helpNote, setHelpNote] = useState("");

  // Simulated live GPS rider movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 95) return 95;
        const next = prev + 1;
        // Calculate smooth curve position on SVG map
        const t = next / 100;
        const startX = 20, startY = 80; // Restaurant coords %
        const endX = 80, endY = 25;     // User Home coords %
        const controlX = 45, controlY = 20; // Bezier control

        // Quadratic bezier
        const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

        setRiderPosition({ x: curX, y: curY });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const timelineSteps = [
    {
      id: "placed",
      title: "Order Placed & Paid",
      time: "8:14 PM",
      desc: "Received by restaurant order desk",
      status: "completed",
    },
    {
      id: "accepted",
      title: "Kitchen Accepted Order",
      time: "8:16 PM",
      desc: "Satvik pure veg cooking line allocated",
      status: "completed",
    },
    {
      id: "kitchen",
      title: "Chef Preparing Fresh Meals",
      time: "8:20 PM",
      desc: "Simmering fresh gravies & tandoor breads",
      status: "current",
      eta: targetOrder.eta || "18-22 mins",
    },
    {
      id: "pickup",
      title: "Rider Picked Up & Sealed",
      time: "Est. 8:34 PM",
      desc: "Thermal hot-bag packed with tamper-proof seal",
      status: "upcoming",
    },
    {
      id: "delivered",
      title: "Arriving at Doorstep",
      time: "Est. 8:46 PM",
      desc: targetOrder.deliveryAddress || "42 Flavor Street, Manhattan, NY",
      status: "upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-28 sm:pt-32 pb-24 selection:bg-rose-500 selection:text-white">
      {/* Top Floating Navigation Header */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/orders"
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Orders</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400">
                  Real-time GPS Tracking
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-white flex items-center gap-2 font-mono">
                <span>Order #{targetOrder.id}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isCopied ? "Link Copied!" : "Share Link"}</span>
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need Help?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left/Top) & Order Status Lifecycle (Right/Bottom) */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ====================================================
            LEFT: INTERACTIVE LIVE GPS MAP & RIDER HUD (7 Cols)
        ==================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Map Canvas Container */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
            {/* SVG Interactive Vector GPS Map */}
            <svg
              className="w-full h-full object-cover select-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Grid Pattern */}
                <pattern
                  id="map-grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke={mapTheme === "dark" ? "#27272a" : "#3f3f46"}
                    strokeWidth="0.25"
                  />
                </pattern>

                {/* Route Glow Gradient */}
                <linearGradient id="routeGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ffb800" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="routeBase" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Map Background with Grid */}
              <rect width="100" height="100" fill={mapTheme === "dark" ? "#121215" : "#18181b"} />
              <rect width="100" height="100" fill="url(#map-grid)" />

              {/* City Street Layout Graphic Lines */}
              <path
                d="M 0 30 Q 30 35 60 15 T 100 20"
                fill="none"
                stroke="#27272a"
                strokeWidth="1.8"
              />
              <path
                d="M 0 65 Q 40 60 70 85 T 100 70"
                fill="none"
                stroke="#27272a"
                strokeWidth="1.6"
              />
              <path
                d="M 35 0 Q 30 50 45 100"
                fill="none"
                stroke="#27272a"
                strokeWidth="2"
              />
              <path
                d="M 75 0 Q 70 45 85 100"
                fill="none"
                stroke="#27272a"
                strokeWidth="1.8"
              />

              {/* Delivery Route Path (Bezier from Restaurant (20, 80) to Home (80, 25)) */}
              <path
                d="M 20 80 Q 45 20 80 25"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="2.5"
                strokeDasharray="2, 1"
              />
              <path
                d="M 20 80 Q 45 20 80 25"
                fill="none"
                stroke="url(#routeGlow)"
                strokeWidth="2"
              />

              {/* Restaurant Marker (Point: 20, 80) */}
              <g transform="translate(20, 80)">
                <circle r="5" fill="#e11d48" fillOpacity="0.2" className="animate-ping" />
                <circle r="3.5" fill="#e11d48" stroke="#ffffff" strokeWidth="0.8" />
              </g>

              {/* Delivery Destination Marker (Point: 80, 25) */}
              <g transform="translate(80, 25)">
                <circle r="5" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="0.8" />
              </g>

              {/* Dynamic Moving Delivery Rider Marker */}
              <g transform={`translate(${riderPosition.x}, ${riderPosition.y})`}>
                <circle r="6" fill="#ffb800" fillOpacity="0.3" className="animate-ping" />
                <circle r="3.8" fill="#ffb800" stroke="#ffffff" strokeWidth="0.9" />
              </g>
            </svg>

            {/* Map Floating HUD Overlay Info (Top Left) */}
            <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800 shadow-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Live GPS Stream
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {targetOrder.eta || "18 mins"}
                  </span>
                  <span className="text-xs text-rose-400 font-bold">Estimated Arrival</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400">
                  Rider is <strong>1.4 km away</strong> • Moving smoothly
                </p>
              </div>
            </div>

            {/* Map Theme Toggle (Top Right) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800">
              <button
                onClick={() => setMapTheme(mapTheme === "dark" ? "satellite" : "dark")}
                className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-zinc-800 text-zinc-200 hover:text-white cursor-pointer"
              >
                {mapTheme === "dark" ? "Dark GPS" : "High Contrast"}
              </button>
            </div>

            {/* Restaurant & Destination Pin Labels inside map */}
            <div className="absolute bottom-4 left-4 z-20 p-2.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-rose-500/30 text-[10px] sm:text-xs flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="font-bold text-white">Tastora Pure Veg Kitchen</span>
            </div>

            <div className="absolute top-20 right-4 z-20 p-2.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-emerald-500/30 text-[10px] sm:text-xs flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-white">Your Delivery Location</span>
            </div>
          </div>

          {/* Delivery Partner / Rider Profile Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">🛵</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 border-2 border-zinc-900 text-[10px]">
                    ✓
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Rahul V. Sharma
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                      Pure Veg Delivery Expert
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Eco Electric Scooter • NY-8492 • ⭐ 4.9 (1,420 deliveries)
                  </p>
                </div>
              </div>

              {/* Rider Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="tel:+18005550199"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Rider</span>
                </a>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Sanitization & Satvik Certified Hot Bag Banner */}
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3 text-xs text-zinc-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">
                  100% Thermal Hot-Bag • Contactless &amp; Satvik Guaranteed
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Sealed with pure veg tamper-proof tape. Temperature checked before dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            RIGHT: FULL ORDER LIFECYCLE TIMELINE & RECEIPT (5 Cols)
        ==================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Full Lifecycle Step-By-Step Timeline */}
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Order Status Lifecycle
                </h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 font-mono">
                5 Stages
              </span>
            </div>

            {/* Vertical Lifecycle Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={step.id} className="relative space-y-1">
                    {/* Stepper Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : isCurrent
                          ? "bg-rose-600 border-white text-white ring-4 ring-rose-500/30 animate-pulse"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-black ${
                          isCurrent
                            ? "text-rose-400"
                            : isDone
                            ? "text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold text-zinc-400 shrink-0">
                        {step.time}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-zinc-400">
                      {step.desc}
                    </p>

                    {isCurrent && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Freshly handcrafting items with pure satvik spices</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Dishes & Delivery Address Drawer */}
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm sm:text-base font-black text-white">
                Ordered Items ({targetOrder.items?.length || 0})
              </h3>
              <span className="text-xs font-mono font-bold text-rose-400">
                ${targetOrder.total?.toFixed(2)}
              </span>
            </div>

            {/* Dish List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {targetOrder.items?.map((dish, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                      <img
                        src={dish.image}
                        alt={dish.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {dish.title}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Qty: {dish.quantity}x •{" "}
                        <span className="text-rose-400 font-mono font-bold">
                          ${(dish.price * dish.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Destination Address */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-400 text-[10px] block uppercase font-bold tracking-wider">
                    Delivering To:
                  </span>
                  <p className="font-bold text-white text-xs">
                    {targetOrder.deliveryAddress || "42 Flavor Street, Manhattan, NY"}
                  </p>
                  {targetOrder.deliveryInstruction && (
                    <p className="text-[11px] text-zinc-400 italic mt-0.5">
                      Note: "{targetOrder.deliveryInstruction}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          HELP & SUPPORT CONCIERGE MODAL
      ==================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-white" />
                <h3 className="text-base font-black">Live Order Support</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">Tracking ID</span>
                  <span className="font-mono font-bold text-white text-sm">{targetOrder.id}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  Live Dispatch
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-zinc-300">Quick Assistance Options:</p>
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
                      className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-left cursor-pointer transition-colors text-[11px]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <textarea
                  rows="3"
                  value={helpNote}
                  onChange={(e) => setHelpNote(e.target.value)}
                  placeholder="Describe your request to our 24/7 care desk..."
                  className="w-full p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href="tel:+18007873834"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-400" />
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
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-center transition-all cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Submit Query
                </button>
              </div>

              {helpSuccess && (
                <p className="text-center text-emerald-400 font-bold flex items-center justify-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket received. We will resolve immediately!</span>
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading Live Tracking...</div>}>
      <LiveTrackingContent />
    </Suspense>
  );
}
