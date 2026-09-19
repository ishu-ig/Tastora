"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Tag,
  Check,
  Percent,
  Clock,
  ShieldCheck,
  Leaf,
  Heart,
  HelpCircle,
  X,
  MessageSquare,
  Gift,
  Coins,
  UtensilsCrossed,
  Utensils,
  Bike,
  Store,
  MapPin,
  Copy,
  CheckCheck,
  Navigation,
  Info,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { fullMenuCatalog } from "../menu/page";

// Frequently Added Items
const frequentlyAdded = [
  {
    id: "ds-1",
    title: "Warm Shahi Gulab Jamun (2 Pcs)",
    price: 6.99,
    category: "Desserts",
    image: "/img/category/gulab-jamun.jpg",
  },
  {
    id: "bv-1",
    title: "Royal Amritsari Malai Lassi",
    price: 5.99,
    category: "Beverages",
    image: "/img/category/beverage-lassi.jpg",
  },
  {
    id: "bv-3",
    title: "Masala Kulhad Chai (Hot)",
    price: 3.99,
    category: "Beverages",
    image: "/img/category/beverage-lassi.jpg",
  },
  {
    id: "ni-8",
    title: "Butter Garlic Naan",
    price: 4.49,
    category: "Tandoori Breads",
    image: "/img/category/dal-makhani.jpg",
  },
];

