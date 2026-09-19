"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CreditCard,
  Check,
  ChevronRight,
  ShieldCheck,
  Plus,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Building,
  Home,
  CheckCircle2,
  Calendar,
  Zap,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  X,
  Phone,
  User,
  Coins,
  Receipt,
  FileText,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { fullMenuCatalog } from "../menu/page";

export default function CheckoutPage() {
  const {
    cartItems,
    itemNotes,
    orderMode,
    tableNumber,
    pickupTime,
    subtotal,
    deliveryFee,
    appliedCoupon,
    discountAmount,
    deliveryTip,
    optOutCutlery,
    deliveryInstruction,
    useSuperCoins,
    superCoinsDiscount,
    taxAmount,
    grandTotal,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    placeOrder,
    loadSampleCart,
  } = useCart();

  // Delivery Timing
  const [deliveryTiming, setDeliveryTiming] = useState("instant"); // "instant" | "scheduled"
  const [scheduledDate, setScheduledDate] = useState("Today, 12 Sep");
  const [scheduledTime, setScheduledTime] = useState("08:00 PM - 08:30 PM");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "netbanking" | "cod"
  const [upiProvider, setUpiProvider] = useState("gpay");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "Ishaan Sharma",
    expiry: "",
    cvv: "",
  });

  // Modal States
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    tag: "Home",
    recipientName: "Ishaan Sharma",
    phone: "+1 (555) 234-5678",
    addressLine: "",
    landmark: "",
    city: "New York",
    zipCode: "10001",
    type: "home",
  });

  // Order Placed State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const cartEntries = Object.entries(cartItems);
  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Handle Add New Address
  const handleAddNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddrForm.addressLine) return;
    addAddress(newAddrForm);
    setIsNewAddressModalOpen(false);
    setNewAddrForm({
      tag: "Home",
      recipientName: "Ishaan Sharma",
      phone: "+1 (555) 234-5678",
      addressLine: "",
      landmark: "",
      city: "New York",
      zipCode: "10001",
      type: "home",
    });
  };

  // Place Order Action
  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      let methodLabel = "UPI";
      if (paymentMethod === "card") methodLabel = "Credit/Debit Card";
      if (paymentMethod === "netbanking") methodLabel = "Net Banking";
      if (paymentMethod === "cod") methodLabel = "Cash on Delivery";

      const order = placeOrder({
        paymentMethod: methodLabel,
      });

      setConfirmedOrder(order);
      setIsSubmitting(false);
    }, 1500);
  };

  // Empty Cart Guard (if accessed directly with 0 items)
  if (cartEntries.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 pb-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-24 h-24 mx-auto rounded-full bg-rose-100/80 border border-rose-200/80 flex items-center justify-center text-4xl shadow-inner">
            🛒
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xs mx-auto">
              Please select your favorite 100% Pure Vegetarian dishes to proceed with checkout.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={loadSampleCart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Fill Sample Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/menu"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm shadow-xs hover:border-rose-300 hover:bg-rose-50/50 transition-all"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ORDER CONFIRMED / LIVE TRACKING SCREEN
  // ----------------------------------------------------
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-100/60 rounded-full blur-2xl -z-10" />
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                Order Placed Successfully!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Thank You For Your Order
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                Order ID: <span className="text-zinc-900 font-bold font-mono">{confirmedOrder.id}</span> • Estimated Delivery in <span className="text-rose-600 font-bold">25-35 mins</span>
              </p>
            </div>

            {/* Live Delivery Progress Tracker Timeline */}
            <div className="pt-6 border-t border-zinc-100 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Live Order Status
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { step: "1", title: "Confirmed", desc: "Paid & Received", status: "completed" },
                  { step: "2", title: "In Kitchen", desc: "Chef Preparing", status: "active" },
                  { step: "3", title: "Picked Up", desc: "Rider on the way", status: "pending" },
                  { step: "4", title: "Delivered", desc: "At your door", status: "pending" },
                ].map((st) => (
                  <div
                    key={st.step}
                    className={`p-3 rounded-2xl border text-xs flex flex-col justify-between ${
                      st.status === "completed"
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                        : st.status === "active"
                        ? "bg-rose-50/80 border-rose-400 text-rose-900 ring-2 ring-rose-400/30 animate-pulse"
                        : "bg-zinc-50 border-zinc-200 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[10px] shadow-2xs">
                        {st.step}
                      </span>
                      {st.status === "completed" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      {st.status === "active" && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                    </div>
                    <div>
                      <p className="font-black text-[11px] sm:text-xs">{st.title}</p>
                      <p className="text-[10px] opacity-80">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Partner Simulation Badge */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-left gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                  🛵
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    Delivery Partner: Rajesh Kumar
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Electric Scooter • Contactless Delivery Enabled
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                ON TIME
              </span>
            </div>
          </div>

          {/* Order Details & Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Order Receipt Summary
            </h3>

            <div className="divide-y divide-zinc-100 text-xs">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-zinc-800">{item.title}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Delivery Address:</span>
                <span className="font-medium text-zinc-900 text-right max-w-xs truncate">
                  {confirmedOrder.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-zinc-900">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-100 font-black text-sm text-zinc-900">
                <span>Total Paid:</span>
                <span className="text-rose-600 font-mono">${confirmedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/profile"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-rose-600 text-white text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>View in Profile Dashboard</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-800 text-xs sm:text-sm font-bold shadow-xs hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN CHECKOUT FORM
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Header */}
        <div className="pb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-rose-600 transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <span>Checkout</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </h1>
        </div>

        {/* 2-Column Responsive Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==========================================
              LEFT COLUMN: MULTI-STEP CHECKOUT FORM
          ========================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* STEP 1: FULFILLMENT LOCATION (Adaptive by Order Mode) */}
            {orderMode === "delivery" && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">
                      Delivery Address
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNewAddressModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Saved Addresses Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? "bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 shadow-sm"
                            : "bg-zinc-50/80 border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-black text-zinc-900">
                            {addr.tag === "Home" ? (
                              <Home className="w-3.5 h-3.5 text-rose-600" />
                            ) : (
                              <Building className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>{addr.tag}</span>
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-600 space-y-0.5">
                          <p className="font-bold text-zinc-900">{addr.recipientName}</p>
                          <p className="line-clamp-2 leading-relaxed">{addr.addressLine}</p>
                          <p className="text-[11px] text-zinc-400">Phone: {addr.phone}</p>
                        </div>

                        <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] font-bold">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ETA: 25-35 mins
                          </span>
                          {isSelected && (
                            <span className="text-rose-600 font-extrabold uppercase">
                              Deliver Here
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {orderMode === "takeaway" && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">
                      Restaurant Pickup Location
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Self Pickup • 0 Fee
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-black text-zinc-900">
                        Tastora Pure Veg Flagship Kitchen
                      </h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        42 Flavor Street, Midtown Manhattan, NY 10001
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Pickup Counter #2 • Hot thermal packing guaranteed
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
                      {pickupTime}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {orderMode === "dinein" && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">
                      Dine-In Table Confirmation
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                    Direct Kitchen Service
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900">
                      Reserved for: {tableNumber || "Table 07"}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Dishes will be freshly prepared and served directly by our kitchen team.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black">
                    {tableNumber || "Table 07"}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY / PREPARATION TIMING */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <h2 className="text-sm sm:text-base font-black text-zinc-900">
                  {orderMode === "delivery"
                    ? "Delivery Timing"
                    : orderMode === "takeaway"
                    ? "Pickup Timing"
                    : "Kitchen Preparation Timing"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryTiming("instant")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryTiming === "instant"
                      ? "bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">
                      {orderMode === "delivery"
                        ? "Instant Delivery (25-35 min)"
                        : orderMode === "takeaway"
                        ? "Express Pickup (15-20 min)"
                        : "Serve Immediately"}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Hot &amp; freshly prepared right away by our chefs.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryTiming("scheduled")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryTiming === "scheduled"
                      ? "bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">
                      Schedule for Later
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Choose specific date and time for advance booking.
                    </p>
                  </div>
                </button>
              </div>

              {deliveryTiming === "scheduled" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Select Date:
                    </label>
                    <select
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold"
                    >
                      <option value="Today, 12 Sep">Today, 12 Sep</option>
                      <option value="Tomorrow, 13 Sep">Tomorrow, 13 Sep</option>
                      <option value="Sunday, 14 Sep">Sunday, 14 Sep</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Select Time Slot:
                    </label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold"
                    >
                      <option value="07:30 PM - 08:00 PM">07:30 PM - 08:00 PM</option>
                      <option value="08:00 PM - 08:30 PM">08:00 PM - 08:30 PM (Dinner Rush)</option>
                      <option value="08:30 PM - 09:00 PM">08:30 PM - 09:00 PM</option>
                      <option value="09:00 PM - 09:30 PM">09:00 PM - 09:30 PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <h2 className="text-sm sm:text-base font-black text-zinc-900">
                  Payment Method
                </h2>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "upi", label: "Instant UPI", icon: "⚡" },
                  { id: "card", label: "Credit/Debit", icon: "💳" },
                  { id: "netbanking", label: "Net Banking", icon: "🏦" },
                  { id: "cod", label: "Cash on Delivery", icon: "💵" },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-400/20"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* UPI Form */}
              {paymentMethod === "upi" && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <span className="text-xs font-bold text-zinc-700 block">
                    Choose UPI App or enter UPI ID:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiProvider(app.toLowerCase())}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          upiProvider === app.toLowerCase()
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-700 border-zinc-200"
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="e.g. mobileNumber@upi / yourname@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              )}

              {/* Credit Card Form */}
              {paymentMethod === "card" && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                      Card Number:
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, number: e.target.value })
                      }
                      placeholder="4532 •••• •••• 8920"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                        Expiry (MM/YY):
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="08/29"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                        CVV:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvv: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COD Notice */}
              {paymentMethod === "cod" && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                  <span className="text-lg">💵</span>
                  <div>
                    <p className="font-bold">Cash on Delivery Selected</p>
                    <p className="text-[11px] text-amber-800">
                      Please keep exact change ready of <span className="font-bold font-mono">${grandTotal.toFixed(2)}</span> upon arrival.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: ORDER SUMMARY & PLACE ORDER
          ========================================== */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-40">
            {/* Order Items Preview */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                  Order Items ({cartEntries.length})
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Edit Cart
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 max-h-56 overflow-y-auto pr-1">
                {cartEntries.map(([id, qty]) => {
                  const dish = fullMenuCatalog.find((d) => d.id === id) || {
                    title: "Delicious Dish",
                    price: 12.99,
                    image: "/img/category/paneer-tikka.jpg",
                  };
                  return (
                    <div key={id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {dish.title}
                          </p>
                          <p className="text-[11px] text-zinc-400">Qty: {qty}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-900">
                        ${(dish.price * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bill Details */}
              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs font-medium text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {useSuperCoins && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>SuperCoins</span>
                    <span className="font-mono">-${superCoinsDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-mono text-zinc-900">${deliveryFee.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Taxes (8.5%)</span>
                  <span className="font-mono text-zinc-900">${taxAmount.toFixed(2)}</span>
                </div>

                {deliveryTip > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Rider Tip</span>
                    <span className="font-mono">+${deliveryTip.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-zinc-900">Grand Total</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-rose-500/25 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order • ${grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW ADDRESS MODAL */}
      {isNewAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Add Delivery Address</span>
              </h3>
              <button
                onClick={() => setIsNewAddressModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewAddressSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Address Tag (e.g. Home, Office, Gym)
                </label>
                <div className="flex gap-2">
                  {["Home", "Office", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewAddrForm({ ...newAddrForm, tag })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        newAddrForm.tag === tag
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Recipient Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={newAddrForm.recipientName}
                  onChange={(e) =>
                    setNewAddrForm({ ...newAddrForm, recipientName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Contact Phone Number:
                </label>
                <input
                  type="text"
                  required
                  value={newAddrForm.phone}
                  onChange={(e) =>
                    setNewAddrForm({ ...newAddrForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Flat / House / Floor / Building:
                </label>
                <textarea
                  required
                  rows={2}
                  value={newAddrForm.addressLine}
                  onChange={(e) =>
                    setNewAddrForm({ ...newAddrForm, addressLine: e.target.value })
                  }
                  placeholder="e.g. Flat 4B, Emerald Heights, 42 Flavor Street"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold resize-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    City:
                  </label>
                  <input
                    type="text"
                    value={newAddrForm.city}
                    onChange={(e) =>
                      setNewAddrForm({ ...newAddrForm, city: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Zip Code:
                  </label>
                  <input
                    type="text"
                    value={newAddrForm.zipCode}
                    onChange={(e) =>
                      setNewAddrForm({ ...newAddrForm, zipCode: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
                >
                  Save Address &amp; Use
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
