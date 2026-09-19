"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  FileText,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  Utensils,
  Copy,
  CheckCheck,
  Receipt,
  Download,
  Printer,
  X,
  Phone,
  MessageSquare,
  HelpCircle,
  Flame,
  Tag,
  Coins,
  ExternalLink,
  Navigation,
  Calendar,
  Users,
} from "lucide-react";
import HistoryCard from "../../Component/HistoryCard";
import { useCart } from "../../context/CartContext";

export default function OrdersPage() {
  const router = useRouter();
  const {
    ordersHistory,
    reorderPastOrder,
    rateOrder,
    reservationsHistory,
    cancelReservation,
    rateReservation,
    addToCart,
    userProfile,
  } = useCart();

  // Main Section: "food" | "dining"
  const [mainSection, setMainSection] = useState("food");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [foodTab, setFoodTab] = useState("all"); // "all" | "active" | "delivery" | "takeaway" | "delivered"
  const [diningTab, setDiningTab] = useState("all"); // "all" | "dinein" | "reservations" | "upcoming" | "completed"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "price_desc" | "price_asc"

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Rating Modal State
  const [ratingOrder, setRatingOrder] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // Help & Support Modal State
  const [helpOrder, setHelpOrder] = useState(null);
  const [helpIssueType, setHelpIssueType] = useState("delay");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSuccess, setHelpSuccess] = useState(false);

  // Toast State for Reorder
  const [toastMessage, setToastMessage] = useState("");

  const handleReorder = (order) => {
    reorderPastOrder(order);
    setToastMessage(`Added all ${order.items?.length || 0} items from ${order.id} to cart!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSingleDishReorder = (dish) => {
    addToCart(dish, 1);
    setToastMessage(`Added 1x ${dish.title} to cart!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenRating = (orderOrRes) => {
    setRatingOrder(orderOrRes);
    setSelectedRating(orderOrRes.ratingGiven || 5);
    setFeedbackText(orderOrRes.feedback || "");
    setSelectedTags([]);
    setRatingSuccess(false);
  };

  const handleSaveRating = (e) => {
    e.preventDefault();
    if (!ratingOrder) return;
    const combinedFeedback = [
      ...selectedTags,
      feedbackText.trim(),
    ]
      .filter(Boolean)
      .join(" • ");

    if (ratingOrder.type === "reservation") {
      rateReservation(ratingOrder.id, selectedRating, combinedFeedback);
    } else {
      rateOrder(ratingOrder.id, selectedRating, combinedFeedback);
    }

    setRatingSuccess(true);
    setTimeout(() => {
      setRatingOrder(null);
      setRatingSuccess(false);
    }, 1500);
  };

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    setHelpSuccess(true);
    setTimeout(() => {
      setHelpOrder(null);
      setHelpSuccess(false);
      setHelpMessage("");
    }, 2000);
  };

  const toggleRatingTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // 1. Food Orders List (Delivery & Takeaway)
  const allFoodOrders = useMemo(() => {
    return (ordersHistory || []).filter((o) => o.orderMode !== "dinein");
  }, [ordersHistory]);

  // 2. Dining Orders List (Table Dine-In + Reservations)
  const allDiningOrders = useMemo(() => {
    const dineInOrders = (ordersHistory || [])
      .filter((o) => o.orderMode === "dinein")
      .map((o) => ({ ...o, _cardType: "order" }));
    const reservations = (reservationsHistory || []).map((r) => ({
      ...r,
      _cardType: "reservation",
    }));
    return [...dineInOrders, ...reservations];
  }, [ordersHistory, reservationsHistory]);

  // Active Live Food Delivery Order
  const activeLiveFoodOrder = useMemo(() => {
    return allFoodOrders.find(
      (o) => o.status === "In Kitchen" || o.status === "Picked Up" || o.status === "Confirmed"
    );
  }, [allFoodOrders]);

  // Active / Upcoming Dining Reservation or Dine-In
  const activeDiningExperience = useMemo(() => {
    return allDiningOrders.find(
      (d) => d.status === "Confirmed" || d.status === "In Kitchen"
    );
  }, [allDiningOrders]);

  // Filtered & Sorted Display Items
  const displayItems = useMemo(() => {
    let list = [];
    const q = searchQuery.trim().toLowerCase();

    if (mainSection === "food") {
      list = allFoodOrders
        .filter((ord) => {
          // Tab Filtering
          if (foodTab === "active") {
            const isActive =
              ord.status === "In Kitchen" ||
              ord.status === "Confirmed" ||
              ord.status === "Picked Up";
            if (!isActive) return false;
          } else if (foodTab === "delivery") {
            if (ord.orderMode && ord.orderMode !== "delivery") return false;
          } else if (foodTab === "takeaway") {
            if (ord.orderMode !== "takeaway") return false;
          } else if (foodTab === "delivered") {
            if (ord.status !== "Delivered" && ord.status !== "Completed") return false;
          }

          // Query Search
          if (q) {
            const matchesId = ord.id.toLowerCase().includes(q);
            const matchesDate = ord.date.toLowerCase().includes(q);
            const matchesAddr = ord.deliveryAddress?.toLowerCase().includes(q);
            const matchesItems = ord.items?.some((it) =>
              it.title.toLowerCase().includes(q)
            );
            return matchesId || matchesDate || matchesAddr || matchesItems;
          }
          return true;
        })
        .map((o) => ({ ...o, _cardType: "order" }));
    } else {
      // Dining Section
      list = allDiningOrders.filter((item) => {
        // Tab Filtering
        if (diningTab === "dinein") {
          if (item._cardType !== "order" || item.orderMode !== "dinein") return false;
        } else if (diningTab === "reservations") {
          if (item._cardType !== "reservation") return false;
        } else if (diningTab === "upcoming") {
          if (item.status !== "Confirmed" && item.status !== "In Kitchen") return false;
        } else if (diningTab === "completed") {
          if (item.status !== "Completed" && item.status !== "Delivered") return false;
        }

        // Query Search
        if (q) {
          const matchesId = item.id?.toLowerCase().includes(q);
          const matchesDate = item.date?.toLowerCase().includes(q);
          const matchesZone = item.zone?.toLowerCase().includes(q);
          const matchesGuest = item.guestName?.toLowerCase().includes(q);
          const matchesTable = item.tableNumber?.toLowerCase().includes(q);
          const matchesItems = item.items?.some((it) =>
            it.title.toLowerCase().includes(q)
          );
          return matchesId || matchesDate || matchesZone || matchesGuest || matchesTable || matchesItems;
        }
        return true;
      });
    }

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "price_desc") return (b.total || 0) - (a.total || 0);
      if (sortBy === "price_asc") return (a.total || 0) - (b.total || 0);
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id); // default newest
    });
  }, [mainSection, allFoodOrders, allDiningOrders, foodTab, diningTab, searchQuery, sortBy]);

  // Counts
  const foodOrdersCount = allFoodOrders.length;
  const diningOrdersCount = allDiningOrders.length;
  const activeFoodCount = allFoodOrders.filter(
    (o) => o.status === "In Kitchen" || o.status === "Confirmed" || o.status === "Picked Up"
  ).length;
  const activeDiningCount = allDiningOrders.filter(
    (d) => d.status === "Confirmed" || d.status === "In Kitchen"
  ).length;
  const dineInCount = (ordersHistory || []).filter((o) => o.orderMode === "dinein").length;
  const reservationsCount = (reservationsHistory || []).length;

  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24 sm:pb-28">
      {/* Floating Reorder Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md mx-auto sm:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900 text-white shadow-2xl flex items-center justify-between gap-3 border border-zinc-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-bold truncate">{toastMessage}</span>
            </div>
            <Link
              href="/cart"
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black transition-colors shrink-0"
            >
              Cart &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-zinc-400 mb-1">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <Link href="/profile" className="hover:text-rose-600 transition-colors">
                Profile
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-rose-600 font-bold">
                {mainSection === "food" ? "Food Orders" : "Dining Orders"}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">
                {mainSection === "food" ? "Food Orders & Delivery" : "Dining Orders & Table Bookings"}
              </h1>
              {mainSection === "food" && activeFoodCount > 0 && (
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-600 animate-ping"></span>
                  <span>{activeFoodCount} Live in Kitchen</span>
                </span>
              )}
              {mainSection === "dining" && activeDiningCount > 0 && (
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeDiningCount} Upcoming Table</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {mainSection === "food"
                ? "Live GPS tracking, contactless doorstep drop-offs & takeaway pickups."
                : "Table service dine-in food orders, advance restaurant reservations & VIP dining passes."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={mainSection === "food" ? "/menu" : "/reserve"}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-[11px] sm:text-xs md:text-sm font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              {mainSection === "food" ? (
                <>
                  <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Explore Menu</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Reserve Table</span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* ====================================================
            PRIMARY SECTION TOGGLE (Food Orders vs Dining Orders)
        ==================================================== */}
        <div className="flex items-center justify-center sm:justify-start">
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-200/80 border border-zinc-300/70 shadow-xs max-w-md w-full sm:w-auto">
            <button
              onClick={() => {
                setMainSection("food");
                setFoodTab("all");
              }}
              className={`flex-1 sm:flex-initial py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mainSection === "food"
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Utensils className="w-4 h-4 text-rose-600" />
              <span>🍲 Food Orders ({foodOrdersCount})</span>
            </button>

            <button
              onClick={() => {
                setMainSection("dining");
                setDiningTab("all");
              }}
              className={`flex-1 sm:flex-initial py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mainSection === "dining"
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>🍽️ Dining Orders ({diningOrdersCount})</span>
            </button>
          </div>
        </div>

        {/* ====================================================
            A. ACTIVE HIGHLIGHT BANNER FOR FOOD ORDERS
        ==================================================== */}
        {mainSection === "food" && activeLiveFoodOrder && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white p-4 sm:p-6 shadow-xl shadow-rose-600/15 border border-rose-400/30">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Dispatch
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-rose-100 font-mono">
                    #{activeLiveFoodOrder.id}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
                  {activeLiveFoodOrder.status === "In Kitchen"
                    ? "👨‍🍳 Chef is Preparing Your Feast"
                    : activeLiveFoodOrder.status === "Picked Up"
                    ? "🛵 Your Food is On The Way!"
                    : "✨ Order Confirmed & In Cooking Queue"}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-rose-100/90 font-medium max-w-xl">
                  {activeLiveFoodOrder.items?.map((it) => `${it.quantity}x ${it.title}`).join(", ")} •{" "}
                  {activeLiveFoodOrder.deliveryAddress || "Midtown Manhattan, NY"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setHelpOrder(activeLiveFoodOrder)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Support</span>
                </button>
                <Link
                  href={`/orders/track?id=${activeLiveFoodOrder.id}`}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-[11px] sm:text-xs md:text-sm font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Live GPS Map &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            B. ACTIVE HIGHLIGHT BANNER FOR DINING ORDERS
        ==================================================== */}
        {mainSection === "dining" && activeDiningExperience && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-700 via-rose-800 to-amber-600 text-white p-4 sm:p-6 shadow-xl shadow-amber-500/15 border border-amber-400/30">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Confirmed Dining Experience
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-amber-100 font-mono">
                    #{activeDiningExperience.id}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
                  {activeDiningExperience.zone || "Reserved Table"} • {activeDiningExperience.tableNumber || "Main Dining Hall"}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-amber-100/90 font-medium max-w-xl">
                  {activeDiningExperience.guests ? `${activeDiningExperience.guests} Guests • ` : ""}
                  {activeDiningExperience.date || "Tonight"} • {activeDiningExperience.occasion || "Pure Satvik Hospitality"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setInvoiceOrder(activeDiningExperience)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 text-[11px] sm:text-xs md:text-sm font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                  <span>View Booking Pass</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Sub-Filter Toolbar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-zinc-200/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 sm:top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mainSection === "food"
                    ? "Search food orders by Dish name, Order ID (e.g. ORD-98421)..."
                    : "Search dining orders by Table #, Zone, Reservation ID (e.g. RES-78219)..."
                }
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 sm:top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-[11px] sm:text-xs font-bold text-zinc-500 shrink-0 hidden sm:inline">
                Sort By:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Total: High to Low</option>
                <option value="price_asc">Total: Low to High</option>
              </select>
            </div>
          </div>

          {/* Sub-Filter Tabs for Food Orders */}
          {mainSection === "food" && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "all", label: `All Food Orders (${foodOrdersCount})` },
                { id: "active", label: `🛵 Live Dispatch (${activeFoodCount})` },
                { id: "delivery", label: "🏡 Home Delivery" },
                { id: "takeaway", label: "🥡 Takeaway Pickup" },
                { id: "delivered", label: "✅ Delivered" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFoodTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    foodTab === tab.id
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Sub-Filter Tabs for Dining Orders */}
          {mainSection === "dining" && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "all", label: `All Dining (${diningOrdersCount})` },
                { id: "dinein", label: `🍽️ Table Dine-In (${dineInCount})` },
                { id: "reservations", label: `🪑 Table Bookings (${reservationsCount})` },
                { id: "upcoming", label: `✨ Upcoming (${activeDiningCount})` },
                { id: "completed", label: "✅ Past & Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDiningTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    diningTab === tab.id
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orders / Dining Listing */}
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-zinc-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-rose-100/70 border border-rose-200 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              {mainSection === "food" ? "🍲" : "🍽️"}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-zinc-900">
                {mainSection === "food" ? "No Food Orders Found" : "No Dining Orders Found"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No matching records found for "${searchQuery}". Try a different keyword.`
                  : mainSection === "food"
                  ? "You don't have any food delivery or takeaway orders in this category yet."
                  : "You don't have any dining table orders or reservations in this category yet."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5 sm:gap-3">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    if (mainSection === "food") setFoodTab("all");
                    else setDiningTab("all");
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href={mainSection === "food" ? "/menu" : "/reserve"}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                {mainSection === "food" ? "Explore Pure Veg Menu" : "Book a Table Now"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {displayItems.map((item) => (
              <div key={item.id} id={`order-${item.id}`}>
                <HistoryCard
                  type={item._cardType}
                  item={item}
                  onReorder={handleReorder}
                  onAddSingleDish={handleSingleDishReorder}
                  onOpenInvoice={setInvoiceOrder}
                  onOpenRating={handleOpenRating}
                  onOpenHelp={setHelpOrder}
                  onCancelReservation={cancelReservation}
                  onBookAgain={() => router.push("/reserve")}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================
          TAX INVOICE MODAL
      ==================================================== */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black">Official Tax Invoice</h3>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Printable Invoice / Voucher Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs sm:text-sm text-zinc-700">
              {/* Restaurant Header */}
              <div className="text-center pb-3.5 sm:pb-4 border-b border-zinc-200 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm md:text-base font-black text-zinc-900">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    🌿
                  </span>
                  <span>TASTORA PURE VEG RESTAURANT</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                  42 Flavor Street, Midtown Manhattan, NY 10001
                </p>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                  GSTIN: 27AABCP1234F1Z8 • FSSAI Lic: 11521019000342
                </p>
              </div>

              {/* Order / Reservation Meta */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-200 text-xs sm:text-sm">
                <div>
                  <span className="text-zinc-400 block text-[9px] sm:text-[10px]">
                    {invoiceOrder.type === "reservation" ? "Voucher / Ref ID:" : "Invoice Number:"}
                  </span>
                  <span className="font-mono font-bold text-zinc-900 text-xs sm:text-sm">{invoiceOrder.id}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] sm:text-[10px]">Date &amp; Time:</span>
                  <span className="font-medium text-zinc-900 text-xs sm:text-sm">{invoiceOrder.date}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-zinc-400 block text-[9px] sm:text-[10px]">
                    {invoiceOrder.type === "reservation" ? "Reserved For:" : "Billed To:"}
                  </span>
                  <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                    {invoiceOrder.guestName || userProfile?.name || "Ishaan Sharma"}
                  </span>
                  <p className="text-[10px] sm:text-xs text-zinc-500 truncate">
                    {invoiceOrder.deliveryAddress || "42 Flavor Street, Manhattan, NY"}
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              {invoiceOrder.type === "reservation" ? (
                <div className="space-y-2">
                  <div className="flex justify-between font-black uppercase text-[9px] sm:text-[10px] text-zinc-400 pb-1 border-b border-zinc-100">
                    <span>Dining Experience</span>
                    <span>Amount</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    <div className="py-2 flex justify-between items-center text-xs sm:text-sm">
                      <div>
                        <p className="font-bold text-zinc-900">{invoiceOrder.zone || "Dining Hall"}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                          {invoiceOrder.guests || 2} Guests Cover @ ${invoiceOrder.coverPricePerGuest || 20}/cover
                        </p>
                      </div>
                      <span className="font-mono font-bold text-zinc-900">
                        ${((invoiceOrder.guests || 2) * (invoiceOrder.coverPricePerGuest || 20)).toFixed(2)}
                      </span>
                    </div>

                    {invoiceOrder.addOnTotal > 0 && (
                      <div className="py-2 flex justify-between items-center text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-zinc-900">Add-on Experiences &amp; Setups</p>
                          <p className="text-[10px] sm:text-xs text-zinc-400">
                            {invoiceOrder.addOns?.join(", ") || "Special Add-ons"}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-zinc-900">
                          +${invoiceOrder.addOnTotal?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between font-black uppercase text-[9px] sm:text-[10px] text-zinc-400 pb-1 border-b border-zinc-100">
                    <span>Item Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {invoiceOrder.items?.map((it, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-zinc-900">{it.title}</p>
                          <p className="text-[10px] sm:text-xs text-zinc-400">
                            {it.quantity} x ${it.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-zinc-900">
                          ${(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Calculations */}
              <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-right text-xs sm:text-sm">
                {invoiceOrder.type === "reservation" ? (
                  <>
                    <div className="flex justify-between">
                      <span>Hospitality Taxes:</span>
                      <span className="font-mono">${invoiceOrder.taxes?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-xs sm:text-sm md:text-base text-zinc-900">
                      <span>Total Paid ({invoiceOrder.paymentMethod}):</span>
                      <span className="text-rose-600 font-mono">${invoiceOrder.total?.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Item Subtotal:</span>
                      <span className="font-mono font-bold">${invoiceOrder.itemTotal?.toFixed(2)}</span>
                    </div>
                    {invoiceOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount Savings:</span>
                        <span className="font-mono">-${invoiceOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery &amp; Packaging:</span>
                      <span className="font-mono">
                        {invoiceOrder.deliveryFee === 0 ? "FREE" : `$${invoiceOrder.deliveryFee?.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restaurant GST &amp; Taxes (8.5%):</span>
                      <span className="font-mono">${invoiceOrder.taxes?.toFixed(2)}</span>
                    </div>
                    {invoiceOrder.tip > 0 && (
                      <div className="flex justify-between text-amber-600 font-bold">
                        <span>Rider Tip:</span>
                        <span className="font-mono">+${invoiceOrder.tip?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-xs sm:text-sm md:text-base text-zinc-900">
                      <span>Total Paid ({invoiceOrder.paymentMethod}):</span>
                      <span className="text-rose-600 font-mono">${invoiceOrder.total?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-[9px] sm:text-[10px] text-zinc-400">
                This is a computer-generated tax invoice / voucher. 100% Pure Vegetarian Certified.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3.5 sm:p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => window.print()}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-zinc-900 text-white text-[11px] sm:text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          RATING & REVIEW MODAL
      ==================================================== */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <h3 className="text-sm sm:text-base font-black">Rate Your Pure Veg Experience</h3>
              </div>
              <button
                onClick={() => setRatingOrder(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRating} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="text-center space-y-1">
                <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Order: {ratingOrder.id}
                </p>
                <p className="text-xs sm:text-sm font-black text-zinc-900">
                  How was the taste and freshness?
                </p>
              </div>

              {/* 5-Star Interactive Selector */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 sm:py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1 sm:p-1.5 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${
                        star <= selectedRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Compliment Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 block text-center">
                  What did you love the most?
                </span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {[
                    "Super Fresh 🌿",
                    "Authentic Flavors 👑",
                    "Steaming Hot ♨️",
                    "Perfect Spice Level 🌶️",
                    "Crispy Naans 🫓",
                    "Fast Delivery ⚡",
                  ].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleRatingTag(tag)}
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white shadow-xs scale-105"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Feedback Textarea */}
              <div className="space-y-1">
                <textarea
                  rows="3"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share any special compliments for our Chef..."
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                />
              </div>

              {ratingSuccess && (
                <p className="text-center text-xs sm:text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for your rating!</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          HELP & SUPPORT / ORDER ISSUE RESOLUTION MODAL
      ==================================================== */}
      {helpOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black">24/7 Pure Veg Care Concierge</h3>
              </div>
              <button
                onClick={() => setHelpOrder(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleHelpSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-rose-600 tracking-wider">
                    {helpOrder.type === "reservation" ? "Table Booking Ref" : "Order Reference"}
                  </span>
                  <p className="font-mono font-black text-xs sm:text-sm text-zinc-900">{helpOrder.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 block">Status</span>
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-700">{helpOrder.status}</span>
                </div>
              </div>

              {/* Select Issue Type */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-zinc-700 block">
                  What can we help you with?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "delay", label: "⏱️ Delivery Delay" },
                    { id: "missing", label: "🍱 Missing / Wrong Item" },
                    { id: "quality", label: "🌿 Food Freshness / Taste" },
                    { id: "rider", label: "🛵 Rider Assistance" },
                    { id: "billing", label: "💳 Billing / Coupon Query" },
                    { id: "other", label: "💬 Other Questions" },
                  ].map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setHelpIssueType(issue.id)}
                      className={`p-2 sm:p-2.5 rounded-xl text-left text-[10px] sm:text-[11px] font-bold border transition-all cursor-pointer ${
                        helpIssueType === issue.id
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-zinc-700 block">
                  Describe your concern:
                </label>
                <textarea
                  rows="3"
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="Provide any additional details for instant resolution..."
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                />
              </div>

              {/* Quick Contact Options */}
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="tel:+18007873834"
                  className="flex-1 py-2 sm:py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Call Concierge</span>
                </a>
                <button
                  type="submit"
                  className="flex-1 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs md:text-sm font-black text-center shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>

              {helpSuccess && (
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ticket #TCK-{(Math.random() * 90000 + 10000).toFixed(0)} created! We are on it.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