export default function CartPage() {
  const {
    cartItems,
    itemNotes,
    orderMode,
    setOrderMode,
    tableNumber,
    setTableNumber,
    pickupTime,
    setPickupTime,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadSampleCart,
    setItemCustomNote,
    totalCartCount,
    subtotal,
    freeDeliveryThreshold,
    isFreeDelivery,
    freeDeliveryShortfall,
    deliveryFee,
    appliedCoupon,
    setAppliedCoupon,
    availableCoupons,
    discountAmount,
    deliveryTip,
    setDeliveryTip,
    optOutCutlery,
    setOptOutCutlery,
    deliveryInstruction,
    setDeliveryInstruction,
    useSuperCoins,
    setUseSuperCoins,
    superCoinsBalance,
    superCoinsDiscount,
    taxAmount,
    grandTotal,
    savedAddresses,
    selectedAddressId,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [customTipActive, setCustomTipActive] = useState(false);
  const [customTipValue, setCustomTipValue] = useState("");
  const [activeNoteItemId, setActiveNoteItemId] = useState(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [couponFilter, setCouponFilter] = useState("all");
  const [copiedCouponCode, setCopiedCouponCode] = useState(null);

  // Dine-in Special Requests State
  const [serveTogether, setServeTogether] = useState(true);
  const [extraCutlery, setExtraCutlery] = useState(false);
  const [warmWater, setWarmWater] = useState(false);

  const cartEntries = Object.entries(cartItems);
  const currentAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError("Please enter a valid coupon code");
      return;
    }

    const found = availableCoupons.find((c) => c.code === code);
    if (!found) {
      setCouponError(`Coupon code "${code}" is invalid.`);
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(
        `Minimum order of $${found.minOrder.toFixed(2)} required for code ${code}.`
      );
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(`Coupon ${found.code} applied successfully!`);
    setCouponInput("");
    if (isCouponsModalOpen) {
      setIsCouponsModalOpen(false);
    }
    setTimeout(() => setCouponSuccess(""), 4000);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  const handleCustomTipSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(customTipValue);
    if (!isNaN(val) && val >= 0) {
      setDeliveryTip(val);
      setCustomTipActive(false);
    }
  };

  // Filtered coupons for modal
  const filteredCoupons = (availableCoupons || []).filter((c) => {
    if (couponFilter === "percentage") return !!c.discountPercent;
    if (couponFilter === "flat") return !!c.discountAmount;
    if (couponFilter === "eligible") return subtotal >= c.minOrder;
    return true;
  });

  // ----------------------------------------------------
  // EMPTY CART STATE
  // ----------------------------------------------------
  if (cartEntries.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 pb-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-5xl shadow-inner">
            🍲
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Your Food Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Looks like you haven't added any 100% Pure Vegetarian delicacies yet. Savor our royal curries, crispy dosas, sizzling burgers and fresh desserts!
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Full Menu</span>
            </Link>

            <button
              onClick={loadSampleCart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold shadow-xs hover:border-rose-400 hover:bg-rose-50/70 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Fill Sample Order</span>
            </button>
          </div>

          {/* Pure Veg Assurance */}
          <div className="pt-6 border-t border-zinc-200/70 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Pure Vegetarian Kitchens • Safe &amp; Contactless</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE CART VIEW
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50/70 pt-28 sm:pt-36 lg:pt-40 pb-28 sm:pb-32">
      <div className="w-full max-w-[1700px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-12 space-y-5 sm:space-y-7">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-zinc-400 mb-1 flex-wrap">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link href="/menu" className="hover:text-rose-600 transition-colors">
                Menu
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-rose-600 font-bold">Shopping Cart</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span>Your Cart</span>
              <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] sm:text-xs font-black">
                {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              onClick={loadSampleCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer shadow-2xs"
              title="Reset with sample dishes"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Sample Order</span>
            </button>
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Clear Cart</span>
            </button>
          </div>
        </div>

        {/* ====================================================
            1. ORDER FULFILLMENT MODE SELECTOR (Delivery vs Takeaway vs Dine-In)
        ==================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0"></span>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Choose Dining &amp; Delivery Option:
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-zinc-400">
              {orderMode === "delivery" && "🛵 Fast Doorstep Delivery"}
              {orderMode === "takeaway" && "🥡 Self-Pickup • 0 Delivery Fee"}
              {orderMode === "dinein" && "🍽️ Direct Table Service"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Mode 1: Home Delivery */}
            <button
              type="button"
              onClick={() => setOrderMode("delivery")}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer flex items-center sm:items-start gap-3 ${orderMode === "delivery"
                  ? "bg-gradient-to-br from-rose-600 to-amber-500 text-white border-transparent shadow-lg shadow-rose-500/25 scale-[1.01]"
                  : "bg-zinc-50/80 hover:bg-zinc-100/80 border-zinc-200/90 text-zinc-700"
                }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${orderMode === "delivery"
                    ? "bg-white/20 text-white backdrop-blur-xs"
                    : "bg-rose-100 text-rose-600"
                  }`}
              >
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight">
                    Home Delivery
                  </h3>
                  {orderMode === "delivery" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </div>
                <p
                  className={`text-[11px] font-medium truncate mt-0.5 ${orderMode === "delivery" ? "text-rose-100" : "text-zinc-500"
                    }`}
                >
                  Doorstep in 25-35 mins
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold flex-wrap">
                  {isFreeDelivery ? (
                    <span
                      className={`px-2 py-0.5 rounded-full ${orderMode === "delivery"
                          ? "bg-white/25 text-white"
                          : "bg-emerald-100 text-emerald-800"
                        }`}
                    >
                      FREE DELIVERY
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full ${orderMode === "delivery"
                          ? "bg-white/25 text-white"
                          : "bg-zinc-200 text-zinc-700"
                        }`}
                    >
                      $2.99 Fee (Free &gt;$35)
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Mode 2: Takeaway / Self-Pickup */}
            <button
              type="button"
              onClick={() => setOrderMode("takeaway")}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer flex items-center sm:items-start gap-3 ${orderMode === "takeaway"
                  ? "bg-gradient-to-br from-rose-600 to-amber-500 text-white border-transparent shadow-lg shadow-rose-500/25 scale-[1.01]"
                  : "bg-zinc-50/80 hover:bg-zinc-100/80 border-zinc-200/90 text-zinc-700"
                }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${orderMode === "takeaway"
                    ? "bg-white/20 text-white backdrop-blur-xs"
                    : "bg-amber-100 text-amber-700"
                  }`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight">
                    Takeaway / Pickup
                  </h3>
                  {orderMode === "takeaway" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </div>
                <p
                  className={`text-[11px] font-medium truncate mt-0.5 ${orderMode === "takeaway" ? "text-rose-100" : "text-zinc-500"
                    }`}
                >
                  Pick up at counter • No wait
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full ${orderMode === "takeaway"
                        ? "bg-white/25 text-white"
                        : "bg-emerald-100 text-emerald-800"
                      }`}
                  >
                    $0 DELIVERY FEE
                  </span>
                </div>
              </div>
            </button>

            {/* Mode 3: Dine-In / Table Service */}
            <button
              type="button"
              onClick={() => setOrderMode("dinein")}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer flex items-center sm:items-start gap-3 ${orderMode === "dinein"
                  ? "bg-gradient-to-br from-rose-600 to-amber-500 text-white border-transparent shadow-lg shadow-rose-500/25 scale-[1.01]"
                  : "bg-zinc-50/80 hover:bg-zinc-100/80 border-zinc-200/90 text-zinc-700"
                }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${orderMode === "dinein"
                    ? "bg-white/20 text-white backdrop-blur-xs"
                    : "bg-rose-100 text-rose-600"
                  }`}
              >
                <Utensils className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight">
                    Dine-In Table
                  </h3>
                  {orderMode === "dinein" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </div>
                <p
                  className={`text-[11px] font-medium truncate mt-0.5 ${orderMode === "dinein" ? "text-rose-100" : "text-zinc-500"
                    }`}
                >
                  Direct table dining service
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full ${orderMode === "dinein"
                        ? "bg-white/25 text-white"
                        : "bg-purple-100 text-purple-800"
                      }`}
                  >
                    {tableNumber || "Select Table"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Free Delivery Banner (Shown for Delivery Mode) */}
        {orderMode === "delivery" && (
          <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5 sm:gap-2 text-zinc-900 flex-wrap">
                <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-black">
                    🎉 Congratulations! You unlocked FREE Instant Delivery.
                  </span>
                ) : (
                  <span>
                    Add <span className="text-rose-600 font-black">${freeDeliveryShortfall.toFixed(2)}</span> more to unlock <span className="text-rose-600 font-bold">FREE Delivery</span>!
                  </span>
                )}
              </span>
              <span className="text-zinc-500 font-mono text-[11px] sm:text-xs shrink-0">
                ${subtotal.toFixed(2)} / ${freeDeliveryThreshold.toFixed(2)}
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isFreeDelivery
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500"
                  }`}
                style={{
                  width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Main Cart Content Sections (Full Col-12 Width) */}
        <div className="space-y-5 sm:space-y-7 w-full">
          {/* ==========================================
              1. DISH ITEMS SECTION (Full Col-12)
          ========================================== */}
          <div className="w-full bg-white rounded-3xl p-3.5 sm:p-6 lg:p-7 border border-zinc-200/80 shadow-xs space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-zinc-100">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-zinc-500">
                  Dish Details
                </span>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-zinc-500">
                  Quantity &amp; Total
                </span>
              </div>

              {/* Dish Items List (100% Full-Width Rich Cards) */}
              <div className="space-y-3 sm:space-y-3.5">
                {cartEntries.map(([id, quantity]) => {
                  const dish = fullMenuCatalog.find((d) => d.id === id) || {
                    id,
                    title: "Delicious Gourmet Dish",
                    price: 12.99,
                    image: "/img/category/paneer-tikka.jpg",
                    subCategory: "Specialty",
                    shortDesc: "Freshly prepared pure vegetarian delight with royal spices.",
                  };
                  const note = itemNotes[id] || "";
                  const itemTotal = dish.price * quantity;

                  return (
                    <div
                      key={id}
                      className="w-full bg-zinc-50/60 hover:bg-zinc-50/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 border border-zinc-200/80 hover:border-rose-200 transition-all duration-200 shadow-2xs hover:shadow-xs space-y-2.5 sm:space-y-3 group"
                    >
                      {/* =========================================================
                          MOBILE VIEW (< sm / <640px): Modern Food App 2-Column Card
                      ========================================================= */}
                      <div className="sm:hidden space-y-2.5">
                        {/* Top Row: Dish Info (Left) + Food Photo with Stepper (Right) */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left Column: Veg Badge, Title, Price, Description */}
                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Veg emblem + Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="w-3.5 h-3.5 rounded bg-white border border-emerald-600 flex items-center justify-center shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[9px] font-extrabold uppercase tracking-wide border border-rose-100">
                                {dish.subCategory?.replace("-", " ") || "Pure Veg"}
                              </span>
                              {dish.isChefSpecial && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200/60">
                                  Chef Special
                                </span>
                              )}
                              {dish.rating && (
                                <span className="text-[10px] font-bold text-amber-600">
                                  ★ {dish.rating}
                                </span>
                              )}
                            </div>

                            {/* Dish Title */}
                            <h3 className="text-sm font-black text-zinc-900 leading-snug line-clamp-2">
                              {dish.title}
                            </h3>

                            {/* Short Description */}
                            {dish.shortDesc && (
                              <p className="text-[11px] text-zinc-500 line-clamp-1">
                                {dish.shortDesc}
                              </p>
                            )}

                            {/* Unit Price */}
                            <div className="flex items-center gap-1.5 pt-0.5 font-bold">
                              <span className="text-rose-600 font-black text-sm">
                                ${dish.price.toFixed(2)}
                              </span>
                              {dish.oldPrice && (
                                <span className="text-zinc-400 line-through text-[11px] font-normal">
                                  ${dish.oldPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Dish Image & Quantity Stepper */}
                          <div className="flex flex-col items-center shrink-0 relative">
                            <div className="relative w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200 shadow-2xs">
                              <img
                                src={dish.image}
                                alt={dish.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Overlaid / Compact Stepper Pill */}
                            <div className="-mt-3.5 z-10 flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full px-2 py-1 shadow-md border-2 border-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(id, -1, dish)}
                                className="w-4 h-4 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-black min-w-[14px] text-center font-mono">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(id, 1, dish)}
                                className="w-4 h-4 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Bottom Row: Cooking Note Trigger + Line Total + Delete */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                          {/* Note button */}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveNoteItemId(activeNoteItemId === id ? null : id)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-rose-600 bg-white px-2.5 py-1 rounded-xl border border-zinc-200/80 shadow-2xs cursor-pointer active:scale-95 transition-all"
                          >
                            <MessageSquare className="w-3 h-3 text-rose-500" />
                            <span>{note ? "Edit note" : "+ Cooking note"}</span>
                          </button>

                          {/* Line total & Delete */}
                          <div className="flex items-center gap-2.5">
                            <div className="text-right">
                              <span className="text-[10px] text-zinc-400 font-medium mr-1">
                                Total:
                              </span>
                              <span className="text-sm font-black text-zinc-900 font-mono">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* =========================================================
                          DESKTOP / TABLET VIEW (>= sm / >=640px): Horizontal Wide Row
                      ========================================================= */}
                      <div className="hidden sm:flex sm:items-center justify-between gap-4 w-full">
                        {/* Dish Media & Comprehensive Info */}
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          {/* Dish Image with Veg Emblem */}
                          <div className="relative w-22 h-22 md:w-24 md:h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/80 shadow-2xs group-hover:shadow-sm transition-shadow">
                            <img
                              src={dish.image}
                              alt={dish.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Veg Icon Badge */}
                            <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded bg-white/95 backdrop-blur-xs border border-emerald-600 flex items-center justify-center shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            </div>
                          </div>

                          {/* Text Info */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide border border-rose-100/80">
                                {dish.subCategory?.replace("-", " ") || "Pure Veg"}
                              </span>
                              {dish.isChefSpecial && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60">
                                  Chef Special
                                </span>
                              )}
                              {dish.isJain && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                                  Jain
                                </span>
                              )}
                              {dish.rating && (
                                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                                  ★ {dish.rating}
                                </span>
                              )}
                            </div>

                            {/* Dish Title */}
                            <h3 className="text-base font-bold text-zinc-900 leading-snug group-hover:text-rose-600 transition-colors">
                              {dish.title}
                            </h3>

                            {/* Short Description */}
                            {dish.shortDesc && (
                              <p className="text-xs text-zinc-500 line-clamp-1 max-w-xl font-normal">
                                {dish.shortDesc}
                              </p>
                            )}

                            {/* Unit Price Breakdown & Cooking Note Trigger */}
                            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-rose-600 font-black text-sm">
                                  ${dish.price.toFixed(2)}
                                </span>
                                <span className="text-zinc-400 text-[11px] font-medium">
                                  each
                                </span>
                                {dish.oldPrice && (
                                  <span className="text-zinc-400 line-through text-xs font-normal">
                                    ${dish.oldPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <span className="text-zinc-300">•</span>

                              <button
                                type="button"
                                onClick={() =>
                                  setActiveNoteItemId(activeNoteItemId === id ? null : id)
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-rose-600 transition-colors cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-zinc-200/70 hover:border-rose-200 shadow-2xs"
                              >
                                <MessageSquare className="w-3 h-3 text-rose-500" />
                                <span>{note ? "Edit note" : "+ Cooking note"}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Quantity Stepper, Line Total & Quick Remove */}
                        <div className="flex items-center justify-end gap-5 shrink-0">
                          {/* Stepper */}
                          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full px-2.5 py-1.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(id, -1, dish)}
                              className="w-5 h-5 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-black min-w-[18px] text-center font-mono">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(id, 1, dish)}
                              className="w-5 h-5 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[70px]">
                            <p className="text-base font-black text-zinc-900 font-mono">
                              ${itemTotal.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-medium">
                              {quantity} × ${dish.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                            title="Remove dish from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Custom Cooking Request Note Input Box */}
                      {activeNoteItemId === id && (
                        <div className="pt-1.5">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-rose-200 rounded-2xl p-2 sm:p-2.5 shadow-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MessageSquare className="w-4 h-4 text-rose-500 shrink-0 ml-1" />
                              <input
                                type="text"
                                value={note}
                                onChange={(e) => setItemCustomNote(id, e.target.value)}
                                placeholder="e.g. Mild spice, less oil, no garlic/onion, Jain..."
                                className="w-full bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
                                autoFocus
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveNoteItemId(null)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 text-center"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Saved Note Pill */}
                      {note && activeNoteItemId !== id && (
                        <div className="text-xs text-rose-800 bg-rose-50/90 px-3.5 py-1.5 rounded-xl border border-rose-200/70 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-rose-600 shrink-0">
                              Chef Note:
                            </span>
                            <span className="truncate italic text-zinc-700">"{note}"</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveNoteItemId(id)}
                              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemCustomNote(id, "")}
                              className="text-zinc-400 hover:text-red-500 cursor-pointer"
                              title="Delete note"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add More Items Button */}
              <div className="pt-3 border-t border-zinc-100">
                <Link
                  href="/menu"
                  className="w-full py-3 rounded-2xl bg-zinc-50 hover:bg-rose-50 hover:text-rose-700 text-zinc-700 border border-dashed border-zinc-300 hover:border-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Explore &amp; Add More Dishes</span>
                </Link>
              </div>
            </div>

            {/* ====================================================
                2. DYNAMIC FULFILLMENT SETTINGS (Delivery vs Takeaway vs Dine-In)
            ==================================================== */}
            {orderMode === "delivery" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Delivery Address &amp; Instructions</span>
                  </h3>
                  <Link
                    href="/profile"
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Change Address
                  </Link>
                </div>

                {/* Selected Address Preview */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-zinc-900">
                        {currentAddress?.tag || "Home"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        Delivery in 25-35 mins
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 truncate mt-0.5">
                      {currentAddress?.addressLine || "Flat 4B, Emerald Heights, 42 Flavor Street, NY"}
                    </p>
                  </div>
                </div>

                {/* Delivery Instructions Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Rider Drop-off Instructions:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                    {[
                      { id: "leave-at-door", label: "Leave at door", icon: "🚪" },
                      { id: "dont-ring-bell", label: "Don't ring bell", icon: "🔕" },
                      { id: "call-on-arrival", label: "Call on arrival", icon: "📞" },
                      { id: "hand-to-me", label: "Hand over to me", icon: "🤝" },
                    ].map((inst) => {
                      const isSelected = deliveryInstruction === inst.id;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => setDeliveryInstruction(inst.id)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-center sm:text-left text-xs font-semibold transition-all cursor-pointer flex flex-col items-center sm:items-start gap-1 ${isSelected
                              ? "bg-rose-50 border-rose-500 text-rose-900 shadow-xs"
                              : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                        >
                          <span className="text-lg">{inst.icon}</span>
                          <span className="text-[11px] font-bold">{inst.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cutlery Opt-out Toggle */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 cursor-pointer select-none gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-950 truncate">
                        Opt-out of single-use plastic cutlery
                      </p>
                      <p className="text-[10px] text-emerald-800/80 truncate">
                        Help us preserve the planet 🌿 (Napkins included)
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={optOutCutlery}
                    onChange={(e) => setOptOutCutlery(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 accent-emerald-600 cursor-pointer shrink-0"
                  />
                </label>

                {/* Delivery Tip Selector */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Support your Rider with a Tip:</span>
                    </label>
                    <span className="text-xs text-rose-600 font-bold">
                      {deliveryTip > 0 ? `+$${deliveryTip.toFixed(2)}` : "No tip"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {[0, 1, 2, 3, 5].map((amount) => {
                      const isSelected = deliveryTip === amount && !customTipActive;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setDeliveryTip(amount);
                            setCustomTipActive(false);
                          }}
                          className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                        >
                          {amount === 0 ? "Not now" : `$${amount}`}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCustomTipActive(!customTipActive)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${customTipActive
                          ? "bg-rose-600 text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                    >
                      Custom
                    </button>
                  </div>

                  {customTipActive && (
                    <form
                      onSubmit={handleCustomTipSubmit}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1"
                    >
                      <div className="relative flex-1 min-w-0">
                        <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={customTipValue}
                          onChange={(e) => setCustomTipValue(e.target.value)}
                          placeholder="Enter tip amount"
                          className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer text-center"
                      >
                        Set Tip
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Takeaway / Self-Pickup Mode Panel */}
            {orderMode === "takeaway" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Restaurant Pickup Details</span>
                  </h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black self-start sm:self-auto">
                    $0 EXTRA FEES
                  </span>
                </div>

                {/* Pickup Address Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-zinc-900">
                          Tastora Pure Veg Flagship Kitchen
                        </h4>
                        <p className="text-xs text-zinc-600 mt-0.5 truncate">
                          42 Flavor Street, Midtown Manhattan, NY 10001
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Open Today: 11:00 AM – 11:30 PM</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-amber-600" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>

                {/* Pickup Time Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Estimated Pickup Ready Time:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "Ready in 15-20 mins", label: "Express (15-20 mins)", tag: "FASTER" },
                      { id: "Ready in 30-40 mins", label: "Standard (30-40 mins)" },
                      { id: "Ready in 1 hour", label: "Later (In 1 hour)" },
                    ].map((slot) => {
                      const isSelected = pickupTime === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setPickupTime(slot.id)}
                          className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${isSelected
                              ? "bg-amber-50 border-amber-500 text-amber-950 shadow-xs"
                              : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                        >
                          <span>{slot.label}</span>
                          {slot.tag && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold">
                              {slot.tag}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pickup Counter Note */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    Show your Order ID at <strong>Pickup Counter #2</strong> to collect your steaming hot order.
                  </span>
                </div>
              </div>
            )}

            {/* Dine-In / Table Service Mode Panel */}
            {orderMode === "dinein" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-rose-500" />
                    <span>Dine-In Table Selection</span>
                  </h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black self-start sm:self-auto">
                    TABLE SERVICE
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3">
                  <div>
                    <label className="text-xs font-black text-zinc-900 block mb-1.5">
                      Select Your Table Number:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {["Table 01", "Table 04", "Table 07", "Table 12", "Table 15", "Table 21"].map((tbl) => {
                        const isSelected = tableNumber === tbl;
                        return (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => setTableNumber(tbl)}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${isSelected
                                ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs scale-102"
                                : "bg-white border border-rose-200 text-zinc-700 hover:bg-rose-100"
                              }`}
                          >
                            {tbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60 flex items-center gap-2">
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Or enter custom table number (e.g. Table 9B)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold"
                    />
                  </div>
                </div>

                {/* Dine-in Dining Preferences */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Dining Special Requests:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serveTogether}
                        onChange={(e) => setServeTogether(e.target.checked)}
                        className="rounded text-rose-600 accent-rose-600 cursor-pointer"
                      />
                      <span>Serve all dishes together</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extraCutlery}
                        onChange={(e) => setExtraCutlery(e.target.checked)}
                        className="rounded text-rose-600 accent-rose-600 cursor-pointer"
                      />
                      <span>Extra bowls &amp; cutlery</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={warmWater}
                        onChange={(e) => setWarmWater(e.target.checked)}
                        className="rounded text-rose-600 accent-rose-600 cursor-pointer"
                      />
                      <span>Warm water with lemons</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Frequently Added Together Recommendations */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                    Frequently Added Together
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Complete your meal with fresh sides, lassis &amp; hot desserts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                {frequentlyAdded.map((dish) => {
                  const qty = cartItems[dish.id] || 0;
                  return (
                    <div
                      key={dish.id}
                      className="p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 flex items-center justify-between gap-2.5 hover:border-rose-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {dish.title}
                          </p>
                          <p className="text-xs text-rose-600 font-extrabold">
                            ${dish.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(dish, 1)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-rose-600 hover:text-white text-zinc-800 border border-zinc-200 hover:border-rose-600 text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-rose-600 text-white rounded-full px-2 py-0.5 shadow-xs shrink-0">
                          <button
                            onClick={() => updateQuantity(dish.id, -1, dish)}
                            className="w-4 h-4 rounded-full hover:bg-rose-700 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold min-w-[12px] text-center font-mono">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1, dish)}
                            className="w-4 h-4 rounded-full hover:bg-rose-700 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==========================================
                4. PAYMENT, OFFERS & BILL SUMMARY
            ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full">
              {/* Left Sub-column: Coupons & SuperCoins */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 w-full">
                {/* 3. Promo Coupons & Offers Section */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Coupons &amp; Offers</span>
                  </span>

                  {/* View All Coupons Button */}
                  <button
                    type="button"
                    onClick={() => setIsCouponsModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>View All ({(availableCoupons || []).length})</span>
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black tracking-wide text-emerald-950">
                            {appliedCoupon.code}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-extrabold">
                            APPLIED
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 truncate font-semibold mt-0.5">
                          You saved ${discountAmount.toFixed(2)} with this coupon!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON CODE"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 uppercase tracking-wider placeholder:normal-case placeholder:font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shrink-0 cursor-pointer text-center"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-xs font-semibold text-red-600">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-xs font-semibold text-emerald-600">{couponSuccess}</p>
                    )}

                    {/* Quick Popular Coupon Chips */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-400">
                          Top offers for your order:
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCouponsModalOpen(true)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          See all &rarr;
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(availableCoupons || []).slice(0, 3).map((coupon) => {
                          const isEligible = subtotal >= coupon.minOrder;
                          return (
                            <div
                              key={coupon.code}
                              className="p-2.5 sm:p-3 rounded-2xl bg-zinc-50/90 border border-dashed border-zinc-200 flex items-center justify-between gap-2 hover:border-rose-300 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-rose-600 tracking-wider">
                                    {coupon.code}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                                    {coupon.tag}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                  {coupon.description}
                                </p>
                              </div>
                              <button
                                onClick={() => handleApplyCoupon(coupon.code)}
                                disabled={!isEligible}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 cursor-pointer ${isEligible
                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                  }`}
                              >
                                {isEligible ? "Apply" : `Min $${coupon.minOrder}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SuperCoins Rewards Redemption */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>SuperCoins Balance</span>
                  </span>
                  <span className="text-xs font-black text-amber-600">
                    {superCoinsBalance} Coins
                  </span>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useSuperCoins}
                    onChange={(e) => setUseSuperCoins(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-400 border-zinc-300 accent-amber-500 cursor-pointer"
                  />
                  <div className="text-xs leading-snug">
                    <p className="font-bold text-amber-900">
                      Redeem 250 SuperCoins
                    </p>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">
                      Save $2.50 instantly from your rewards balance.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Sub-column: Detailed Bill Summary & Checkout */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-5 space-y-6 w-full lg:sticky lg:top-36">
              {/* Detailed Bill Summary */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                    Bill Summary
                  </h3>
                  <span className="text-xs font-bold text-zinc-400 capitalize">
                    Mode: {orderMode}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm font-medium text-zinc-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal ({totalCartCount} items)</span>
                    <span className="font-mono text-zinc-900 font-bold">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Promo Discount ({appliedCoupon.code})
                      </span>
                      <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {useSuperCoins && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        SuperCoins Redemption
                      </span>
                      <span className="font-mono font-bold">-${superCoinsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Delivery Fee Line */}
                  <div className="flex justify-between">
                    <span>
                      {orderMode === "delivery"
                        ? "Delivery Fee"
                        : orderMode === "takeaway"
                          ? "Takeaway Packaging Fee"
                          : "Dine-In Service Charge"}
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold font-mono">FREE ($0.00)</span>
                    ) : (
                      <span className="font-mono text-zinc-900 font-bold">${deliveryFee.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <span>Taxes &amp; Restaurant GST (8.5%)</span>
                    </span>
                    <span className="font-mono text-zinc-900 font-bold">${taxAmount.toFixed(2)}</span>
                  </div>

                  {orderMode === "delivery" && deliveryTip > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Rider Delivery Tip</span>
                      <span className="font-mono font-bold">+${deliveryTip.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-200/80 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm sm:text-base font-black text-zinc-900 block">
                        To Pay
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Inclusive of all taxes &amp; charges
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout CTA Button */}
                <Link
                  href="/checkout"
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-500/25 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Pure Veg Guarantee */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Pure Vegetarian Fresh Guaranteed</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            5. MOBILE & TABLET STICKY BOTTOM CHECKOUT BAR (Visible on <lg screens)
        ==================================================== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 p-3 sm:p-4 shadow-2xl shadow-zinc-900/20 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Total to Pay ({totalCartCount} {totalCartCount === 1 ? "item" : "items"})
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black text-rose-600 font-mono">
                  ${grandTotal.toFixed(2)}
                </span>
                {appliedCoupon && (
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Saved ${discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/checkout"
              className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ====================================================
          4. ALL COUPONS & OFFERS MODAL
      ==================================================== */}
        {isCouponsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-zinc-200">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg sm:text-xl shrink-0">
                    🏷️
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-black tracking-tight">
                      Available Coupons &amp; Offers
                    </h3>
                    <p className="text-[11px] sm:text-xs text-rose-100">
                      Apply promo code to save on your Pure Veg order
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCouponsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Filter Tabs */}
              <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2 border-b border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: "all", label: "All Coupons" },
                  { id: "eligible", label: "Eligible for Cart" },
                  { id: "percentage", label: "% Discounts" },
                  { id: "flat", label: "Flat $ OFF" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCouponFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${couponFilter === tab.id
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Coupons List */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {filteredCoupons.map((coupon) => {
                  const isCurrentlyApplied = appliedCoupon?.code === coupon.code;
                  const isEligible = subtotal >= coupon.minOrder;
                  const shortfall = Math.max(0, coupon.minOrder - subtotal);
                  const isCopied = copiedCouponCode === coupon.code;

                  return (
                    <div
                      key={coupon.code}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${isCurrentlyApplied
                          ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                          : isEligible
                            ? "bg-white border-zinc-200 hover:border-rose-300 hover:shadow-md"
                            : "bg-zinc-50/80 border-zinc-200/80 opacity-85"
                        }`}
                    >
                      {/* Top Row: Coupon Code & Tag */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 rounded-xl bg-rose-100/80 border border-dashed border-rose-300 text-rose-700 font-mono font-black text-xs sm:text-sm tracking-wider flex items-center gap-1.5">
                            <span>{coupon.code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(coupon.code)}
                              title="Copy code"
                              className="text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                            >
                              {isCopied ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase text-white bg-gradient-to-r ${coupon.badgeColor || "from-rose-600 to-amber-500"}`}
                          >
                            {coupon.tag}
                          </span>
                        </div>

                        {/* Action Button */}
                        {isCurrentlyApplied ? (
                          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Applied</span>
                          </span>
                        ) : isEligible ? (
                          <button
                            onClick={() => handleApplyCoupon(coupon.code)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            Apply Coupon
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-xl">
                            Min ${coupon.minOrder}
                          </span>
                        )}
                      </div>

                      {/* Description & Terms */}
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-zinc-900">
                          {coupon.description}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {coupon.terms}
                        </p>
                      </div>

                      {/* Shortfall notice if ineligible */}
                      {!isEligible && (
                        <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-rose-700">
                          <span>
                            Add <strong>${shortfall.toFixed(2)}</strong> more to activate this discount
                          </span>
                          <Link
                            href="/menu"
                            onClick={() => setIsCouponsModalOpen(false)}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            + Add Dishes
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
                <span className="text-xs text-zinc-500 font-medium">
                  Coupons cannot be clubbed with SuperCoins redemption.
                </span>
                <button
                  onClick={() => setIsCouponsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
