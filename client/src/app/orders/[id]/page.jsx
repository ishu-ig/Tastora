"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  FileText,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  Utensils,
  Copy,
  CheckCheck,
  Receipt,
  Phone,
  Flame,
  HelpCircle,
  Tag,
  Coins,
  Navigation,
  Printer,
  X,
  Share2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Users,
  Crown,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import api from "../../../lib/axiosInstance";

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const routeParams = useParams();
  // Handle async params or sync params
  const rawId = params ? (typeof params.then === "function" ? use(params).id : params.id) : routeParams?.id;
  const orderId = rawId || "";

  const {
    ordersHistory,
    reservationsHistory,
    reorderPastOrder,
    rateOrder,
    rateReservation,
    addToCart,
    userProfile,
  } = useCart();

  // Find the exact order or reservation from CartContext
  const order = useMemo(() => {
    const foundOrder = (ordersHistory || []).find(
      (o) => String(o.id) === String(orderId) || String(o.dbId) === String(orderId) || String(o.displayId) === String(orderId)
    );
    if (foundOrder) return { ...foundOrder, _cardType: "order" };

    const foundRes = (reservationsHistory || []).find(
      (r) => String(r.id) === String(orderId) || String(r.dbId) === String(orderId)
    );
    if (foundRes) return { ...foundRes, _cardType: "reservation" };

    return null;
  }, [ordersHistory, reservationsHistory, orderId]);

  const isLiveOrder =
    order?.status === "In Kitchen" ||
    order?.status === "Confirmed" ||
    order?.status === "Picked Up";
  const isCompletedOrder = ["delivered", "completed", "served"].includes(String(order?.status || "").toLowerCase());
  const hasOrderComment = Boolean(order?.commentRewarded || order?.customerComment || order?.ratingGiven);
  const hasDeliveryRating = Boolean(order?.deliveryRatingRewarded || order?.deliveryRating);

  // Modal States
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingMode, setRatingMode] = useState("food");
  const [selectedRating, setSelectedRating] = useState(order?.ratingGiven || 5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackText, setFeedbackText] = useState(order?.feedback || "");
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [coinRewardNotice, setCoinRewardNotice] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpIssueType, setHelpIssueType] = useState("delay");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSuccess, setHelpSuccess] = useState(false);
  const [lookupTimedOut, setLookupTimedOut] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLookupTimedOut(true), 4000);
    return () => window.clearTimeout(timeout);
  }, [orderId]);

  const handleCopyId = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(order.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReorderAll = () => {
    reorderPastOrder(order);
    setToastMessage(`Added all ${order.items?.length || 0} items from ${order.id} to cart!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleAddSingleDish = (dish) => {
    addToCart(dish, 1);
    setToastMessage(`Added 1x ${dish.title} to cart!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveRating = async (e) => {
    e.preventDefault();
    const comment = ratingMode === "food"
      ? [...selectedTags, feedbackText.trim()].filter(Boolean).join(" • ")
      : feedbackText.trim();
    if (!order.dbId) {
      setRatingError("This order is not linked to a saved order record.");
      return;
    }
    if (ratingMode === "food" && comment.trim().length < 5) {
      setRatingError("Write at least 5 characters so we can reward your food comment.");
      return;
    }
    if (ratingMode === "delivery" && !order.deliveryBoyAssigned) {
      setRatingError("A delivery partner is not assigned to this order.");
      return;
    }

    setRatingError("");
    setRatingSubmitting(true);
    try {
      const response = ratingMode === "food"
        ? await api.post(`/checkout/${encodeURIComponent(order.dbId)}/comment`, {
            rating: selectedRating,
            comment,
          })
        : await api.post(`/checkout/${encodeURIComponent(order.dbId)}/delivery-rating`, {
            rating: selectedRating,
            feedback: feedbackText.trim(),
          });
      if (response.data?.result !== "Done") {
        throw new Error(response.data?.reason || `Could not save your ${ratingMode === "food" ? "food comment" : "delivery rating"}.`);
      }

      const result = response.data.data || {};
      if (ratingMode === "food") {
        rateOrder(order.id, selectedRating, comment);
        setCoinRewardNotice(`You earned ${result.customerCoinsAdded ?? 5} CreditCoins.`);
      } else {
        setCoinRewardNotice(`Your delivery partner earned ${result.deliveryBoyCoinsAdded ?? 10} CreditCoins.`);
      }
      setRatingSuccess(true);
      setTimeout(() => {
        setShowRatingModal(false);
        setRatingSuccess(false);
        setFeedbackText("");
        router.refresh();
      }, 2200);
    } catch (error) {
      setRatingError(error.response?.data?.reason || error.message || `Could not save your ${ratingMode === "food" ? "food comment" : "delivery rating"}.`);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    setHelpSuccess(true);
    setTimeout(() => {
      setShowHelpModal(false);
      setHelpSuccess(false);
      setHelpMessage("");
    }, 2000);
  };

  const toggleRatingTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (!order) {
    return (
      <main className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          {!lookupTimedOut ? (
            <>
              <span className="mx-auto block h-8 w-8 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
              <p className="text-sm font-semibold text-zinc-600">Loading order details...</p>
            </>
          ) : (
            <>
              <Package className="mx-auto h-8 w-8 text-zinc-400" />
              <h1 className="text-lg font-black text-zinc-900">Order not found</h1>
              <p className="text-sm text-zinc-500">This order may not be available for the current account.</p>
              <Link href="/orders" className="inline-flex text-sm font-bold text-rose-600 hover:text-rose-700">
                Back to orders
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24 sm:pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md mx-auto sm:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900 text-white shadow-2xl flex items-center justify-between gap-3 border border-zinc-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate">{toastMessage}</span>
            </div>
            <Link
              href="/cart"
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors shrink-0"
            >
              Cart &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
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
              <Link href="/orders" className="hover:text-rose-600 transition-colors">
                {order._cardType === "reservation" || order.orderMode === "dinein" ? "Dining Orders" : "Food Orders"}
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-rose-600 font-bold">
                {order._cardType === "reservation" ? "Table Booking Details" : "Order Details"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                {order._cardType === "reservation" ? `Table Booking #${order.id}` : `Order #${order.id}`}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                  order.status === "Delivered" || order.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : isLiveOrder
                    ? "bg-rose-100 text-rose-800"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {isLiveOrder && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                )}
                {(order.status === "Delivered" || order.status === "Completed") && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{order.status}</span>
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isLiveOrder && order._cardType !== "reservation" && (
              <Link
                href={`/orders/track?id=${order.id}`}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Live GPS Map &rarr;</span>
              </Link>
            )}
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Receipt className="w-4 h-4 text-zinc-500" />
              <span>{order._cardType === "reservation" ? "Digital Pass / Voucher" : "Tax Invoice"}</span>
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-zinc-500" />
              <span>Need Help?</span>
            </button>
          </div>
        </div>

        {/* Live Active Notice for Food Orders (if live) */}
        {isLiveOrder && order._cardType !== "reservation" && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-rose-600/15 border border-rose-400/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Order in Progress
                </span>
                <span className="text-xs font-mono text-rose-100">
                  ETA: {order.eta || "18-22 mins"}
                </span>
              </div>
              <p className="text-sm sm:text-base font-black text-white">
                {order.status === "In Kitchen"
                  ? "👨‍🍳 Chef is handcrafting your dishes in 100% Pure Veg Kitchen"
                  : order.status === "Picked Up"
                  ? "🛵 Rider has picked up your sealed hot-bag and is on the way"
                  : "✨ Order Confirmed & Cooking in Progress"}
              </p>
            </div>

            <Link
              href={`/orders/track?id=${order.id}`}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Track Live Rider &rarr;</span>
            </Link>
          </div>
        )}

        {/* Main Content Grid: Left (Items & Details) vs Right (Billing & Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ====================================================
              LEFT COLUMN (7 Cols): Items List & Dining/Delivery Info
          ==================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. RESERVATION SPECIALIZED DINING CARD */}
            {order._cardType === "reservation" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">
                      Table Reservation &amp; Dining Zone
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    {order.tableNumber || "Reserved Table"}
                  </span>
                </div>

                {/* Zone Photo & Overview */}
                <div className="relative rounded-2xl overflow-hidden border border-rose-200 shadow-2xs h-44 sm:h-52">
                  <img
                    src={order.zoneImage || "/img/dining/royal-courtyard.jpg"}
                    alt={order.zone}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider w-fit mb-1">
                      {order.zone}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {order.tableNumber || "Main Dining Courtyard"}
                    </h3>
                  </div>
                </div>

                {/* Reservation Key Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Guests</span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs sm:text-sm mt-0.5">
                      <Users className="w-4 h-4 text-rose-600" />
                      <span>{order.guests} Guests</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Time Slot</span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs sm:text-sm mt-0.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="truncate">{order.slots?.join(", ") || order.date}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Occasion</span>
                    <div className="font-bold text-zinc-900 text-xs sm:text-sm mt-0.5 truncate">
                      {order.occasion || "Celebration"}
                    </div>
                  </div>
                </div>

                {/* Dietary & Add-ons */}
                {(order.dietary || (order.addOns && order.addOns.length > 0)) && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-2 text-xs">
                    {order.dietary && (
                      <div className="flex items-center gap-2 text-zinc-800">
                        <span className="font-bold text-rose-800">Dietary Preference:</span>
                        <span>{order.dietary}</span>
                      </div>
                    )}
                    {order.addOns && order.addOns.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-rose-800 block">Experience Add-ons:</span>
                        <ul className="list-disc list-inside text-zinc-700 space-y-0.5">
                          {order.addOns.map((add, i) => (
                            <li key={i}>{add}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {order.specialNotes && (
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700">
                    <span className="font-bold text-zinc-900 block mb-0.5">Hospitality Desk Note:</span>
                    <p className="italic">"{order.specialNotes}"</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. ORDERED FOOD DISHES (For Food Orders or Dine-In with items) */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-rose-600" />
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">
                      {order.orderMode === "dinein" ? "Dine-In Table Dishes" : "Ordered Dishes"} ({order.items.length} Items)
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>+{Math.floor((order.total || 0) * 2)} CreditCoins Earned</span>
                  </span>
                </div>

                {/* Item List */}
                <div className="divide-y divide-zinc-100">
                  {order.items.map((dish, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200 shadow-2xs">
                          <img
                            src={dish.image}
                            alt={dish.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded bg-white border border-emerald-600 flex items-center justify-center shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                            {dish.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span>
                              Quantity: <strong className="text-zinc-800">{dish.quantity}x</strong>
                            </span>
                            <span>•</span>
                            <span className="font-mono font-bold text-zinc-900">
                              ${dish.price.toFixed(2)} each
                            </span>
                          </div>
                          {dish.note && (
                            <p className="text-[11px] text-rose-700 italic truncate mt-0.5">
                              Special Note: "{dish.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-black text-xs sm:text-sm text-zinc-900">
                          ${(dish.price * dish.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSingleDish(dish)}
                          title={`Add 1x ${dish.title} to cart`}
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-600 hover:text-white text-zinc-700 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rate & Review Badge / Action */}
                <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {order.ratingGiven ? (
                    <div className="flex items-center gap-2 text-xs text-amber-950 font-bold">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < order.ratingGiven ? "fill-amber-400" : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span>Rated {order.ratingGiven}/5</span>
                      {order.feedback && (
                        <span className="text-zinc-500 font-normal italic truncate max-w-xs">
                          "{order.feedback}"
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Food rating: {order.customerRating || "Not rated"}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {isCompletedOrder && !hasOrderComment && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingMode("food");
                          setSelectedRating(order.customerRating || 5);
                          setFeedbackText("");
                          setRatingError("");
                          setCoinRewardNotice("");
                          setShowRatingModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Rate food • +5 coins
                      </button>
                    )}
                    {hasOrderComment && <span className="self-center text-[11px] font-bold text-emerald-700">Food comment submitted</span>}
                    {isCompletedOrder && order.deliveryBoyAssigned && !hasDeliveryRating && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingMode("delivery");
                          setSelectedRating(order.deliveryRating || 5);
                          setFeedbackText("");
                          setSelectedTags([]);
                          setRatingError("");
                          setCoinRewardNotice("");
                          setShowRatingModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Rate delivery • +10 coins
                      </button>
                    )}
                    {hasDeliveryRating && (
                      <span className="self-center text-[11px] font-bold text-sky-700">Delivery rated {order.deliveryRating}/5</span>
                    )}
                    {!isCompletedOrder && <span className="self-center text-[11px] text-zinc-400">Ratings available after delivery</span>}
                  </div>
                </div>
              </div>
            )}

            {/* 3. DELIVERY & DESTINATION ADDRESS CARD (For Food Delivery/Takeaway) */}
            {order._cardType !== "reservation" && order.orderMode !== "dinein" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <h2 className="text-sm sm:text-base font-black text-zinc-900">
                    {order.orderMode === "takeaway" ? "Takeaway Pickup Counter" : "Delivery Destination & Instructions"}
                  </h2>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block">
                      {order.orderMode === "takeaway" ? "Pickup Customer:" : "Delivering To:"}
                    </span>
                    <p className="font-bold text-zinc-900 mt-0.5">
                      {order.guestName || userProfile?.name || "Ishaan Sharma"}
                    </p>
                    <p className="text-zinc-600 mt-0.5">
                      {order.deliveryAddress || "42 Flavor Street, Midtown Manhattan, NY 10001"}
                    </p>
                  </div>

                  {order.deliveryInstruction && (
                    <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-zinc-700">
                      <span className="text-rose-800 font-bold block text-[11px]">
                        Rider Delivery Note:
                      </span>
                      <p className="italic text-xs mt-0.5">
                        "{order.deliveryInstruction}"
                      </p>
                    </div>
                  )}

                  {order.driverName && (
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                          🛵
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-xs">{order.driverName}</p>
                          <p className="text-[10px] text-zinc-400">Assigned Delivery Partner</p>
                        </div>
                      </div>

                      {order.driverPhone && (
                        <a
                          href={`tel:${order.driverPhone}`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-rose-600" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ====================================================
              RIGHT COLUMN (5 Cols): Bill Breakdown & Security
          ==================================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment & Bill Summary Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-600" />
                  <h2 className="text-sm sm:text-base font-black text-zinc-900">
                    Bill Summary
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-zinc-500 font-mono">
                  {order.paymentMethod || "Verified"}
                </span>
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm text-zinc-600">
                {order._cardType === "reservation" ? (
                  <>
                    <div className="flex justify-between">
                      <span>Cover Deposit ({order.guests} Guests × ${order.coverPricePerGuest || 20}):</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        ${((order.guests || 2) * (order.coverPricePerGuest || 20)).toFixed(2)}
                      </span>
                    </div>

                    {order.addOnTotal > 0 && (
                      <div className="flex justify-between text-zinc-800 font-medium">
                        <span>Experience Add-ons Total:</span>
                        <span className="font-mono">${order.addOnTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Hospitality Taxes &amp; GST:</span>
                      <span className="font-mono text-zinc-900">${(order.taxes || 0).toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex justify-between font-black text-sm sm:text-base text-zinc-900">
                      <span>Total Deposit Paid:</span>
                      <span className="text-rose-600 font-mono">${order.total?.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Item Subtotal:</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        ${order.itemTotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Savings {order.couponApplied ? `(${order.couponApplied})` : ""}:</span>
                        <span className="font-mono">-${order.discount.toFixed(2)}</span>
                      </div>
                    )}

                    {order.coinsDiscount > 0 && (
                      <div className="flex justify-between text-amber-600 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          CreditCoins ({order.coinsUsed || Math.round(order.coinsDiscount * 50)} used):
                        </span>
                        <span className="font-mono font-bold">-₹{order.coinsDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery &amp; Packaging:</span>
                      <span className="font-mono text-zinc-900">
                        {order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee?.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Restaurant GST &amp; Taxes (8.5%):</span>
                      <span className="font-mono text-zinc-900">${order.taxes?.toFixed(2)}</span>
                    </div>

                    {order.tip > 0 && (
                      <div className="flex justify-between text-amber-600 font-semibold">
                        <span>Rider Tip:</span>
                        <span className="font-mono">+${order.tip?.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-zinc-100 flex justify-between font-black text-sm sm:text-base text-zinc-900">
                      <span>Total Amount Paid:</span>
                      <span className="text-rose-600 font-mono">${order.total?.toFixed(2)}</span>
                    </div>

                    {(order.creditCoinsEarned > 0 || Math.floor((Number(order.itemTotal) || 0) * 0.10) > 0) && (
                      <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🪙</span>
                          <div>
                            <p className="font-bold text-amber-950">CreditCoins Earned</p>
                            <p className="text-[10px] text-amber-800">10% cashback added to your balance</p>
                          </div>
                        </div>
                        <span className="font-mono font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full text-xs">
                          +{order.creditCoinsEarned || Math.floor((Number(order.itemTotal) || 0) * 0.10)} Coins
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Primary Action Button */}
              {order._cardType === "reservation" ? (
                <Link
                  href="/reserve"
                  className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-amber-600 text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-zinc-900/10 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Reserve Table Again</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleReorderAll}
                  className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-rose-600 text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-zinc-900/10 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reorder Entire Meal</span>
                </button>
              )}
            </div>

            {/* 100% Satvik Pure Veg Guarantee Badge */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>100% Pure Vegetarian Certified</span>
              </div>
              <p className="text-emerald-800/90 leading-relaxed text-[11px] sm:text-xs">
                Prepared in a dedicated Satvik commercial kitchen with zero non-veg contact. Sealed with tamper-proof thermal packaging to preserve aroma and warmth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          TAX INVOICE MODAL
      ==================================================== */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200">
            <div className="p-4 sm:p-5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black">Tax Invoice</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-700">
              <div className="text-center pb-3 border-b border-zinc-200 space-y-1">
                <p className="font-black text-sm text-zinc-900">🌿 TASTORA PURE VEG RESTAURANT</p>
                <p className="text-[10px] text-zinc-500">42 Flavor Street, Midtown Manhattan, NY 10001</p>
                <p className="text-[9px] text-zinc-400 font-mono">GSTIN: 27AABCP1234F1Z8 • FSSAI Lic: 11521019000342</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Invoice Number:</span>
                  <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Date:</span>
                  <span className="font-medium text-zinc-900">{order.date}</span>
                </div>
              </div>

              <div className="space-y-1.5 divide-y divide-zinc-100">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="pt-1.5 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-900">{it.title}</p>
                      <p className="text-[10px] text-zinc-400">{it.quantity} x ${it.price.toFixed(2)}</p>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-200 space-y-1 text-right text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">${order.itemTotal?.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span className="font-mono">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes &amp; Delivery:</span>
                  <span className="font-mono">${(order.taxes + (order.deliveryFee || 0)).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-sm text-zinc-900">
                  <span>Total Paid:</span>
                  <span className="text-rose-600 font-mono">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => window.print()}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
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
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-white" />
                <h3 className="text-sm sm:text-base font-black">
                  {ratingMode === "food" ? "Rate the food" : `Rate ${order.deliveryBoyName || "your delivery partner"}`}
                </h3>
              </div>
              <button
                onClick={() => setShowRatingModal(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRating} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Order: {order.id}
                </p>
                <p className="text-xs sm:text-sm font-black text-zinc-900">
                  {ratingMode === "food" ? "How was the taste and freshness?" : "How was your delivery experience?"}
                </p>
              </div>

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

              {ratingMode === "food" && <div className="space-y-1.5">
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
              </div>}

              <div className="space-y-1">
                <textarea
                  rows="3"
                  required={ratingMode === "food"}
                  minLength={ratingMode === "food" ? 5 : undefined}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={ratingMode === "food" ? "Comment on the food (at least 5 characters)..." : "Optional delivery feedback..."}
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                />
              </div>

              <p className="text-center text-[11px] font-semibold text-amber-800">
                {ratingMode === "food" ? "Your food comment earns 5 CreditCoins." : "Your delivery partner earns 10 CreditCoins from this rating."}
              </p>

              {ratingError && <p role="alert" className="text-center text-xs font-semibold text-red-600">{ratingError}</p>}
              {coinRewardNotice && ratingSuccess && <p className="text-center text-xs font-bold text-emerald-700">{coinRewardNotice}</p>}

              {ratingSuccess && (
                <p className="text-center text-xs sm:text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for your rating!</span>
                </p>
              )}

              <button
                type="submit"
                disabled={ratingSubmitting || hasOrderComment || !isCompletedOrder}
                className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {ratingSubmitting ? "Submitting..." : hasOrderComment ? "Comment already submitted" : !isCompletedOrder ? "Available after delivery" : "Submit Comment & Earn Coins"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          HELP & SUPPORT CONCIERGE MODAL
      ==================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black">24/7 Pure Veg Care Concierge</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleHelpSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-rose-600 tracking-wider">
                    Order Reference
                  </span>
                  <p className="font-mono font-black text-xs sm:text-sm text-zinc-900">{order.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 block">Status</span>
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-700">{order.status}</span>
                </div>
              </div>

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
                  <span>Ticket created! We are on it.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
