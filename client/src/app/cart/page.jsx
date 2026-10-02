"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Home,
  Building,
  CheckCircle2,
  Copy,
  CheckCheck,
  Navigation,
  Info,
  Crown,
} from "lucide-react";
import { Menucard } from "@/Component/MenuCard";
import { useCart } from "../../context/CartContext";
import { getProduct, updateProduct } from "@/Redux/ActionCreators/ProductActionCreators";
import { getCoupon, validateCoupon } from "@/Redux/ActionCreators/CouponActionCreators";
import { createCheckout } from "@/Redux/ActionCreators/CheckoutActionCreators";
import useCartLines from "@/hooks/useCartLines";
import useCartWishlist from "@/hooks/useCartWishlist";
import { mapProductToDish } from "@/lib/MenuDish";
import { computeCartTotals, CART_RULES } from "@/lib/cartRules";

export default function CartPage() {
  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";
  const router = useRouter();

  // UI-only state (order mode, notes, tip, address...) still lives in the context.
  const {
    itemNotes,
    orderMode,
    setOrderMode,
    tableNumber,
    setTableNumber,
    pickupTime,
    setPickupTime,
    setItemCustomNote,
    appliedCoupon,
    setAppliedCoupon,
    deliveryTip,
    setDeliveryTip,
    optOutCutlery,
    setOptOutCutlery,
    deliveryInstruction,
    setDeliveryInstruction,
    useCreditCoins,
    setUseCreditCoins,
    creditCoinsBalance,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    isMember,
    membership,
  } = useCart();

  // Cart lines, quantities and subtotal come from Redux (CartStateData -> MongoDB).
  const {
    cartItems,
    dishById,
    loaded: cartLoaded,
    totalCartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartLines();

  // Delivery / tax / coupon / total are derived from that subtotal.
  // Shipping rule (CART_RULES): ₹150 when subtotal is below ₹1000, free above.
  const memberDiscountPercent = membership?.plan?.discountPercent || 10;
  const {
    freeDeliveryThreshold,
    isFreeDelivery,
    freeDeliveryShortfall,
    deliveryFee,
    discountAmount,
    memberDiscountAmount,
    creditCoinsDiscount,
    coinsConsumed,
    taxAmount,
    grandTotal,
    creditCoinsToEarn,
  } = useMemo(
    () => computeCartTotals({
      subtotal,
      orderMode,
      appliedCoupon,
      deliveryTip,
      useCreditCoins,
      creditCoinsBalance,
      isMember,
      memberDiscountPercent,
    }),
    [subtotal, orderMode, appliedCoupon, deliveryTip, useCreditCoins, creditCoinsBalance, isMember, memberDiscountPercent]
  );


  // "Frequently added together" now uses real products, added through the same Redux cart.
  const dispatch = useDispatch();
  const productState = useSelector((st) => st.ProductStateData);
  const couponState = useSelector((st) => st.CouponStateData);
  const {
    addToCart,
    updateQty,
    addToWishlist,
    isInCart,
    isInWishlist,
    getQty,
  } = useCartWishlist();

  useEffect(() => {
    dispatch(getProduct());
    dispatch(getCoupon());
  }, [dispatch]);

  const products = Array.isArray(productState) ? productState : [];

  const availableCoupons = useMemo(() => {
    const now = Date.now();
    return (Array.isArray(couponState.coupons) ? couponState.coupons : [])
      .filter((coupon) => (
        coupon.active !== false &&
        new Date(coupon.validFrom).getTime() <= now &&
        new Date(coupon.validTill).getTime() >= now
      ))
      .map((coupon) => {
        const minOrder = Number(coupon.minOrderValue) || 0;
        const isPercentage = coupon.discountType === "percentage";
        const valueLabel = isPercentage
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`;

        return {
          ...coupon,
          discountPercent: isPercentage ? Number(coupon.discountValue) : 0,
          discountAmount: isPercentage ? 0 : Number(coupon.discountValue),
          minOrder,
          maxDiscount: Number(coupon.maxDiscountAmount) || 0,
          description: coupon.description || valueLabel,
          terms: `Minimum order ₹${minOrder.toFixed(2)}`,
          tag: valueLabel,
          badgeColor: "from-rose-600 to-amber-500",
        };
      });
  }, [couponState.coupons]);

  const recommended = useMemo(() => {
    const all = (Array.isArray(productState) ? productState : [])
      .filter((p) => p.active !== false)
      .map(mapProductToDish);
    const pref = /dessert|beverage|drink|bread|naan|side|sweet|lassi/i;
    const picks = all.filter((d) => pref.test(d.mainCategory) || pref.test(d.subCategory));
    const rest = all.filter((d) => !picks.includes(d));
    return [...picks, ...rest].slice(0, 4);
  }, [productState]);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [pendingCouponCode, setPendingCouponCode] = useState(null);
  const [customTipActive, setCustomTipActive] = useState(false);
  const [customTipValue, setCustomTipValue] = useState("");
  const [activeNoteItemId, setActiveNoteItemId] = useState(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [couponFilter, setCouponFilter] = useState("all");
  const [copiedCouponCode, setCopiedCouponCode] = useState(null);

  // Order placement state
  const [paymentMode, setPaymentMode] = useState("COD"); // "COD" | "Net Banking"
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (
      !pendingCouponCode ||
      !couponState.couponsLoaded ||
      couponState.validationLoading ||
      !couponState.validationResult
    ) return;

    const result = couponState.validationResult;
    if (result.valid && result.result === "Done") {
      const coupon = availableCoupons.find((item) => item.code === (result.code || pendingCouponCode));
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponSuccess(`Coupon ${coupon.code} applied successfully!`);
        setCouponInput("");
        if (isCouponsModalOpen) setIsCouponsModalOpen(false);
        setTimeout(() => setCouponSuccess(""), 4000);
      } else {
        setCouponError("This coupon is no longer available.");
      }
    } else {
      setCouponError(result.reason || result.message || "Unable to apply this coupon.");
    }

    setPendingCouponCode(null);
  }, [
    availableCoupons,
    couponState.couponsLoaded,
    couponState.validationLoading,
    couponState.validationResult,
    isCouponsModalOpen,
    pendingCouponCode,
    setAppliedCoupon,
  ]);

  useEffect(() => {
    if (!couponState.couponsLoaded || !appliedCoupon) return;

    const currentCoupon = availableCoupons.find((coupon) => coupon.code === appliedCoupon.code);
    if (!currentCoupon || subtotal < currentCoupon.minOrder) {
      setAppliedCoupon(null);
      if (currentCoupon) setCouponError(`Minimum order of ₹${currentCoupon.minOrder.toFixed(2)} required.`);
    } else if (appliedCoupon._id !== currentCoupon._id) {
      setAppliedCoupon(currentCoupon);
    }
  }, [appliedCoupon, availableCoupons, couponState.couponsLoaded, setAppliedCoupon, subtotal]);

  // Address Modal & Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    recipientName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    lat: null,
    lng: null,
  });

  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationSearchTimer = useRef(null);
  const locationSearchController = useRef(null);

  useEffect(() => () => {
    clearTimeout(locationSearchTimer.current);
    locationSearchController.current?.abort();
  }, []);

  const applyLocationFeature = (feature) => {
    const place = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates || [];
    const lat = Number(place.lat ?? coordinates[1]);
    const lng = Number(place.lon ?? coordinates[0]);
    const addressLine = place.address_line1 || place.formatted || "";

    setNewAddress((current) => ({
      ...current,
      addressLine,
      city: place.city || place.town || place.village || place.municipality || "",
      state: place.state || "",
      zipCode: place.postcode || "",
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    }));
    setLocationQuery(place.formatted || addressLine);
    setLocationSuggestions([]);
    setLocationError("");
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setNewAddress((current) => ({ ...current, addressLine: value, lat: null, lng: null }));
    setLocationError("");

    clearTimeout(locationSearchTimer.current);
    locationSearchController.current?.abort();

    if (value.trim().length < 3) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    if (!GEOAPIFY_API_KEY) {
      setLocationSuggestions([]);
      setLocationError("Address search is unavailable. Enter the address manually.");
      return;
    }

    locationSearchTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      locationSearchController.current = controller;
      setLocationLoading(true);

      try {
        const params = new URLSearchParams({ text: value, limit: "5", apiKey: GEOAPIFY_API_KEY });
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Address search failed");
        const json = await response.json();
        setLocationSuggestions(Array.isArray(json.features) ? json.features : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLocationSuggestions([]);
          setLocationError("Could not search addresses. Enter the address manually.");
        }
      } finally {
        if (locationSearchController.current === controller) setLocationLoading(false);
      }
    }, 400);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }
    if (!GEOAPIFY_API_KEY) {
      setLocationError("Location lookup is unavailable. Enter the address manually.");
      return;
    }

    setLocationError("");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            apiKey: GEOAPIFY_API_KEY,
          });
          const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?${params}`);
          if (!response.ok) throw new Error("Reverse geocoding failed");
          const json = await response.json();
          const feature = json.features?.[0];
          if (!feature) throw new Error("No address found for this location");
          applyLocationFeature({
            ...feature,
            properties: { ...feature.properties, lat: coords.latitude, lon: coords.longitude },
          });
        } catch {
          setLocationError("Could not find an address for your current location.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Location permission was denied.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddress.addressLine || !newAddress.recipientName) return;
    addAddress({
      ...newAddress,
      isDefault: false,
      type: newAddress.tag.toLowerCase(),
    });
    setShowAddAddressModal(false);
    setNewAddress({
      tag: "Home",
      recipientName: "",
      phone: "",
      addressLine: "",
      landmark: "",
      city: "",
      state: "",
      zipCode: "",
      lat: null,
      lng: null,
    });
    setLocationQuery("");
    setLocationSuggestions([]);
    setLocationError("");
  };

  // Dine-in Special Requests State
  const [serveTogether, setServeTogether] = useState(true);
  const [extraCutlery, setExtraCutlery] = useState(false);
  const [warmWater, setWarmWater] = useState(false);

  const cartEntries = Object.entries(cartItems);
  const currentAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // ----------------------------------------------------
  // CART LOGIC: variants, stock, quantity, delete, place order
  // ----------------------------------------------------

  // Find the product + variant behind a cart dish.
  // (price / stock live in Product.variants[], not on the product itself)
  const resolveProductAndVariant = (dish) => {
    const productId = String(dish.productId || dish.product?._id || dish._id || dish.id);
    const product = products.find((p) => String(p._id) === productId);
    const variantId = dish.variantId || dish.variant?._id;
    const variant =
      dish.variant ||
      product?.variants?.find((v) => String(v._id) === String(variantId)) ||
      product?.variants?.[0];
    return { product, variant, productId };
  };

  // Quantity +/-: DEC never goes below 1, INC never exceeds variant stock.
  const handleQtyChange = (id, delta, dish) => {
    const quantity = cartItems[id] || 0;
    const { variant } = resolveProductAndVariant(dish);
    const stock = variant?.stockQuantity;

    if (delta < 0 && quantity <= 1) return; // use the trash icon to remove
    if (delta > 0 && Number.isFinite(stock) && quantity >= stock) {
      setOrderError(`Only ${stock} in stock for ${dish.title}.`);
      return;
    }
    setOrderError("");
    updateQuantity(id, delta, dish);
  };

  const handleRemoveItem = (id) => {
    if (window.confirm("Remove this item from cart?")) removeFromCart(id);
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all items from cart?")) clearCart();
  };

  const placeOrder = () => {
    // Navigate directly to checkout page — address selection, table & payment modal are all on /checkout.
    router.push("/checkout");
  };

  // Ask the server to validate eligibility and usage limits before applying.
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (couponState.validationLoading) return;
    if (!code) {
      setCouponError("Please enter a valid coupon code");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Add items to your cart before applying a coupon.");
      return;
    }

    let userId = "";
    try {
      const cookieUserId = document.cookie.match(/(?:^|;\s*)userid=([^;]+)/)?.[1];
      userId = localStorage.getItem("userid") || (cookieUserId ? decodeURIComponent(cookieUserId) : "");
    } catch { }

    setPendingCouponCode(code);
    dispatch(validateCoupon({
      code,
      orderValue: Number(subtotal),
      ...(userId ? { userId } : {}),
    }));
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
  if (!cartLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <span className="w-9 h-9 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
          <span className="text-xs font-bold">Loading your cart…</span>
        </div>
      </div>
    );
  }

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
      <div className="w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-10 space-y-5 sm:space-y-6">
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
              onClick={handleClearCart}
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
                      ₹{CART_RULES.deliveryFee} Fee (Free &gt;₹{CART_RULES.freeDeliveryThreshold})
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
                    ₹0 DELIVERY FEE
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
                    Add <span className="text-rose-600 font-black">₹{freeDeliveryShortfall.toFixed(2)}</span> more to unlock <span className="text-rose-600 font-bold">FREE Delivery</span>!
                  </span>
                )}
              </span>
              <span className="text-zinc-500 font-mono text-[11px] sm:text-xs shrink-0">
                ₹{subtotal.toFixed(2)} / ₹{freeDeliveryThreshold.toFixed(2)}
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

        {/* ── Two-Column Layout: Left (items + coupons) · Right (sticky bill) ── */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-7 w-full">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN — Cart Items + Settings + Coupons
          ═══════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-5 sm:space-y-6">

            {/* 1. DISH ITEMS */}
            <div className="w-full bg-white rounded-3xl p-3.5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-3.5 sm:space-y-4">
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
                  const dish = dishById[id];
                  if (!dish) return null;
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
                                ₹{dish.price.toFixed(2)}
                              </span>
                              {dish.oldPrice && (
                                <span className="text-zinc-400 line-through text-[11px] font-normal">
                                  ₹{dish.oldPrice.toFixed(2)}
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
                                onClick={() => handleQtyChange(id, -1, dish)}
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
                                onClick={() => handleQtyChange(id, 1, dish)}
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
                                ₹{itemTotal.toFixed(2)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(id)}
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
                                  ₹{dish.price.toFixed(2)}
                                </span>
                                <span className="text-zinc-400 text-[11px] font-medium">
                                  each
                                </span>
                                {dish.oldPrice && (
                                  <span className="text-zinc-400 line-through text-xs font-normal">
                                    ₹{dish.oldPrice.toFixed(2)}
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
                              onClick={() => handleQtyChange(id, -1, dish)}
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
                              onClick={() => handleQtyChange(id, 1, dish)}
                              className="w-5 h-5 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[70px]">
                            <p className="text-base font-black text-zinc-900 font-mono">
                              ₹{itemTotal.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-medium">
                              {quantity} × ₹{dish.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(id)}
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
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Delivery Address</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                      Select or add a delivery location for doorstep delivery in 25–35 mins
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>

                {/* Saved Addresses Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = (selectedAddressId || savedAddresses[0]?.id) === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${isSelected
                          ? "bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                          : "bg-zinc-50/70 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-rose-600 text-white shadow-2xs" : "bg-zinc-200 text-zinc-600"
                                }`}
                            >
                              {addr.tag === "Home" ? (
                                <Home className="w-3.5 h-3.5" />
                              ) : addr.tag === "Office" || addr.tag === "Work" ? (
                                <Building className="w-3.5 h-3.5" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="text-xs font-black text-zinc-900 tracking-tight">
                              {addr.tag}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 font-bold">
                                Default
                              </span>
                            )}
                          </div>

                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shadow-2xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Deliver Here</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-zinc-400">
                              Select
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-600 space-y-0.5">
                          <p className="font-bold text-zinc-900">
                            {addr.recipientName || "Guest"}
                            {addr.phone && (
                              <span className="ml-1.5 text-[11px] font-medium text-zinc-400">
                                • {addr.phone}
                              </span>
                            )}
                          </p>
                          <p className="line-clamp-2 leading-relaxed text-zinc-700 font-medium">
                            {addr.addressLine}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-zinc-400 truncate">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] font-bold">
                          <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>⚡ 25-35 mins</span>
                          </span>
                          <span className="text-zinc-400">
                            {addr.city}, {addr.zipCode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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
                      {deliveryTip > 0 ? `+₹${deliveryTip.toFixed(2)}` : "No tip"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {[0, 10, 20, 30, 50].map((amount) => {
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
                          {amount === 0 ? "Not now" : `₹${amount}`}
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
                          ₹
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
                    ₹0 EXTRA FEES
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
                {recommended.map((dish) => {
                  return (
                    <Menucard
                      key={dish.id}
                      dish={dish}
                      viewMode="grid"
                      inCart={isInCart(dish)}
                      qty={getQty(dish)}
                      getQtyForDish={getQty}
                      inWishlist={isInWishlist(dish)}
                      onAddToCart={addToCart}
                      onUpdateQty={updateQty}
                      onToggleWishlist={addToWishlist}
                    />
                  );
                })}
              </div>
            </div>

            {/* end left column */}
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN — Sticky Sidebar: Destination + Coupons + Bill Summary
          ═══════════════════════════════════════════════ */}
          <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 lg:sticky lg:top-36 space-y-4">
            {/* 1. Quick Delivery Destination / Fulfillment Snapshot */}
            <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {orderMode === "delivery" && <Bike className="w-4 h-4" />}
                  {orderMode === "takeaway" && <Store className="w-4 h-4" />}
                  {orderMode === "dinein" && <Utensils className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-zinc-900 truncate">
                      {orderMode === "delivery" && `Deliver to: ${currentAddress?.tag || "Home"}`}
                      {orderMode === "takeaway" && "Pickup at Tastora Kitchen"}
                      {orderMode === "dinein" && `Dine-In: ${tableNumber || "Table 07"}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {orderMode === "delivery" && (currentAddress?.addressLine || "Select address")}
                    {orderMode === "takeaway" && (pickupTime || "Ready in 20 mins")}
                    {orderMode === "dinein" && "Direct Table Dining"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (orderMode === "delivery") {
                    setShowAddAddressModal(true);
                  } else {
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Change
              </button>
            </div>

            {/* 2. COUPONS & OFFERS CARD (Shifted to Right Side!) */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Coupons &amp; Offers</span>
                </span>

                {/* View All Coupons Button */}
                <button
                  type="button"
                  onClick={() => setIsCouponsModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>View All ({(availableCoupons || []).length})</span>
                </button>
              </div>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
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
                      <p className="text-[11px] text-emerald-700 truncate font-semibold">
                        Saved ₹{discountAmount.toFixed(2)} with code
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 uppercase tracking-wider placeholder:normal-case placeholder:font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={couponState.validationLoading}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shrink-0 cursor-pointer text-center disabled:opacity-60 disabled:cursor-wait"
                    >
                      {couponState.validationLoading ? "Checking..." : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] font-semibold text-red-600">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] font-semibold text-emerald-600">{couponSuccess}</p>
                  )}

                  {/* Quick Popular Coupon Chips */}
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Quick Apply:
                    </span>
                    <div className="space-y-1.5">
                      {(availableCoupons || []).slice(0, 2).map((coupon) => {
                        const isEligible = subtotal >= coupon.minOrder;
                        return (
                          <div
                            key={coupon.code}
                            className="p-2 rounded-xl bg-zinc-50/90 border border-dashed border-zinc-200 flex items-center justify-between gap-2 hover:border-rose-300 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
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
                              disabled={!isEligible || couponState.validationLoading}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 cursor-pointer ${isEligible
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                }`}
                            >
                              {couponState.validationLoading ? "Checking..." : isEligible ? "Apply" : `Min ₹${coupon.minOrder}`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CreditCoins rewards redemption (inside right sidebar) */}
              {creditCoinsBalance > 0 && (
                <div className="pt-2 border-t border-zinc-100">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useCreditCoins}
                      onChange={(e) => setUseCreditCoins(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-400 border-zinc-300 accent-amber-500 cursor-pointer"
                    />
                    <div className="text-xs leading-snug min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-amber-900">
                          Redeem CreditCoins (50 = ₹1)
                        </p>
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {creditCoinsBalance} coins
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800/80 mt-0.5">
                        Your {creditCoinsBalance} coins = ₹{(creditCoinsBalance / 50).toFixed(2)} off your order.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Bill Summary Card */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
              {/* Gradient Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-black text-white tracking-tight">Order Summary</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 capitalize">
                  {orderMode === "delivery" ? "🛵 Delivery" : orderMode === "takeaway" ? "🥡 Takeaway" : "🍽️ Dine-In"}
                </span>
              </div>

              {/* VIP Membership Banner in Cart */}
              <div className="px-5 pt-3">
                {isMember ? (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-rose-500/10 border border-amber-300/50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <div>
                        <p className="font-black text-amber-950">VIP Privileges Active</p>
                        <p className="text-[11px] text-amber-900">100% Free Delivery &amp; 2x CreditCoins applied</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px]">
                      VIP ACTIVE
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/membership"
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">👑</span>
                      <div className="min-w-0">
                        <p className="font-black text-zinc-900 truncate">Join Tastora VIP Club</p>
                        <p className="text-[11px] text-zinc-600 truncate">Get Free Delivery on every order &amp; 10% OFF</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[10px] shadow-2xs group-hover:scale-105 transition-transform">
                      Unlock VIP
                    </span>
                  </Link>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-zinc-600 font-medium">Subtotal
                      <span className="ml-1 text-zinc-400 font-normal">({totalCartCount} item{totalCartCount !== 1 ? 's' : ''})</span>
                    </span>
                    <span className="font-mono text-zinc-900 font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-emerald-600">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Tag className="w-2.5 h-2.5" />
                        </span>
                        Promo ({appliedCoupon.code})
                      </span>
                      <span className="font-mono font-bold">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {isMember && memberDiscountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-amber-700">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 text-amber-600" />
                        </span>
                        VIP Member Discount ({memberDiscountPercent}%)
                      </span>
                      <span className="font-mono font-bold">-₹{memberDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {useCreditCoins && creditCoinsDiscount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-amber-600">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                          <Coins className="w-2.5 h-2.5" />
                        </span>
                        CreditCoins ({coinsConsumed} used)
                      </span>
                      <span className="font-mono font-bold">-₹{creditCoinsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Delivery Fee Line */}
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-zinc-600 font-medium">
                      {orderMode === "delivery"
                        ? "Delivery Fee"
                        : orderMode === "takeaway"
                          ? "Packaging Fee"
                          : "Service Charge"}
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold font-mono flex items-center gap-1">
                        {isMember && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        FREE (₹0.00)
                      </span>
                    ) : (
                      <span className="font-mono text-zinc-900 font-bold">₹{deliveryFee.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-zinc-600 font-medium">Taxes &amp; GST (8.5%)</span>
                    <span className="font-mono text-zinc-900 font-bold">₹{taxAmount.toFixed(2)}</span>
                  </div>

                  {orderMode === "delivery" && deliveryTip > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-rose-600 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        Rider Tip
                      </span>
                      <span className="font-mono font-bold">+₹{deliveryTip.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black block">To Pay</span>
                      <span className="text-[10px] text-zinc-400">Taxes &amp; charges included</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Earn preview banner */}
                {creditCoinsToEarn > 0 && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800 font-semibold">
                    <span>🪙</span>
                    <span>You'll earn <span className="font-black text-amber-900">{creditCoinsToEarn} CreditCoins</span> after this order!</span>
                  </div>
                )}

                {/* Checkout CTA */}
                <div className="space-y-3 pt-2">

                  {orderError && (
                    <p className="text-[11px] font-semibold text-red-600 text-center">{orderError}</p>
                  )}

                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{placing ? "Placing order..." : "Proceed to Checkout"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { icon: "🔒", label: "100% Secure" },
                      { icon: "🌿", label: "Pure Veg" },
                      { icon: "⚡", label: "Fast Delivery" },
                    ].map((badge) => (
                      <div key={badge.label} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <span className="text-base">{badge.icon}</span>
                        <span className="text-[9px] font-bold text-zinc-500 text-center leading-tight">{badge.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pure Veg Guarantee */}
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Pure Vegetarian Fresh Guaranteed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* end right column */}
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
                  ₹{grandTotal.toFixed(2)}
                </span>
                {appliedCoupon && (
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Saved ₹{discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
            >
              <span>{placing ? "Placing..." : "Checkout"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ====================================================
            ADD DELIVERY ADDRESS MODAL
        ==================================================== */}
        {showAddAddressModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-zinc-200">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">Add Delivery Address</h3>
                    <p className="text-[11px] sm:text-xs text-rose-100">Save address for quick doorstep delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveNewAddress} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                {/* Address Type / Tag */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5">Save Address As:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Home", icon: Home },
                      { id: "Office", icon: Building },
                      { id: "Other", icon: MapPin },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSel = newAddress.tag === t.id;
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setNewAddress({ ...newAddress, tag: t.id })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isSel
                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      placeholder="e.g. Ishaan Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address-location-search" className="text-xs font-bold text-zinc-700 block">
                    Find your location
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="address-location-search"
                      type="search"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={locationSuggestions.length > 0}
                      value={locationQuery}
                      onChange={handleQueryChange}
                      placeholder="Search street, building, or area"
                      className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationLoading}
                      className="shrink-0 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-60"
                    >
                      <span className="flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        {locationLoading ? "Locating…" : "Use my location"}
                      </span>
                    </button>
                  </div>
                  {locationSuggestions.length > 0 && (
                    <ul role="listbox" className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                      {locationSuggestions.map((feature, index) => (
                        <li key={`${feature.properties?.place_id || feature.properties?.formatted}-${index}`}>
                          <button
                            type="button"
                            role="option"
                            aria-selected="false"
                            onClick={() => applyLocationFeature(feature)}
                            className="w-full px-3 py-2.5 text-left text-xs text-zinc-800 hover:bg-rose-50"
                          >
                            <span className="block font-bold">{feature.properties?.address_line1 || feature.properties?.name || feature.properties?.formatted}</span>
                            {feature.properties?.address_line2 && (
                              <span className="mt-0.5 block text-[11px] text-zinc-500">{feature.properties.address_line2}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {locationLoading && locationQuery.length >= 3 && (
                    <p className="text-[11px] text-zinc-500">Searching addresses…</p>
                  )}
                  {locationError && <p role="status" className="text-[11px] text-rose-600">{locationError}</p>}
                </div>

                {/* Complete Street Address */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Complete Address / Street *</label>
                  <textarea
                    required
                    rows={2}
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    placeholder="Flat / Floor / Building name, Street name"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    placeholder="e.g. Near Central Park / Metro station"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                  />
                </div>

                {/* City and Zip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">State / Region</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    Save &amp; Deliver Here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  { id: "flat", label: "Flat ₹ OFF" },
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
                {couponState.couponsLoading ? (
                  <p className="py-8 text-center text-sm font-medium text-zinc-500">Loading coupons...</p>
                ) : filteredCoupons.length === 0 ? (
                  <p className="py-8 text-center text-sm font-medium text-zinc-500">No active coupons available.</p>
                ) : filteredCoupons.map((coupon) => {
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
                            disabled={couponState.validationLoading}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            {couponState.validationLoading ? "Checking..." : "Apply Coupon"}
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-xl">
                            Min ₹{coupon.minOrder}
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
                            Add <strong>₹{shortfall.toFixed(2)}</strong> more to activate this discount
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
                  Coupons cannot be clubbed with CreditCoins redemption.
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