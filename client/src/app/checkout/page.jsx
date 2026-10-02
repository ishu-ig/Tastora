"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Check,
  ChevronRight,
  Plus,
  Lock,
  Building,
  Home,
  Calendar,
  Zap,
  X,
  User,
  Coins,
  Bike,
  Store,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  QrCode,
  CreditCard,
  Smartphone,
  RefreshCw,
  ShoppingBag,
  Clock,
  ArrowRight,
  Crown,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "@/context/AuthContext";
import useCartLines from "@/hooks/useCartLines";
import { computeCartTotals, CART_RULES } from "@/lib/cartRules";
import { fullMenuCatalog } from "../menu/page";
import api from "@/lib/axiosInstance";
import { AuthModal } from "@/Component/AuthModal";
import { openRazorpayModal } from "@/lib/razorpay";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns next N calendar days as { label, value } pairs */
function getUpcomingDates(n = 5) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dates = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0
        ? `Today, ${d.getDate()} ${months[d.getMonth()]}`
        : i === 1
        ? `Tomorrow, ${d.getDate()} ${months[d.getMonth()]}`
        : `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    dates.push({ label, value: d.toISOString().split("T")[0] });
  }
  return dates;
}

const TIME_SLOTS = [
  "07:00 AM – 07:30 AM",
  "07:30 AM – 08:00 AM",
  "12:00 PM – 12:30 PM",
  "12:30 PM – 01:00 PM",
  "07:00 PM – 07:30 PM",
  "07:30 PM – 08:00 PM",
  "08:00 PM – 08:30 PM",
  "08:30 PM – 09:00 PM",
  "09:00 PM – 09:30 PM",
];

const POPULAR_BANKS = [
  { id: "HDFC", name: "HDFC Bank", logo: "🏦" },
  { id: "ICICI", name: "ICICI Bank", logo: "🏛️" },
  { id: "SBI", name: "State Bank of India", logo: "🏢" },
  { id: "AXIS", name: "Axis Bank", logo: "🏧" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { checkAuth } = useAuth() || {};
  // ── Context: UI/preference state ──────────────────────────────────────────
  const {
    cartItems: contextCartItems,
    itemNotes,
    orderMode,
    setOrderMode,
    tableNumber,
    setTableNumber,
    pickupTime,
    appliedCoupon,
    setAppliedCoupon,
    deliveryTip,
    useCreditCoins,
    creditCoinsBalance,
    setCreditCoinsBalance,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    placeOrder,
    isMember,
    membership,
  } = useCart();

  // ── Real Redux cart ───────────────────────────────────────────────────────
  const {
    lines: reduxLines,
    loaded: cartLoaded,
    subtotal: reduxSubtotal,
    clearCart: clearReduxCart,
  } = useCartLines();

  // ── Fallback items: Merge Redux lines or fallback to CartContext items ─────
  const lines = useMemo(() => {
    if (reduxLines && reduxLines.length > 0) return reduxLines;
    if (contextCartItems && Object.keys(contextCartItems).length > 0) {
      return Object.entries(contextCartItems).map(([id, qty]) => {
        const dish = fullMenuCatalog?.find((d) => d.id === id) || {
          title: "Pure Veg Delicacy",
          price: 14.99,
          image: "/img/category/paneer-tikka.jpg",
          shortDesc: "Standard portion",
        };
        const unit = Number(dish.price) || 0;
        return {
          lineId: id,
          qty,
          unit,
          total: unit * qty,
          dish: {
            id,
            productId: id,
            title: dish.title,
            price: unit,
            image: dish.image,
            shortDesc: dish.shortDesc || "Full portion",
          },
        };
      });
    }
    return [];
  }, [reduxLines, contextCartItems]);

  const activeSubtotal = useMemo(() => {
    if (reduxLines && reduxLines.length > 0) return reduxSubtotal;
    return lines.reduce((acc, l) => acc + l.total, 0);
  }, [reduxLines, reduxSubtotal, lines]);

  const memberDiscountPercent = membership?.plan?.discountPercent || 10;
  // ── Derived totals ────────────────────────────────────────────────────────
  const {
    deliveryFee,
    discountAmount,
    memberDiscountAmount,
    creditCoinsDiscount,
    coinsConsumed,
    taxAmount,
    grandTotal,
    isFreeDelivery,
    freeDeliveryThreshold,
    creditCoinsToEarn,
  } = useMemo(
    () =>
      computeCartTotals({
        subtotal: activeSubtotal,
        orderMode,
        appliedCoupon,
        deliveryTip,
        useCreditCoins,
        creditCoinsBalance,
        isMember,
        memberDiscountPercent,
      }),
    [activeSubtotal, orderMode, appliedCoupon, deliveryTip, useCreditCoins, creditCoinsBalance, isMember, memberDiscountPercent]
  );
  const subtotal = activeSubtotal;

  // ── Delivery timing ───────────────────────────────────────────────────────
  const upcomingDates = useMemo(() => getUpcomingDates(5), []);
  const [deliveryTiming, setDeliveryTiming] = useState("instant");
  const [scheduledDate, setScheduledDate] = useState(upcomingDates[0]?.value || "");
  const [scheduledTime, setScheduledTime] = useState(TIME_SLOTS[6]);

  // ── Payment Modal & State ─────────────────────────────────────────────────
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiSubTab, setUpiSubTab] = useState("qr"); // "qr" | "id" | "app"
  const [upiProvider, setUpiProvider] = useState("gpay");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [paymentProcessingStage, setPaymentProcessingStage] = useState(0); // 0: idle, 1: connecting, 2: authorizing, 3: success

  // ── Address modal ─────────────────────────────────────────────────────────
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    tag: "Home",
    recipientName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    type: "home",
  });

  // ── Submission ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentModalError, setPaymentModalError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orderConfirmationModalOpen, setOrderConfirmationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // ─── Initial order restoration only when explicitly requested in URL ───────
  useEffect(() => {
    try {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      if (params && params.get("confirmed") === "true") {
        const stored = sessionStorage.getItem("latest_confirmed_order");
        if (stored) {
          setConfirmedOrder(JSON.parse(stored));
          setOrderConfirmationModalOpen(true);
        }
      }
    } catch {}
  }, []);

  // ─── Validation before opening Payment Modal ──────────────────────────────
  const handleProceedToPayment = () => {
    setOrderError("");
    if (!lines.length) {
      setOrderError("Your cart is empty. Please add items to proceed.");
      return;
    }
    if (orderMode === "delivery" && !selectedAddress) {
      setOrderError("Please select or add a delivery address.");
      return;
    }
    if (orderMode === "dinein" && !tableNumber) {
      setOrderError("Please enter your table number.");
      return;
    }
    const userId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
    if (!userId) {
      setAuthModalOpen(true);
      return;
    }
    // Open Payment Popup Modal
    setIsPaymentModalOpen(true);
  };

  // ─── Validate payment fields inside modal ─────────────────────────────────
  const validatePaymentDetails = () => {
    if (paymentMethod === "upi" && upiSubTab === "id") {
      if (!upiIdInput.trim() || !upiIdInput.includes("@")) {
        return "Please enter a valid UPI ID (e.g. yourname@okhdfcbank)";
      }
    }
    if (paymentMethod === "card") {
      const cleanNum = cardDetails.number.replace(/\s/g, "");
      if (cleanNum.length < 15) return "Please enter a valid 16-digit card number.";
      if (!cardDetails.name.trim()) return "Please enter the cardholder name.";
      if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        return "Please enter a valid card expiry (MM/YY).";
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) return "Please enter a valid CVV.";
    }
    return "";
  };

  // ─── Execute Payment & Place Order ────────────────────────────────────────
  const submitOrderToBackend = async (methodLabel, paymentStatus, rppid = "") => {
    setIsSubmitting(true);
    setPaymentProcessingStage(1);

    // Step 1: Simulated Gateway Connection
    await new Promise((res) => setTimeout(res, 600));
    setPaymentProcessingStage(2);

    // Step 2: Authorizing Transaction
    await new Promise((res) => setTimeout(res, 600));

    // Build product lines
    const productLines = lines.map((l) => ({
      product: l.dish.productId,
      productName: l.dish.title,
      image: l.dish.image,
      variant: l.dish.shortDesc?.replace(" portion", "") || "Full",
      qty: l.qty,
      total: l.total,
      note: itemNotes[l.lineId] || "",
    }));

    const userId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;

    const payload = {
      ...(userId ? { user: userId } : {}),
      orderStatus: "Order is Placed",
      paymentMode: methodLabel.includes("Cash") || methodLabel.includes("Pay at") ? "COD" : methodLabel,
      paymentStatus: paymentStatus,
      rppid,
      orderMode,
      address: orderMode === "delivery" ? selectedAddress : null,
      tableNumber: orderMode === "dinein" ? tableNumber || "" : "",
      pickupTime: orderMode === "takeaway" ? pickupTime || "" : "",
      coupon: appliedCoupon?.code || "",
      coinsUsed: coinsConsumed,
      subtotal,
      deliveryCharge: deliveryFee,
      discount: (Number(discountAmount) || 0) + (isMember ? Number(memberDiscountAmount || 0) : 0),
      coinsDiscount: creditCoinsDiscount,
      memberDiscount: isMember ? memberDiscountAmount : 0,
      memberDiscountApplied: Boolean(isMember && memberDiscountAmount > 0),
      isMember: Boolean(isMember),
      tax: taxAmount,
      total: grandTotal,
      products: productLines,
      deliveryTiming,
      ...(deliveryTiming === "scheduled" ? { scheduledDate, scheduledTime } : {}),
    };

    // API call to backend
    let serverOrderData = null;
    try {
      const response = await api.post("/checkout", payload);
      if (response.data?.result !== "Done" || !response.data?.data?._id) {
        throw new Error(response.data?.reason || "The order could not be saved.");
      }
      serverOrderData = response.data;
    } catch (apiErr) {
      console.error("Backend checkout API error:", apiErr);
      throw apiErr;
    }

    setPaymentProcessingStage(3); // Success!
    await new Promise((res) => setTimeout(res, 500));

    // Refresh auth user so Navbar/CartContext picks up the updated cridetCoin balance
    // The server has already deducted the spent coins and will award earned coins.
    // We trigger a background refresh without blocking the success screen.
    if (typeof checkAuth === "function") {
      checkAuth().catch(() => {});
    } else {
      // Fallback: optimistically update local balance
      if (useCreditCoins && coinsConsumed > 0) {
        setCreditCoinsBalance((prev) => Math.max(0, prev - coinsConsumed));
      }
    }

    // Build rich confirmed order object
    const confirmed = {
      id: `ORD-${serverOrderData.data._id.slice(-6).toUpperCase()}`,
      dbId: serverOrderData.data._id,
      paymentMethod: methodLabel,
      orderMode,
      tableNumber: orderMode === "dinein" ? tableNumber || "Table 07" : null,
      items: lines.map((l) => ({
        title: l.dish.title,
        price: l.unit,
        quantity: l.qty,
        image: l.dish.image,
        note: itemNotes[l.lineId] || null,
      })),
      deliveryAddress:
        orderMode === "dinein"
          ? `Dine-In – ${tableNumber || "Table 07"}`
          : orderMode === "takeaway"
          ? "Pickup Counter (Tastora Kitchen)"
          : selectedAddress
          ? `${selectedAddress.addressLine}, ${selectedAddress.city}`
          : "Your delivery address",
      subtotal,
      discount: discountAmount + creditCoinsDiscount,
      coinsDiscount: creditCoinsDiscount,
      coinsUsed: coinsConsumed,
      creditCoinsEarned: Number(serverOrderData.creditCoinsEarned ?? serverOrderData.data.creditCoinsEarned ?? 0),
      creditCoinsBalance: serverOrderData.creditCoinsBalance ?? null,
      deliveryFee,
      taxAmount,
      total: grandTotal,
    };

    // Clear carts & save confirmed order to session
    try {
      clearReduxCart?.();
    } catch {}
    setAppliedCoupon(null);
    placeOrder({ paymentMethod: methodLabel, coinsUsed: coinsConsumed, coinsDiscount: creditCoinsDiscount });

    try {
      sessionStorage.setItem("latest_confirmed_order", JSON.stringify(confirmed));
      localStorage.setItem("latest_confirmed_order", JSON.stringify(confirmed));
    } catch {}

    setIsPaymentModalOpen(false);
    setConfirmedOrder(confirmed);
    setOrderConfirmationModalOpen(true);
  };

  const handleConfirmAndPay = async () => {
    if (isSubmitting) return;

    if (paymentMethod !== "razorpay") {
      const err = validatePaymentDetails();
      if (err) {
        setPaymentModalError(err);
        return;
      }
    }

    setPaymentModalError("");

    const userId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
    if (!userId) {
      setPaymentModalError("Please log in to complete your order.");
      setAuthModalOpen(true);
      return;
    }

    if (paymentMethod === "razorpay") {
      try {
        setIsSubmitting(true);
        const rzpResponse = await openRazorpayModal({
          amount: grandTotal,
          orderName: `Tastora ${orderMode.toUpperCase()}`,
          description: `${lines.length} Items • Pure Veg Delicacies`,
          prefill: {
            name: selectedAddress?.recipientName || "Valued Guest",
            contact: selectedAddress?.phone || "+919876543210",
          },
        });
        await submitOrderToBackend("Razorpay (Online)", "Done", rzpResponse?.razorpay_payment_id || `rzp_${Date.now()}`);
      } catch (rzpErr) {
        console.warn("Razorpay error or dismissal:", rzpErr);
        if (rzpErr?.message?.includes("dismissed")) {
          setPaymentModalError("Payment modal dismissed. You can try again or select another payment option.");
        } else {
          setPaymentModalError(rzpErr?.message || "Payment failed. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
        setPaymentProcessingStage(0);
      }
      return;
    }

    const paymentLabels = {
      upi: upiSubTab === "qr" ? "UPI (QR Code)" : upiSubTab === "app" ? `UPI (${upiProvider.toUpperCase()})` : "UPI (VPA)",
      card: "Credit/Debit Card",
      netbanking: `Net Banking (${selectedBank})`,
      cod: orderMode === "dinein" ? "Pay at Table" : orderMode === "takeaway" ? "Pay on Pickup" : "Cash on Delivery",
    };
    const methodLabel = paymentLabels[paymentMethod] || "UPI";
    const isCOD = paymentMethod === "cod";

    try {
      await submitOrderToBackend(methodLabel, isCOD ? "Pending" : "Done");
    } catch (err) {
      console.error("Payment execution error:", err);
      const serverMsg = err?.response?.data?.reason || err?.response?.data?.message;
      setPaymentModalError(serverMsg ? `Payment failed: ${serverMsg}` : "Could not complete payment. Please try again.");
    } finally {
      setIsSubmitting(false);
      setPaymentProcessingStage(0);
    }
  };

  // ─── Handle new address ───────────────────────────────────────────────────
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddrForm.addressLine || !newAddrForm.recipientName || !newAddrForm.phone) return;
    addAddress({ ...newAddrForm, isDefault: false, type: newAddrForm.tag.toLowerCase() });
    setIsNewAddressOpen(false);
    setNewAddrForm({
      tag: "Home",
      recipientName: "",
      phone: "",
      addressLine: "",
      landmark: "",
      city: "",
      state: "",
      zipCode: "",
      type: "home",
    });
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (!cartLoaded && !confirmedOrder && lines.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <span className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
          <p className="text-sm font-semibold">Loading checkout details…</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EMPTY CART STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (lines.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 pb-24 flex items-center justify-center">
        <div className="max-w-sm w-full mx-auto px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-5xl shadow-inner">
            🛒
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">Your Cart is Empty</h1>
            <p className="text-sm text-zinc-500">Explore our delicious pure vegetarian menu before proceeding to checkout.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Browse Menu
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-800 font-bold text-sm hover:bg-zinc-50 transition-all"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ORDER CONFIRMED STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (confirmedOrder && orderConfirmationModalOpen) {
    const earnedCoins = Number(confirmedOrder.creditCoinsEarned) || 0;
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-placed-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-7 w-7 stroke-[3]" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Order placed</p>
              <h1 id="order-placed-title" className="mt-1 text-2xl font-black text-zinc-900">Thanks for your order</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Order <span className="font-mono font-bold text-zinc-800">{confirmedOrder.id}</span> is saved.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-xs font-bold text-amber-800">CreditCoins earned</p>
              <p className="mt-1 text-3xl font-black text-amber-950">+{earnedCoins}</p>
              {confirmedOrder.creditCoinsBalance !== null && confirmedOrder.creditCoinsBalance !== undefined && (
                <p className="mt-1 text-xs text-amber-800">
                  Wallet balance: {confirmedOrder.creditCoinsBalance} coins
                </p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmationModalOpen(false);
                  setConfirmedOrder(null);
                  try {
                    sessionStorage.removeItem("latest_confirmed_order");
                    localStorage.removeItem("latest_confirmed_order");
                  } catch {}
                }}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50"
              >
                Close
              </button>
              <Link
                href="/orders"
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-rose-700"
              >
                View orders
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    const trackingSteps =
      confirmedOrder.orderMode === "delivery"
        ? [
            { step: "1", title: "Confirmed", desc: "Paid & Received", done: true },
            { step: "2", title: "In Kitchen", desc: "Chef Preparing", active: true },
            { step: "3", title: "Picked Up", desc: "Rider en route" },
            { step: "4", title: "Delivered", desc: "At your door" },
          ]
        : confirmedOrder.orderMode === "takeaway"
        ? [
            { step: "1", title: "Confirmed", desc: "Order Received", done: true },
            { step: "2", title: "Preparing", desc: "In Kitchen", active: true },
            { step: "3", title: "Ready", desc: "Pickup Counter" },
          ]
        : [
            { step: "1", title: "Confirmed", desc: "Order Received", done: true },
            { step: "2", title: "Preparing", desc: "Chef Cooking", active: true },
            { step: "3", title: "Served", desc: "At Your Table" },
          ];

    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* ── Success Banner ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center space-y-5 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-400/30 animate-in zoom-in-75 duration-500">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide">
                🎉 Order Placed Successfully!
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Thank You!</h1>
              <p className="text-xs text-zinc-500">
                Order ID:{" "}
                <span className="font-black text-zinc-900 font-mono">{confirmedOrder.id}</span>
                {confirmedOrder.orderMode === "delivery" && (
                  <> • ETA: <span className="text-rose-600 font-bold">25–35 mins</span></>
                )}
              </p>
            </div>

            {/* Tracking Steps */}
            <div className="pt-4 border-t border-zinc-100 space-y-3 text-left">
              <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Live Order Status</p>
              <div className={`grid gap-3 ${trackingSteps.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                {trackingSteps.map((st) => (
                  <div
                    key={st.step}
                    className={`p-3 rounded-2xl border text-xs flex flex-col gap-1.5 ${
                      st.done
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : st.active
                        ? "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/25 animate-pulse"
                        : "bg-zinc-50 border-zinc-200 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                        {st.step}
                      </span>
                      {st.done && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      {st.active && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                    </div>
                    <div>
                      <p className="font-black text-[11px]">{st.title}</p>
                      <p className="text-[10px] opacity-75">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {confirmedOrder.orderMode === "delivery" && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-base shrink-0">🛵</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900">Delivery Partner Assigned</p>
                  <p className="text-[11px] text-zinc-500">Contactless delivery enabled</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">ON TIME</span>
              </div>
            )}
          </div>

          {/* ── Order Receipt ── */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5" /> Order Receipt
            </h2>

            <div className="divide-y divide-zinc-100 text-xs">
              {confirmedOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center gap-2.5">
                  <img
                    src={item.image || "/img/category/paneer-tikka.jpg"}
                    alt={item.title}
                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{item.title}</p>
                    {item.note && <p className="text-[10px] text-zinc-400 truncate">Note: {item.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-zinc-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-zinc-400">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">₹{confirmedOrder.subtotal.toFixed(2)}</span>
              </div>
              {confirmedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Savings</span>
                  <span className="font-mono">−₹{confirmedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              {confirmedOrder.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-mono">₹{confirmedOrder.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax & GST</span>
                <span className="font-mono">₹{confirmedOrder.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-100 font-black text-sm text-zinc-900">
                <span>Total Paid</span>
                <span className="text-rose-600 font-mono">₹{confirmedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-zinc-400">
                <span>Payment</span>
                <span className="font-medium text-zinc-700">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{confirmedOrder.orderMode === "dinein" ? "Table" : confirmedOrder.orderMode === "takeaway" ? "Pickup" : "Deliver to"}</span>
                <span className="font-medium text-zinc-700 text-right max-w-[55%] truncate">{confirmedOrder.deliveryAddress}</span>
              </div>
            </div>

            {/* CreditCoins earned reward banner */}
            {(confirmedOrder.creditCoinsEarned > 0 || Math.floor(confirmedOrder.subtotal * 0.10) > 0) && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🪙</span>
                  <div>
                    <p className="font-black text-amber-950">You Earned CreditCoins!</p>
                    <p className="text-[11px] text-amber-800">
                      +{(confirmedOrder.creditCoinsEarned || Math.floor(confirmedOrder.subtotal * 0.10))} coins (₹{((confirmedOrder.creditCoinsEarned || Math.floor(confirmedOrder.subtotal * 0.10)) / 50).toFixed(2)} value) added to your wallet
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-full text-xs">
                  +{(confirmedOrder.creditCoinsEarned || Math.floor(confirmedOrder.subtotal * 0.10))}
                </span>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-900 hover:bg-rose-600 text-white text-sm font-black shadow-md transition-all"
            >
              <User className="w-4 h-4" /> Track in Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                try {
                  sessionStorage.removeItem("latest_confirmed_order");
                } catch {}
                router.push("/menu");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-800 text-sm font-bold hover:bg-zinc-50 transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" /> Order More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN CHECKOUT FORM
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <div className="pb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-rose-600 transition-colors">Cart</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <span>Checkout</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /><span>256-Bit SSL</span>
            </span>
          </h1>
        </div>

        {/* ── SELECTED ORDER MODE (Chosen in Cart) ────────────────────────── */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                orderMode === "takeaway"
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20"
                  : orderMode === "dinein"
                  ? "bg-gradient-to-br from-rose-600 to-pink-500 shadow-rose-500/20"
                  : "bg-gradient-to-br from-emerald-600 to-teal-500 shadow-emerald-500/20"
              }`}
            >
              {orderMode === "takeaway" ? (
                <Store className="w-5 h-5" />
              ) : orderMode === "dinein" ? (
                <UtensilsCrossed className="w-5 h-5" />
              ) : (
                <Bike className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Fulfillment Mode (Chosen in Cart)
                </span>
                {(orderMode === "takeaway" || orderMode === "dinein" || deliveryFee === 0) && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ₹0 Delivery Fee
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-black text-zinc-900 mt-0.5">
                {orderMode === "takeaway"
                  ? "🥡 Takeaway • Self-Pickup at Counter"
                  : orderMode === "dinein"
                  ? "🍽️ Dine-In • Direct Table Service"
                  : "🛵 Home Delivery • Fast Doorstep Delivery"}
              </h2>
            </div>
          </div>

          <Link
            href="/cart"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-all flex items-center gap-1 self-start sm:self-center shrink-0"
          >
            <span>Change in Cart</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ═══ LEFT COLUMN ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {/* ── STEP 1: Location ─────────────────────────────────────────────── */}
            {orderMode === "delivery" && (
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <h2 className="text-sm sm:text-base font-black text-zinc-900">Delivery Address</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewAddressOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    No saved addresses. Please add one to continue.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const sel = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                            sel
                              ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 shadow-sm"
                              : "bg-zinc-50/80 border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-black text-zinc-900">
                              {addr.type === "work" ? <Building className="w-3.5 h-3.5 text-rose-600" /> : <Home className="w-3.5 h-3.5 text-rose-600" />}
                              {addr.tag}
                            </span>
                            {sel && (
                              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-600 space-y-0.5">
                            <p className="font-bold text-zinc-900">{addr.recipientName}</p>
                            <p className="line-clamp-2 leading-relaxed">{addr.addressLine}</p>
                            {addr.city && <p className="text-zinc-400">{addr.city}{addr.zipCode ? ` – ${addr.zipCode}` : ""}</p>}
                            <p className="text-[11px] text-zinc-400">{addr.phone}</p>
                          </div>
                          {sel && (
                            <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] font-bold">
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">ETA: 25–35 mins</span>
                              <span className="text-rose-600 uppercase">Deliver Here</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {orderMode === "takeaway" && (
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h2 className="text-sm sm:text-base font-black text-zinc-900">Pickup Location</h2>
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">₹0 Fee</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900">Tastora Pure Veg Flagship Kitchen</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">Pickup Counter #2 • Hot thermal packaging guaranteed</p>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">{pickupTime || "15–20 mins"}</span>
                </div>
              </section>
            )}

            {orderMode === "dinein" && (
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h2 className="text-sm sm:text-base font-black text-zinc-900">Table Details</h2>
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">Direct Kitchen</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Table Number *</label>
                    <input
                      type="text"
                      value={tableNumber || ""}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 07"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Dishes will be freshly prepared and served right at your table.</p>
                </div>
              </section>
            )}

            {/* ── STEP 2: Timing ───────────────────────────────────────────────── */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">2</span>
                <h2 className="text-sm sm:text-base font-black text-zinc-900">
                  {orderMode === "delivery" ? "Delivery Timing" : orderMode === "takeaway" ? "Pickup Timing" : "Preparation Timing"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryTiming("instant")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryTiming === "instant"
                      ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">
                      {orderMode === "delivery" ? "Instant (25–35 min)" : orderMode === "takeaway" ? "Express (15–20 min)" : "Serve Immediately"}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Hot & freshly prepared right away.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryTiming("scheduled")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryTiming === "scheduled"
                      ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Schedule for Later</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Pick a convenient date & time slot.</p>
                  </div>
                </button>
              </div>

              {deliveryTiming === "scheduled" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Date</label>
                    <select
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    >
                      {upcomingDates.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Time Slot</label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    >
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* ── STEP 3: Review & Payment Confirmation Highlight ──────────────── */}
            <section className="bg-gradient-to-br from-rose-50/60 to-amber-50/60 rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">3</span>
                  <h2 className="text-sm sm:text-base font-black text-zinc-900">Payment Gateway</h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Instant &amp; Encrypted
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-lg shrink-0">
                    💳
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Seamless Payment Modal Ready</p>
                    <p className="text-[11px] text-zinc-500">
                      Click below to open the secure payment popup. Choose from UPI (Scan QR or App), Credit/Debit Cards, Net Banking, or Pay on Delivery.
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-zinc-600">
                  <span className="px-2 py-1 bg-zinc-100 rounded-lg">⚡ Instant UPI</span>
                  <span className="px-2 py-1 bg-zinc-100 rounded-lg">📱 QR Code Scan</span>
                  <span className="px-2 py-1 bg-zinc-100 rounded-lg">💳 Visa / RuPay / Mastercard</span>
                  <span className="px-2 py-1 bg-zinc-100 rounded-lg">💵 Cash on Delivery</span>
                </div>
              </div>
            </section>

            {/* ── Security Trust Badges ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-zinc-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> PCI-DSS Secure</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Pure Veg Assured</span>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — ORDER SUMMARY ══════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-36">
            {/* Cart items preview */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                  Order Items ({lines.length})
                </h3>
                <Link href="/cart" className="text-xs font-bold text-rose-600 hover:underline">
                  Edit Cart
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto pr-0.5 scrollbar-thin">
                {lines.map((l) => (
                  <div key={l.lineId} className="py-2.5 flex items-center gap-2.5">
                    <img
                      src={l.dish.image || "/img/category/paneer-tikka.jpg"}
                      alt={l.dish.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{l.dish.title}</p>
                      <p className="text-[11px] text-zinc-400">Qty: {l.qty}</p>
                      {itemNotes[l.lineId] && (
                        <p className="text-[10px] text-zinc-400 italic truncate">"{itemNotes[l.lineId]}"</p>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900 shrink-0">
                      ₹{l.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill breakdown */}
              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs font-medium text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal ({lines.reduce((s, l) => s + l.qty, 0)} items)</span>
                  <span className="font-mono text-zinc-900 font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-mono">−₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {isMember && memberDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP Member Discount ({memberDiscountPercent}%)
                    </span>
                    <span className="font-mono">−₹{memberDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {useCreditCoins && creditCoinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" /> CreditCoins ({coinsConsumed} coins used)
                    </span>
                    <span className="font-mono">−₹{creditCoinsDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>
                    {orderMode === "delivery"
                      ? `Delivery ${isMember ? "(VIP FREE)" : isFreeDelivery ? "(FREE)" : `(₹${CART_RULES.deliveryFee} below ₹${freeDeliveryThreshold})`}`
                      : orderMode === "takeaway"
                      ? "Delivery (Takeaway Pickup)"
                      : "Delivery (Dine-In Service)"}
                  </span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      {isMember && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      FREE (₹0)
                    </span>
                  ) : (
                    <span className="font-mono text-zinc-900">₹{deliveryFee.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Taxes &amp; GST (8.5%)</span>
                  <span className="font-mono text-zinc-900">₹{taxAmount.toFixed(2)}</span>
                </div>

                {orderMode === "delivery" && deliveryTip > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Rider Tip 🙏</span>
                    <span className="font-mono">+₹{deliveryTip.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-zinc-900">Grand Total</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>

                {subtotal < freeDeliveryThreshold && orderMode === "delivery" && (
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    Add ₹{(freeDeliveryThreshold - subtotal).toFixed(0)} more for FREE delivery!
                  </p>
                )}
              </div>

              {/* CreditCoins balance display */}
              {creditCoinsBalance > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-800 font-semibold flex-1">
                    You have <span className="font-black">{creditCoinsBalance}</span> CreditCoins
                    {" "}(= <span className="font-black">₹{(creditCoinsBalance / 50).toFixed(2)}</span> value)
                    {useCreditCoins && creditCoinsDiscount > 0 ? (
                      <span className="text-emerald-600"> — Saving ₹{creditCoinsDiscount.toFixed(2)}! ({coinsConsumed} coins used)</span>
                    ) : (
                      <span className="text-zinc-500"> (enable in Cart to redeem)</span>
                    )}
                  </span>
                </div>
              )}

              {/* Earn preview */}
              {creditCoinsToEarn > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                  <span>🪙</span>
                  <span className="text-amber-800 font-semibold">
                    You'll earn <span className="font-black text-amber-900">{creditCoinsToEarn} CreditCoins</span> after payment!
                  </span>
                </div>
              )}


              {/* Error */}
              {orderError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Proceed to Payment CTA */}
              <button
                type="button"
                disabled={isSubmitting || lines.length === 0}
                onClick={handleProceedToPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Payment • ₹{grandTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust footer */}
              <p className="text-center text-[10px] text-zinc-400 font-medium">
                🔒 Safe &amp; Secure 256-Bit SSL Payment Gateway
              </p>
            </div>

            {/* Applied coupon chip */}
            {appliedCoupon && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-emerald-900">{appliedCoupon.code}</p>
                  <p className="text-emerald-700 truncate">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          PAYMENT POPUP MODAL (User-requested popup for payment)
      ════════════════════════════════════════════════════════════════════════ */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">Tastora Secure Pay</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                      256-Bit SSL
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Total Payable: <span className="text-white font-mono font-bold text-sm">₹{grandTotal.toFixed(2)}</span></p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) setIsPaymentModalOpen(false);
                }}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Payment Processing Animation Screen */}
              {isSubmitting ? (
                <div className="py-12 px-4 text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/25 animate-pulse">
                    {paymentProcessingStage === 3 ? (
                      <Check className="w-10 h-10 stroke-[3]" />
                    ) : (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-zinc-900">
                      {paymentProcessingStage === 1 && "Connecting to Secure Gateway…"}
                      {paymentProcessingStage === 2 && "Authorizing Payment of ₹" + grandTotal.toFixed(2) + "…"}
                      {paymentProcessingStage === 3 && "Payment Verified & Order Confirmed!"}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Please do not refresh the page or press the back button while your transaction is being processed.
                    </p>
                  </div>

                  {/* Progress steps */}
                  <div className="max-w-xs mx-auto flex items-center justify-center gap-2 pt-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          paymentProcessingStage >= step
                            ? "bg-rose-600"
                            : "bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Selector Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "upi", label: "Instant UPI", sub: "Scan QR / Apps", icon: "⚡" },
                      { id: "razorpay", label: "Razorpay", sub: "Cards, UPI, NetBanking", icon: "🔒" },
                      { id: "card", label: "Cards", sub: "Debit / Credit", icon: "💳" },
                      { id: "netbanking", label: "Net Banking", sub: "Top Banks", icon: "🏦" },
                      {
                        id: "cod",
                        label: orderMode === "dinein" ? "Pay at Table" : orderMode === "takeaway" ? "Pay on Pickup" : "COD",
                        sub: "Cash / Scan at delivery",
                        icon: "💵",
                      },
                    ].map((method) => {
                      const active = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method.id);
                            setPaymentModalError("");
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 text-rose-950"
                              : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          <div className="text-xl mb-1">{method.icon}</div>
                          <div>
                            <p className="text-xs font-black leading-tight">{method.label}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{method.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── METHOD 1: UPI & QR CODE ── */}
                  {paymentMethod === "upi" && (
                    <div className="bg-zinc-50 rounded-2xl p-4 sm:p-5 border border-zinc-200 space-y-4">
                      {/* UPI Sub-tabs */}
                      <div className="flex rounded-xl bg-zinc-200/80 p-1">
                        <button
                          type="button"
                          onClick={() => setUpiSubTab("qr")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            upiSubTab === "qr" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          Scan UPI QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab("app")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            upiSubTab === "app" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          UPI Apps
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab("id")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            upiSubTab === "id" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          Enter UPI ID
                        </button>
                      </div>

                      {/* QR View */}
                      {upiSubTab === "qr" && (
                        <div className="text-center space-y-3 py-2">
                          <div className="inline-block p-4 bg-white rounded-3xl border border-zinc-200 shadow-md">
                            {/* Realistic SVG UPI QR Graphic */}
                            <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100" height="100" fill="white"/>
                              {/* Position detection squares */}
                              <rect x="10" y="10" width="24" height="24" rx="4" fill="#09090b"/>
                              <rect x="14" y="14" width="16" height="16" rx="2" fill="white"/>
                              <rect x="18" y="18" width="8" height="8" rx="1" fill="#e11d48"/>

                              <rect x="66" y="10" width="24" height="24" rx="4" fill="#09090b"/>
                              <rect x="70" y="14" width="16" height="16" rx="2" fill="white"/>
                              <rect x="74" y="18" width="8" height="8" rx="1" fill="#e11d48"/>

                              <rect x="10" y="66" width="24" height="24" rx="4" fill="#09090b"/>
                              <rect x="14" y="70" width="16" height="16" rx="2" fill="white"/>
                              <rect x="18" y="74" width="8" height="8" rx="1" fill="#e11d48"/>

                              {/* Matrix data dots */}
                              <rect x="38" y="12" width="6" height="6" rx="1" fill="#18181b"/>
                              <rect x="48" y="12" width="6" height="6" rx="1" fill="#18181b"/>
                              <rect x="58" y="12" width="4" height="6" rx="1" fill="#18181b"/>
                              <rect x="38" y="22" width="8" height="6" rx="1" fill="#18181b"/>
                              <rect x="50" y="22" width="12" height="6" rx="1" fill="#18181b"/>

                              <rect x="12" y="38" width="6" height="8" rx="1" fill="#18181b"/>
                              <rect x="22" y="38" width="8" height="6" rx="1" fill="#18181b"/>
                              <rect x="34" y="38" width="8" height="8" rx="1" fill="#18181b"/>
                              <rect x="46" y="36" width="10" height="10" rx="2" fill="#e11d48"/>
                              <rect x="60" y="38" width="8" height="6" rx="1" fill="#18181b"/>
                              <rect x="72" y="38" width="16" height="6" rx="1" fill="#18181b"/>

                              <rect x="12" y="50" width="18" height="6" rx="1" fill="#18181b"/>
                              <rect x="34" y="50" width="8" height="8" rx="1" fill="#18181b"/>
                              <rect x="60" y="50" width="10" height="6" rx="1" fill="#18181b"/>
                              <rect x="76" y="50" width="12" height="6" rx="1" fill="#18181b"/>

                              <rect x="38" y="66" width="6" height="8" rx="1" fill="#18181b"/>
                              <rect x="48" y="66" width="10" height="6" rx="1" fill="#18181b"/>
                              <rect x="62" y="66" width="8" height="8" rx="1" fill="#18181b"/>
                              <rect x="74" y="66" width="14" height="6" rx="1" fill="#18181b"/>

                              <rect x="38" y="78" width="12" height="8" rx="1" fill="#18181b"/>
                              <rect x="54" y="78" width="8" height="8" rx="1" fill="#18181b"/>
                              <rect x="66" y="78" width="22" height="8" rx="1" fill="#18181b"/>
                            </svg>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">UPI QR • Tastora Kitchen</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-800">
                              Scan with Google Pay, PhonePe, Paytm, BHIM or Cred
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Exact Amount: <span className="font-mono font-bold text-rose-600">₹{grandTotal.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* App View */}
                      {upiSubTab === "app" && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-zinc-700">Choose your UPI App:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                              { id: "gpay", label: "Google Pay", icon: "🌐" },
                              { id: "phonepe", label: "PhonePe", icon: "🟣" },
                              { id: "paytm", label: "Paytm", icon: "🔵" },
                              { id: "bhim", label: "BHIM UPI", icon: "🇮🇳" },
                            ].map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setUpiProvider(app.id)}
                                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                  upiProvider === app.id
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                }`}
                              >
                                <span className="text-xl block mb-1">{app.icon}</span>
                                <span className="text-xs font-bold block">{app.label}</span>
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-zinc-500 text-center">
                            Your payment will open directly in {upiProvider.toUpperCase()}.
                          </p>
                        </div>
                      )}

                      {/* ID View */}
                      {upiSubTab === "id" && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1">Enter UPI ID (VPA) *</label>
                            <input
                              type="text"
                              value={upiIdInput}
                              onChange={(e) => setUpiIdInput(e.target.value)}
                              placeholder="e.g. mobile@okhdfcbank or user@paytm"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-zinc-400">Quick suggestions:</span>
                            {["@okhdfcbank", "@oksbi", "@paytm", "@ybl", "@axl"].map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => {
                                  const base = upiIdInput.includes("@") ? upiIdInput.split("@")[0] : upiIdInput || "myname";
                                  setUpiIdInput(base + sug);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-zinc-200 text-zinc-700 text-[10px] font-bold hover:bg-zinc-300 transition-colors"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── METHOD 2: CARDS ── */}
                  {paymentMethod === "card" && (
                    <div className="bg-zinc-50 rounded-2xl p-4 sm:p-5 border border-zinc-200 space-y-4">
                      {/* Card Graphic */}
                      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl p-4 text-white shadow-lg space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                          <span className="tracking-widest">TASTORA PASS</span>
                          <span className="text-rose-400 font-mono">SECURE</span>
                        </div>
                        <p className="font-mono text-sm sm:text-base tracking-widest text-zinc-200">
                          {cardDetails.number || "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Cardholder</p>
                            <p className="font-bold text-white uppercase">{cardDetails.name || "YOUR NAME"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Expires</p>
                            <p className="font-bold font-mono text-white">{cardDetails.expiry || "MM/YY"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-700 block mb-1">Card Number *</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardDetails.number}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
                              setCardDetails({ ...cardDetails, number: formatted });
                            }}
                            placeholder="4532 0182 9382 8920"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-mono font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-zinc-700 block mb-1">Cardholder Name *</label>
                          <input
                            type="text"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            placeholder="Name as printed on card"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-zinc-700 block mb-1">Expiry (MM/YY) *</label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="08/28"
                              value={cardDetails.expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                setCardDetails({ ...cardDetails, expiry: val });
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-zinc-700 block mb-1">CVV *</label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── METHOD 3: NET BANKING ── */}
                  {paymentMethod === "netbanking" && (
                    <div className="bg-zinc-50 rounded-2xl p-4 sm:p-5 border border-zinc-200 space-y-4">
                      <p className="text-xs font-bold text-zinc-700">Select Your Bank:</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              selectedBank === b.id
                                ? "bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-sm"
                                : "bg-white border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <span className="text-xl">{b.logo}</span>
                            <span className="text-xs font-bold text-zinc-800">{b.name}</span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 block mb-1">Or choose other bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                        >
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="BOB">Bank of Baroda</option>
                          <option value="INDUS">IndusInd Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ── METHOD 2: RAZORPAY GATEWAY ── */}
                  {paymentMethod === "razorpay" && (
                    <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-4 sm:p-5 border border-indigo-200 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-indigo-500/20">
                          🛡️
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-indigo-950">Official Razorpay Checkout</h4>
                          <p className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed">
                            Pay securely with Razorpay's trusted gateway. Supports all Debit/Credit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Mobile Wallets.
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-700">Amount to Pay</span>
                        <span className="font-black font-mono text-rose-600 text-sm">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* ── METHOD 4: COD / PAY AT RESTAURANT ── */}
                  {paymentMethod === "cod" && (
                    <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">💵</span>
                        <div>
                          <h4 className="text-xs font-black text-amber-950">
                            {orderMode === "dinein"
                              ? "Pay at Table"
                              : orderMode === "takeaway"
                              ? "Pay at Pickup Counter"
                              : "Cash on Doorstep Delivery"}
                          </h4>
                          <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                            No upfront payment required. You can pay via Cash or scan our Delivery Partner / Server QR Code when you receive your order.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>Total Due Upon Arrival:</span>
                        <span className="font-mono text-sm text-rose-600 font-black">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Error in modal */}
                  {paymentModalError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentModalError}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!isSubmitting && (
              <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-500">
                  <span>Amount to Pay: </span>
                  <span className="font-black text-zinc-900 font-mono text-sm">₹{grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndPay}
                    className="flex-2 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {paymentMethod === "cod"
                        ? "Confirm Order (COD)"
                        : paymentMethod === "razorpay"
                        ? `Launch Razorpay • ₹${grandTotal.toFixed(2)}`
                        : `Pay ₹${grandTotal.toFixed(2)} Securely`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD NEW ADDRESS MODAL ──────────────────────────────────────────────── */}
      {isNewAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Add Delivery Address
              </h3>
              <button onClick={() => setIsNewAddressOpen(false)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3">
              {/* Tag */}
              <div className="flex items-center gap-2">
                {["Home", "Work", "Other"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewAddrForm({ ...newAddrForm, tag, type: tag.toLowerCase() })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newAddrForm.tag === tag
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddrForm.recipientName}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, recipientName: e.target.value })}
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAddrForm.phone}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">Address Line *</label>
                <input
                  type="text"
                  required
                  value={newAddrForm.addressLine}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, addressLine: e.target.value })}
                  placeholder="Flat, Building, Street"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">Landmark</label>
                <input
                  type="text"
                  value={newAddrForm.landmark}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, landmark: e.target.value })}
                  placeholder="Near Metro Station, etc."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">City</label>
                  <input
                    type="text"
                    value={newAddrForm.city}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">State</label>
                  <input
                    type="text"
                    value={newAddrForm.state}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, state: e.target.value })}
                    placeholder="MH"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newAddrForm.zipCode}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, zipCode: e.target.value.replace(/\D/g, "") })}
                    placeholder="400001"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAddressOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-black shadow-md shadow-rose-500/20 transition-all hover:opacity-90 cursor-pointer"
                >
                  Save Address &amp; Use
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTH MODAL ──────────────────────────────────────────────────────── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />
    </div>
  );
}
