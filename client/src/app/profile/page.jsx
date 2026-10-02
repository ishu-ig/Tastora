"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Package,
  MapPin,
  Coins,
  Heart,
  Settings,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Gift,
  Award,
  X,
  Menu,
  Crown,
  Zap,
  Truck,
  Copy,
  Navigation,
  Loader2,
  Search,
  ArrowLeft,
  Star,
  Clock,
  Utensils,
  Receipt,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import useCreditCoins from "../../hooks/useCreditCoins";
import api from "../../lib/axiosInstance";
import { fullMenuCatalog } from "../menu/page";
import "leaflet/dist/leaflet.css";

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? "bg-rose-600" : "bg-zinc-300"
        }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
          }`}
      />
    </button>
  );
}

function Card({ className = "", children }) {
  return (
    <div className={`bg-white rounded-3xl border border-zinc-200/80 shadow-xs ${className}`}>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all";

/* ------------------------------------------------------------------ */
/* Location helpers (OpenStreetMap: free, no API key needed)           */
/* ------------------------------------------------------------------ */

const NOMINATIM = "https://nominatim.openstreetmap.org";
const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

// Watches the GPS for a few seconds and keeps the most accurate fix.
// Calls onUpdate with every improvement so the pin can move live.
function getPreciseLocation(onUpdate, { targetAccuracy = 25, maxWait = 12000 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ code: 0 });
      return;
    }
    let best = null;
    let done = false;
    let watchId = null;
    let timer = null;

    const finish = (err) => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (best) resolve(best);
      else reject(err || { code: 2 });
    };

    watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!best || coords.accuracy < best.accuracy) {
          best = { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy };
          if (onUpdate) onUpdate(best);
        }
        if (coords.accuracy <= targetAccuracy) finish();
      },
      (err) => finish(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    timer = setTimeout(() => finish(), maxWait);
  });
}

// Turns a Nominatim reverse-geocode response into our form fields
function parseNominatim(data) {
  const a = data?.address || {};
  const street = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(" ");
  const area = a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.village;
  const line = [street, area].filter(Boolean).join(", ");
  return {
    addressLine: line || data?.display_name || "",
    city: a.city || a.town || a.village || a.municipality || a.county || a.state_district || "",
    state: a.state || "",
    zipCode: a.postcode || "",
    full: data?.display_name || line,
  };
}

// Interactive map: tap to place the pin, drag the pin to fine-tune.
// Leaflet is loaded in the browser only (it needs `window`).
function MapPicker({ position, accuracy, onPick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const leafletRef = useRef(null);
  const onPickRef = useRef(onPick);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onPickRef.current = onPick;
  });

  const lat = position?.lat;
  const lng = position?.lng;

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, { zoomControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      map.setView([INDIA_CENTER.lat, INDIA_CENTER.lng], 5);
      map.on("click", (e) => onPickRef.current(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      circleRef.current = null;
    };
  }, []);

  // Keep the marker, accuracy circle and view in sync with `position`
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || lat == null || lng == null) return;
    const ll = [lat, lng];

    if (!markerRef.current) {
      const icon = L.divIcon({
        className: "",
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        html:
          '<svg width="34" height="44" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#e11d48"/>' +
          '<circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>',
      });
      const marker = L.marker(ll, { draggable: true, icon }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onPickRef.current(p.lat, p.lng);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(ll);
    }

    if (accuracy) {
      if (!circleRef.current) {
        circleRef.current = L.circle(ll, {
          radius: accuracy,
          color: "#e11d48",
          weight: 1,
          fillColor: "#e11d48",
          fillOpacity: 0.12,
        }).addTo(map);
      } else {
        circleRef.current.setLatLng(ll);
        circleRef.current.setRadius(accuracy);
      }
    } else if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    map.setView(ll, Math.max(map.getZoom(), 16), { animate: true });
  }, [ready, lat, lng, accuracy]);

  return (
    <>
      {/* Tailwind's img reset can distort map tiles; this keeps them intact */}
      <style>{`.leaflet-container{font:inherit}.leaflet-container img.leaflet-tile,.leaflet-container img.leaflet-marker-icon{max-width:none!important;max-height:none!important}`}</style>
      <div
        ref={containerRef}
        className="relative isolate z-0 h-64 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 sm:h-72"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Membership helpers                                                  */
/* ------------------------------------------------------------------ */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const el = document.createElement("script");
    el.src = "https://checkout.razorpay.com/v1/checkout.js";
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

function reasonText(reason, fallback) {
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") return Object.values(reason)[0] || fallback;
  return fallback;
}

function safeItemTitle(item) {
  if (!item) return "Item name unavailable";

  const isLikelyId = (value) => {
    if (typeof value !== "string") return false;
    const cleaned = value.trim();
    if (!cleaned) return false;
    return /^[a-f0-9]{24}$/i.test(cleaned)
      || /^ord-/i.test(cleaned)
      || /^res-/i.test(cleaned)
      || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned);
  };

  const isGenericVariantLabel = (value) => {
    if (typeof value !== "string") return false;
    const cleaned = value.trim();
    if (!cleaned) return true;
    return ["full", "half", "regular", "standard", "default"].includes(cleaned.toLowerCase());
  };

  const walk = (value, seen = new Set(), keyName = "") => {
    if (!value || typeof value === "number") return null;
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned || isLikelyId(cleaned) || isGenericVariantLabel(cleaned)) return null;
      return cleaned;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const found = walk(entry, seen, keyName);
        if (found) return found;
      }
      return null;
    }
    if (typeof value !== "object") return null;
    if (seen.has(value)) return null;
    seen.add(value);

    const priorityKeys = [
      "title",
      "name",
      "customName",
      "productName",
      "productTitle",
      "label",
      "displayName",
      "dishName",
      "variantName",
      "product",
    ];

    for (const key of priorityKeys) {
      const found = walk(value[key], seen, key);
      if (found) return found;
    }

    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      if (["variant", "variantName", "variants", "full", "half", "name"].includes(nestedKey) && isGenericVariantLabel(nestedValue)) {
        continue;
      }
      const found = walk(nestedValue, seen, nestedKey);
      if (found) return found;
    }

    return null;
  };

  return walk(item) || "Item name unavailable";
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const router = useRouter();

  const {
    ordersHistory,
    reservationsHistory,
    savedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    favorites,
    addToCart,
    reorderPastOrder,
    membership: contextMembership,
    isMember: contextIsMember,
    setMembership: setContextMembership,
  } = useCart();

  // Real logged-in user + real coins (single source of truth)
  const { user: authUser, setUser: setAuthUser, checkAuth } = useAuth() || {};
  const creditCoinsBalance = useCreditCoins();

  const phoneStr = authUser?.phoneNo ? String(authUser.phoneNo) : authUser?.phone || "";
  const userProfile = {
    name: authUser?.name || "Customer",
    email: authUser?.email || "",
    phone: phoneStr,
    mobile: phoneStr,
    gender: authUser?.gender || "",
    anniversary: authUser?.anniversary ? String(authUser.anniversary).slice(0, 10) : "",
    joinedDate: authUser?.createdAt
      ? new Date(authUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—",
  };
  const initial = (userProfile.name || "C").charAt(0).toUpperCase();
  const userId = authUser?._id || authUser?.id || null;

  const orders = ordersHistory || [];
  const reservations = reservationsHistory || [];
  const addresses = savedAddresses || [];
  const favMap = favorites || {};

  const [activeTab, setActiveTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // Edit profile
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "Male",
    anniversary: "",
  });

  // Address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const emptyAddr = {
    tag: "Home",
    recipientName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    houseNo: "",
    type: "home",
    lat: null,
    lng: null,
    isDefault: false,
  };
  const [addrForm, setAddrForm] = useState(emptyAddr);
  const [orderFilter, setOrderFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [addrStep, setAddrStep] = useState("map"); // "map" | "form"
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [addrError, setAddrError] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [detectedAddress, setDetectedAddress] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const geocodeReq = useRef(0);

  // Membership
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [membership, setMembership] = useState(null);
  const [buyingId, setBuyingId] = useState(null);
  const [planMsg, setPlanMsg] = useState({ type: "", text: "" });

  // Dietary prefs
  const [jainMode, setJainMode] = useState(false);
  const [veganMode, setVeganMode] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [ecoPackaging, setEcoPackaging] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  // Close drawer on Escape + lock body scroll while open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not specified";
    const parts = String(dateStr).slice(0, 10).split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    showToast(`Copied coupon ${code}`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
      }
      if (setAuthUser) setAuthUser(null);
      setDrawerOpen(false);
      router.push("/");
    }
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: userProfile.name,
      mobile: userProfile.mobile,
      email: userProfile.email,
      gender: userProfile.gender || "Male",
      anniversary: userProfile.anniversary,
    });
    setIsEditProfileModalOpen(true);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const uid = resolveUserId();
      const phoneDigits = profileForm.mobile ? Number(String(profileForm.mobile).replace(/\D/g, "")) : undefined;
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        phoneNo: phoneDigits && !isNaN(phoneDigits) ? phoneDigits : undefined,
        gender: profileForm.gender,
        anniversary: profileForm.anniversary,
      };

      try {
        if (uid) {
          await api.put(`/api/user/${uid}`, payload);
        } else {
          await api.put("/api/user/update", payload);
        }
      } catch {
        await api.put("/api/user/update", payload);
      }

      if (checkAuth) await checkAuth();
      setIsEditProfileModalOpen(false);
      showToast("Profile updated successfully");
    } catch {
      showToast("Could not update profile");
    }
  };

  /* ------------------------- Address helpers ------------------------- */

  const resetLocationUi = () => {
    geocodeReq.current += 1; // ignore any in-flight lookups
    setAddrError("");
    setAccuracy(null);
    setDetectedAddress("");
    setSearchText("");
    setSearchResults([]);
    setLocating(false);
    setResolving(false);
  };

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    resetLocationUi();
    setAddrStep("map");
    setAddrForm({ ...emptyAddr, recipientName: userProfile.name, phone: userProfile.phone });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    resetLocationUi();
    setAddrStep("form");
    setAddrForm({ ...emptyAddr, ...addr });
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    geocodeReq.current += 1;
    setIsAddressModalOpen(false);
  };

  // Look up the street address for a pin and fill the form fields
  async function reverseGeocode(lat, lng) {
    const reqId = ++geocodeReq.current;
    setResolving(true);
    try {
      const res = await axios.get(`${NOMINATIM}/reverse`, {
        params: {
          format: "jsonv2",
          lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1,
          "accept-language": "en",
        },
      });
      if (reqId !== geocodeReq.current) return;
      const p = parseNominatim(res.data);
      setDetectedAddress(p.full);
      setAddrForm((f) => ({
        ...f,
        addressLine: p.addressLine || f.addressLine,
        city: p.city || f.city,
        state: p.state || f.state,
        zipCode: p.zipCode || f.zipCode,
      }));
    } catch {
      if (reqId !== geocodeReq.current) return;
      setDetectedAddress("");
      setAddrError("Pin saved, but we couldn't look up the address. You can type it in the next step.");
    } finally {
      if (reqId === geocodeReq.current) setResolving(false);
    }
  }

  // Place the pin, then resolve its address
  const setPin = (lat, lng, acc = null) => {
    setAddrForm((f) => ({ ...f, lat, lng }));
    setAccuracy(acc);
    setAddrError("");
    reverseGeocode(lat, lng);
  };

  // "Use my live location": refine the GPS fix, moving the pin as it improves
  async function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setAddrError("Your browser doesn't support location access.");
      return;
    }
    setAddrError("");
    setSearchResults([]);
    setLocating(true);
    try {
      const fix = await getPreciseLocation((live) => {
        setAddrForm((f) => ({ ...f, lat: live.lat, lng: live.lng }));
        setAccuracy(live.accuracy);
      });
      setPin(fix.lat, fix.lng, fix.accuracy);
    } catch (geoError) {
      setAddrError(
        geoError?.code === 1
          ? "Location access was denied. Allow it in your browser settings, or search / tap the map instead."
          : "Couldn't get your location. Search for it or tap the map instead."
      );
    } finally {
      setLocating(false);
    }
  }

  // Search a place by name
  async function handleSearch() {
    const q = searchText.trim();
    if (q.length < 3) return;
    setSearching(true);
    setAddrError("");
    try {
      const res = await axios.get(`${NOMINATIM}/search`, {
        params: { format: "jsonv2", q, limit: 5, countrycodes: "in", "accept-language": "en" },
      });
      setSearchResults(res.data || []);
      if (!res.data?.length) setAddrError("No places found. Try a nearby landmark or area name.");
    } catch {
      setAddrError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  const pickSearchResult = (r) => {
    setSearchResults([]);
    setSearchText(r.display_name);
    setPin(parseFloat(r.lat), parseFloat(r.lon), null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrForm.addressLine) return;
    if (editingAddressId) {
      await updateAddress(editingAddressId, addrForm);
      if (addrForm.isDefault) {
        await setDefaultAddress(editingAddressId);
      }
      showToast("Address updated successfully");
    } else {
      const created = await addAddress(addrForm);
      if (addrForm.isDefault && (created?.id || created?._id)) {
        await setDefaultAddress(created.id || created._id);
      }
      showToast("Address saved successfully");
    }
    setIsAddressModalOpen(false);
  };

  /* --------------------------- Membership --------------------------- */
  const resolveUserId = () =>
    userId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("userId") || localStorage.getItem("userid")
      : null);

  async function fetchPlans() {
    setPlansLoading(true);
    try {
      const res = await api.get("/api/membershipplan/active");
      const list = res.data?.data || [];
      setPlans(list.length > 0 ? list : []);
    } catch (err) {
      try {
        const res2 = await api.get("/api/membership/plans");
        setPlans(res2.data?.data || []);
      } catch (err2) {
        setPlanMsg({
          type: "error",
          text: reasonText(err.response?.data?.reason, "Could not load membership plans."),
        });
      }
    } finally {
      setPlansLoading(false);
    }
  }

  async function fetchMembership() {
    const uid = resolveUserId();
    if (!uid) return;
    try {
      const res = await api.get(`/api/membership/current/${uid}`);
      const m = res.data?.data || null;
      setMembership(m);
      if (setContextMembership) setContextMembership(m);
    } catch {
      setMembership(null);
    }
  }

  useEffect(() => {
    fetchPlans();
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const membershipEndDate = membership?.endDate || membership?.expiresAt;
  const isActive = Boolean(
    membership &&
    membership.status === "active" &&
    membershipEndDate &&
    new Date(membershipEndDate) > new Date()
  );
  const planName = membership?.plan?.name || membership?.planName || "VIP Club";
  const daysRemaining = membershipEndDate
    ? Math.max(0, Math.ceil((new Date(membershipEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDateIN = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  async function handleBuy(plan) {
    const uid = resolveUserId();
    setPlanMsg({ type: "", text: "" });
    if (!uid) {
      setPlanMsg({ type: "error", text: "Please log in to purchase a membership." });
      return;
    }
    setBuyingId(plan._id);

    try {
      // 1. Ask the server to create an order for this plan
      const orderRes = await api.post("/api/membership/order", {
        user: uid,
        userid: uid,
        planId: plan._id,
        planid: plan._id,
      });

      if (orderRes.data?.free) {
        setPlanMsg({ type: "success", text: `🎉 You are now a ${plan.name} VIP member!` });
        showToast("VIP Membership activated!");
        fetchMembership();
        if (checkAuth) await checkAuth();
        setBuyingId(null);
        return;
      }

      if (orderRes.data?.result !== "Done") {
        setPlanMsg({
          type: "error",
          text: reasonText(orderRes.data?.reason, "Could not start the payment."),
        });
        setBuyingId(null);
        return;
      }

      const orderData = orderRes.data.data || orderRes.data;
      const rpOrderId = orderData.orderId || orderData.id || orderRes.data.orderId;
      const rpKey = orderData.key || orderRes.data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_hPWsSLPsp2DADQ";
      const membershipId = orderRes.data.membershipid || orderRes.data.membershipId;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPlanMsg({
          type: "error",
          text: "Could not load the payment window. Check your connection and try again.",
        });
        setBuyingId(null);
        return;
      }

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: rpKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Tastora Pure Dining",
        description: `${plan.name} VIP Membership`,
        order_id: rpOrderId,
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: userProfile.phone || userProfile.mobile,
        },
        theme: { color: "#e11d48" },
        modal: { ondismiss: () => setBuyingId(null) },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/membership/verify", {
              membershipid: membershipId,
              user: uid,
              planId: plan._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data?.result === "Done") {
              setPlanMsg({ type: "success", text: `🎉 Welcome to ${plan.name} Membership!` });
              showToast("VIP Membership activated successfully!");
              fetchMembership();
              if (checkAuth) await checkAuth();
            } else {
              setPlanMsg({
                type: "error",
                text: reasonText(
                  verifyRes.data?.reason || verifyRes.data?.message,
                  "Payment received, but verification failed. Please contact support."
                ),
              });
            }
          } catch (err) {
            setPlanMsg({
              type: "error",
              text: reasonText(err.response?.data?.reason, "Activating your membership..."),
            });
            fetchMembership();
          } finally {
            setBuyingId(null);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        setPlanMsg({
          type: "error",
          text: resp?.error?.description || "Payment failed or cancelled.",
        });
        setBuyingId(null);
      });

      rzp.open();
    } catch (err) {
      setPlanMsg({
        type: "error",
        text: reasonText(err.response?.data?.reason, "Internal Server Error. Please try again."),
      });
      setBuyingId(null);
    }
  }

  const favoritedDishes = (fullMenuCatalog || []).filter((d) => favMap[d.id]);
  const activeLiveOrder = orders.find(
    (o) => o.status === "In Kitchen" || o.status === "Picked Up" || o.status === "Confirmed"
  );

  // Tier from real coins
  const tier =
    creditCoinsBalance >= 300
      ? { name: "Platinum Patron", next: null }
      : creditCoinsBalance >= 100
        ? { name: "Gold Patron", next: 300 }
        : { name: "Silver Foodie", next: 100 };
  const tierProgress = tier.next ? Math.min(100, Math.round((creditCoinsBalance / tier.next) * 100)) : 100;

  const NAV = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "orders", label: "My Orders", icon: Package, badge: orders.length },
    { id: "membership", label: "VIP Membership", icon: Crown, badge: isActive ? "Active" : "Join VIP" },
    { id: "creditcoins", label: "CreditCoins", icon: Coins, badge: creditCoinsBalance },
    { id: "addresses", label: "Saved Addresses", icon: MapPin, badge: addresses.length },
    { id: "bookings", label: "Table Bookings", icon: Calendar, badge: reservations.length },
    { id: "favorites", label: "Favorites", icon: Heart, badge: favoritedDishes.length },
    { id: "dietary", label: "Dietary Preferences", icon: ShieldCheck },
    { id: "settings", label: "Account Details", icon: Settings },
  ];
  const activeNav = NAV.find((n) => n.id === activeTab) || NAV[0];

  const goTab = (id) => {
    setActiveTab(id);
    setDrawerOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------- Sidebar ---------------------------- */
  const renderSidebar = () => (
    <div className="flex h-full flex-col">
      {/* User card with VIP Crown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/80 p-4 text-white shadow-md border border-amber-500/25">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-500/15 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-lg font-black text-white shadow-md border border-white/20">
            {initial}
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-zinc-950 shadow-xs ring-2 ring-zinc-900">
                👑
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-black text-white">{userProfile.name}</p>
              {isActive && (
                <span className="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-400/30">
                  VIP
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-zinc-400">{userProfile.phone || userProfile.email}</p>
          </div>
        </div>
        <div className="relative mt-3 flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-[11px] font-bold border border-white/5">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Coins className="h-3.5 w-3.5" />
            {creditCoinsBalance} Coins
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            {isActive ? planName.split(" ")[0] : tier.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-0.5" aria-label="Account sections">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">My Account</p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const selected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => goTab(item.id)}
              className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${selected
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              aria-current={selected ? "page" : undefined}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${selected ? "text-amber-400" : "text-zinc-400 group-hover:text-rose-500"
                    }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-zinc-700 text-amber-300" : "bg-zinc-100 text-zinc-600"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quick Links</p>
        <Link
          href="/menu"
          onClick={() => setDrawerOpen(false)}
          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex items-center gap-3">
            <Utensils className="h-4 w-4 text-zinc-400 group-hover:text-rose-500" />
            Explore Menu
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
        </Link>
        <Link
          href="/reserve"
          onClick={() => setDrawerOpen(false)}
          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-zinc-400 group-hover:text-rose-500" />
            Fine Dining Booking
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
            {reservations.length}
          </span>
        </Link>
        <Link
          href="/wishlist"
          onClick={() => setDrawerOpen(false)}
          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-zinc-400 group-hover:text-rose-500" />
            Wishlist
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
        </Link>
        <Link
          href="/membership"
          onClick={() => setDrawerOpen(false)}
          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-50"
        >
          <span className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-amber-500" />
            VIP Club Portal
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {isActive ? "Active" : "Join"}
          </span>
        </Link>
      </nav>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  /* --------------------------- Tab content --------------------------- */
  const coupons = [
    { code: "PUREVEG50", title: "50% OFF up to ₹100", desc: "On Paneer & Thali combos", color: "border-rose-200 bg-rose-50/60" },
    { code: "FEAST20", title: "Flat 20% OFF", desc: "On orders above ₹500", color: "border-emerald-200 bg-emerald-50/60" },
    { code: "FREESHIP", title: "Free Delivery", desc: "No minimum for VIP members", color: "border-amber-200 bg-amber-50/60" },
  ];

  /* 1. Overview Tab */
  const renderOverview = () => (
    <div className="space-y-5">
      {/* Live Order Spotlight if present */}
      {activeLiveOrder && (
        <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                Live Order
              </span>
              <span className="font-mono text-xs text-rose-100">
                #{activeLiveOrder.id} • ETA {activeLiveOrder.eta || "18-22 mins"}
              </span>
            </div>
            <p className="text-sm font-black sm:text-base">
              {activeLiveOrder.status === "In Kitchen"
                ? "👨‍🍳 Your pure-veg meal is being prepared with love"
                : activeLiveOrder.status === "Picked Up"
                  ? "🛵 Rider is on the way in a sealed thermal bag"
                  : "✨ Order confirmed, preparing in a pure Satvik kitchen"}
            </p>
          </div>
          <Link
            href={`/orders/track?id=${activeLiveOrder.id}`}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-rose-600 shadow-md transition-all hover:bg-rose-50"
          >
            <Navigation className="h-4 w-4" />
            Live GPS Tracking
          </Link>
        </div>
      )}

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          { label: "CreditCoins", value: creditCoinsBalance, icon: Coins, tone: "bg-amber-100 text-amber-700", onClick: () => goTab("creditcoins") },
          { label: "My Orders", value: orders.length, icon: Package, tone: "bg-rose-100 text-rose-600", onClick: () => goTab("orders") },
          { label: "Table Bookings", value: reservations.length, icon: Calendar, tone: "bg-emerald-100 text-emerald-700", onClick: () => goTab("bookings") },
          { label: "Favorites", value: favoritedDishes.length, icon: Heart, tone: "bg-pink-100 text-rose-600", onClick: () => goTab("favorites") },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={s.onClick}
              className="rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-xs transition-all hover:border-rose-300 hover:shadow-md sm:p-5 cursor-pointer group"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.tone} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-zinc-900">{s.value}</p>
                <p className="text-xs font-semibold text-zinc-500">{s.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIP Membership Hero Card */}
      {isActive ? (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/60 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-2xl border border-amber-400/30 shadow-inner">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Tastora VIP Member</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{planName}</h3>
                <p className="text-xs text-zinc-400">Valid until {formatDateIN(membershipEndDate)}</p>
              </div>
            </div>
            <button
              onClick={() => goTab("membership")}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 px-4 py-2.5 text-xs font-black text-amber-300 hover:bg-amber-400/30 transition-all cursor-pointer"
            >
              <Crown className="h-3.5 w-3.5" />
              View VIP Privileges
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1.5">
              <span>Membership Period</span>
              <span className="text-amber-300">{daysRemaining} days remaining</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 90) * 100))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: "Free Delivery", desc: "Every order, zero fee", icon: Truck },
              { label: "10% Member Off", desc: "On signature dishes", icon: Sparkles },
              { label: "Priority Kitchen", desc: "Faster cooking dispatch", icon: Zap },
              { label: "2x CreditCoins", desc: "Double reward cashback", icon: Coins },
            ].map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-xs">
                  <Icon className="h-4 w-4 text-amber-400 mb-1" />
                  <p className="text-xs font-black text-zinc-100">{perk.label}</p>
                  <p className="text-[10px] text-zinc-400">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/60 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-2xl border border-amber-400/30">
                👑
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Exclusive VIP Dining</span>
                <h3 className="text-xl font-black text-white">Join Tastora VIP Club</h3>
                <p className="text-xs text-zinc-300">Enjoy 100% Free Delivery, Flat 10% Member Discount &amp; Priority Kitchen</p>
              </div>
            </div>
            <button
              onClick={() => goTab("membership")}
              className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 px-5 py-2.5 text-xs font-black text-zinc-950 shadow-md transition-all hover:opacity-95 cursor-pointer"
            >
              <Crown className="h-4 w-4" />
              Unlock VIP Club
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-white/10 pt-4">
            {[
              { label: "Free Delivery", desc: "No minimum order limit", icon: Truck },
              { label: "10% Member Off", desc: "On all satvik specialties", icon: Sparkles },
              { label: "Priority Kitchen", desc: "Fast-tracked orders", icon: Zap },
              { label: "Bonus CreditCoins", desc: "Earn double cashback", icon: Coins },
            ].map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="rounded-2xl border border-white/5 bg-white/5 p-3">
                  <Icon className="h-4 w-4 text-amber-400 mb-1" />
                  <p className="text-xs font-black text-zinc-100">{perk.label}</p>
                  <p className="text-[10px] text-zinc-400">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-black text-zinc-900 sm:text-base">Recent Orders</h3>
            </div>
            <button onClick={() => goTab("orders")} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
              View All ({orders.length})
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {orders.slice(0, 2).map((order) => (
              <div key={order.id || order.dbId} className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black text-zinc-900">#{order.id}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 truncate">
                  {order.items?.map((i) => `${safeItemTitle(i)} (x${i.quantity || 1})`).join(", ") || "Satvik Specialties"}
                </p>
                <div className="flex items-center justify-between border-t border-zinc-200/60 pt-2 text-xs">
                  <span className="font-mono font-bold text-zinc-900">₹{Number(order.total).toFixed(2)}</span>
                  <button
                    onClick={() => {
                      reorderPastOrder(order);
                      showToast("Items added to your cart!");
                    }}
                    className="flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coupons */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-black text-zinc-900 sm:text-base">Vouchers &amp; Coupons</h3>
          </div>
          <span className="text-xs font-semibold text-zinc-400">Tap to copy</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCopyCoupon(c.code)}
              className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${c.color}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 font-mono text-sm font-black text-zinc-900">{c.code}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                  {copiedCoupon === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCoupon === c.code ? "Copied" : "Copy"}
                </span>
              </div>
              <p className="mt-2 text-xs font-black text-zinc-900">{c.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-600">{c.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Pure Veg Pledge */}
      <div className="flex items-start gap-3 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-4 sm:p-5">
        <span className="text-2xl leading-none">🌿</span>
        <div>
          <h4 className="text-sm font-black text-emerald-950">100% Pure Vegetarian &amp; Satvik Promise</h4>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
            Every dish is prepared in an onion-garlic mindful, dedicated pure-veg culinary sanctuary and delivered in tamper-evident sealed thermal containers.
          </p>
        </div>
      </div>
    </div>
  );

  /* 2. My Orders Tab (Live backend data) */
  const renderOrders = () => {
    const filtered = orders.filter((o) => {
      if (orderFilter === "active") return o.status === "In Kitchen" || o.status === "Picked Up" || o.status === "Confirmed";
      if (orderFilter === "delivered") return o.status === "Delivered";
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 p-1">
            {[
              { id: "all", label: `All Orders (${orders.length})` },
              { id: "active", label: "In Progress" },
              { id: "delivered", label: "Delivered" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOrderFilter(f.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${orderFilter === f.id ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Order More Food
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card className="space-y-3 p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="text-base font-black text-zinc-800">No orders found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Explore our 100% Satvik pure-veg culinary specials and place your first royal meal.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Utensils className="h-4 w-4" /> Browse Satvik Menu
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const isLive = order.status === "In Kitchen" || order.status === "Picked Up" || order.status === "Confirmed";
              return (
                <Card key={order.id || order.dbId} className="overflow-hidden border border-zinc-200/80 p-5 space-y-4 hover:border-rose-300 transition-all">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-zinc-900">#{order.id}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-xs font-semibold text-zinc-500">{order.date}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold text-zinc-700 capitalize">
                        {order.orderMode === "delivery" && <Truck className="h-3 w-3 text-rose-500" />}
                        {order.orderMode === "takeaway" && <Package className="h-3 w-3 text-amber-500" />}
                        {order.orderMode === "dinein" && <Utensils className="h-3 w-3 text-emerald-500" />}
                        {order.orderMode}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${order.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : isLive
                          ? "bg-amber-100 text-amber-800"
                          : "bg-zinc-100 text-zinc-700"
                        }`}
                    >
                      {isLive && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
                      {order.status}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image && (
                            <img src={item.image} alt={safeItemTitle(item)} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-zinc-200" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-bold text-zinc-900">{safeItemTitle(item)}</p>
                            <p className="text-[11px] text-zinc-500">Qty: {Number(item.quantity) || 1}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-zinc-800">₹{(Number(item.price || 0) * (Number(item.quantity) || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details & Total Bar */}
                  <div className="rounded-2xl bg-zinc-50 p-3.5 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 text-zinc-600">
                      <span className="text-[11px]">Destination:</span>
                      <span className="text-right font-semibold text-zinc-800 truncate max-w-xs">
                        {order.deliveryAddress || order.tableNumber || "Tastora Counter"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-200/60 pt-2 font-bold text-zinc-900">
                      <span>Total Paid:</span>
                      <div className="flex items-center gap-2">
                        {order.coinsDiscount > 0 && (
                          <span className="text-[11px] font-semibold text-amber-600">(-₹{order.coinsDiscount} coins)</span>
                        )}
                        <span className="font-mono text-base font-black text-rose-600">₹{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        reorderPastOrder(order);
                        showToast("All items added to your cart!");
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reorder All Items
                    </button>
                    {isLive && (
                      <Link
                        href={`/orders/track?id=${order.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5 text-amber-400" /> Live GPS Tracking
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* 3. VIP Membership Tab (Full system integration) */
  const renderMembership = () => (
    <div className="space-y-6">
      {/* Royal VIP Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/60 p-6 sm:p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-3xl border border-amber-400/40 shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">Tastora Royal Club</span>
                {isActive && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                    VIP Active
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{isActive ? planName : "Elevate Your Dining"}</h2>
              <p className="text-xs text-zinc-300">
                {isActive
                  ? `Valid through ${formatDateIN(membershipEndDate)} (${daysRemaining} days remaining)`
                  : "Unlock Free Delivery, 10% Member Discounts & Exclusive Satvik Privileges"}
              </p>
            </div>
          </div>
          {isActive && (
            <div className="rounded-2xl border border-amber-400/30 bg-black/40 px-4 py-2.5 text-right">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Member ID</p>
              <p className="font-mono text-xs font-black text-amber-300">VIP-{userId ? String(userId).slice(-6).toUpperCase() : "MEMBER"}</p>
            </div>
          )}
        </div>

        {isActive && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span>Membership Validity</span>
              <span className="text-amber-400">{daysRemaining} Days Left</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 90) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlocked Privileges */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { title: "Free Delivery", desc: "100% Free on all orders", icon: Truck },
            { title: "10% Member Off", desc: "Instant discount on dishes", icon: Sparkles },
            { title: "Priority Kitchen", desc: "Chefs prioritize your food", icon: Zap },
            { title: "2x CreditCoins", desc: "Double coins on every bill", icon: Coins },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                <Icon className="h-5 w-5 text-amber-400 mb-1.5" />
                <h4 className="text-xs font-black text-white">{item.title}</h4>
                <p className="text-[11px] text-zinc-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {planMsg.text && (
        <p
          role="status"
          className={`rounded-2xl border p-3.5 text-xs font-bold ${planMsg.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          {planMsg.text}
        </p>
      )}

      {/* Plans Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-zinc-900">Available VIP Plans</h3>
            <p className="text-xs text-zinc-500">Choose a plan that fits your dining lifestyle</p>
          </div>
        </div>

        {plansLoading ? (
          <Card className="flex items-center justify-center gap-2 p-10 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
            Loading VIP plans…
          </Card>
        ) : plans.length === 0 ? (
          <Card className="p-8 text-center text-sm text-zinc-500">
            No plans available currently. Please check back shortly.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const current = isActive && (membership?.plan?._id === plan._id || membership?.planId === plan._id);
              const durationStr = plan.durationInMonths
                ? `${plan.durationInMonths} Month${plan.durationInMonths > 1 ? "s" : ""}`
                : plan.durationDays
                  ? `${plan.durationDays} Days`
                  : "Plan";

              return (
                <Card
                  key={plan._id}
                  className={`flex flex-col justify-between p-6 transition-all hover:shadow-lg ${plan.popular ? "border-amber-400/80 ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/30 to-white" : ""
                    }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-black text-zinc-900">{plan.name}</h4>
                        <span className="text-[11px] font-semibold text-zinc-500">{durationStr} Access</span>
                      </div>
                      {plan.popular && (
                        <span className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-zinc-900">₹{plan.price}</span>
                      <span className="text-xs font-semibold text-zinc-400">/ {durationStr}</span>
                    </div>

                    {plan.description && <p className="mt-2 text-xs text-zinc-600">{plan.description}</p>}

                    <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                      {(plan.features && plan.features.length > 0
                        ? plan.features
                        : [
                          "100% Free delivery on all food orders",
                          "10% Member discount on signature menu",
                          "Priority kitchen preparation",
                          "2x Bonus CreditCoins on every order",
                        ]
                      ).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={buyingId !== null || current}
                    onClick={() => handleBuy(plan)}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black shadow-md transition-all cursor-pointer ${current
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-rose-500/20 hover:opacity-95"
                      }`}
                  >
                    {buyingId === plan._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Starting Payment…
                      </>
                    ) : current ? (
                      "Current Plan (Active)"
                    ) : (
                      <>
                        <Crown className="h-4 w-4" /> Unlock {plan.name}
                      </>
                    )}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* 4. Saved Addresses Tab (With default address controls) */
  const renderAddresses = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-500">
          {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
        </p>
        <button
          onClick={handleOpenNewAddress}
          className="flex items-center gap-1.5 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-600/20 transition-all hover:bg-rose-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <Card className="space-y-3 p-8 text-center">
          <MapPin className="mx-auto h-12 w-12 text-zinc-300" />
          <p className="text-sm font-bold text-zinc-700">No saved addresses yet</p>
          <p className="text-xs text-zinc-400">Add your home or office address for faster checkout.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => {
            const isDef = Boolean(addr.isDefault);
            return (
              <Card
                key={addr.id || addr._id}
                className={`flex flex-col justify-between space-y-4 p-5 transition-all ${isDef ? "border-amber-400/80 ring-2 ring-amber-400/20 shadow-md" : "border-zinc-200/80"
                  }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase text-rose-800">
                        <MapPin className="h-3 w-3 text-rose-600" />
                        {addr.tag}
                      </span>
                      {isDef && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800 border border-amber-300">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                        aria-label="Edit address"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id || addr._id)}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600">
                    <p className="text-sm font-black text-zinc-900">{addr.recipientName}</p>
                    <p className="leading-relaxed">{[addr.houseNo, addr.addressLine].filter(Boolean).join(", ")}</p>
                    {addr.landmark && <p className="text-[11px] italic text-zinc-400">Landmark: {addr.landmark}</p>}
                    <p className="font-mono text-[11px] text-zinc-500">
                      {[addr.city, addr.state, addr.zipCode].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-[11px] text-zinc-500">Contact: {addr.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px]">
                  {isDef ? (
                    <span className="flex items-center gap-1 font-bold text-amber-700">
                      <Check className="h-3.5 w-3.5 text-amber-600" /> Delivering here by default
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        await setDefaultAddress(addr.id || addr._id);
                        showToast(`Set ${addr.tag || "Address"} as default delivery address`);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-bold text-zinc-700 hover:border-amber-400 hover:text-amber-800 transition-colors cursor-pointer"
                    >
                      <Star className="h-3 w-3 text-amber-500" /> Set as Default
                    </button>
                  )}
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active zone
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  /* 5. Table Bookings Tab */
  const renderBookings = () => {
    const filtered = reservations.filter((r) => {
      if (bookingFilter === "upcoming") return r.status === "Confirmed" || r.status === "Pending";
      if (bookingFilter === "completed") return r.status === "Completed";
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 p-1">
            {[
              { id: "all", label: `All Bookings (${reservations.length})` },
              { id: "upcoming", label: "Upcoming" },
              { id: "completed", label: "Completed" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setBookingFilter(f.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${bookingFilter === f.id ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link
            href="/reserve"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
          >
            <Calendar className="h-3.5 w-3.5" /> Book a Table
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card className="space-y-3 p-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="text-base font-black text-zinc-800">No reservations found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Reserve a table at The Royal Courtyard or Starlit Rooftop for an exquisite Satvik fine-dining evening.
            </p>
            <Link
              href="/reserve"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              Book a Dining Table
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((res) => (
              <Card key={res.id || res.dbId} className="flex flex-col justify-between p-5 space-y-4 border border-zinc-200/80 hover:border-emerald-300 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-zinc-400">#{res.id}</span>
                      <h4 className="text-base font-black text-zinc-900">{res.zone || "The Royal Courtyard"}</h4>
                      <p className="text-xs font-semibold text-rose-600">{res.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${res.status === "Confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : res.status === "Completed"
                          ? "bg-zinc-100 text-zinc-700"
                          : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">Guests</span>
                      <p className="font-black text-zinc-900">{res.guests} Guests</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">Occasion</span>
                      <p className="font-black text-zinc-900 truncate">{res.occasion || "Fine Dining"}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">Dietary</span>
                      <p className="font-black text-emerald-700">100% Satvik</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">Deposit Paid</span>
                      <p className="font-mono font-black text-zinc-900">₹{Number(res.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-[11px] text-zinc-400">Need adjustments? Contact staff</span>
                  <Link
                    href="/reserve"
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-200 transition-colors"
                  >
                    Book Again
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* 6. CreditCoins Rewards Tab */
  const renderCoins = () => (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md">🪙</div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Available Balance</span>
            <h3 className="text-3xl font-black sm:text-4xl">
              {creditCoinsBalance} <span className="text-lg font-bold">Coins</span>
            </h3>
            <p className="mt-0.5 text-xs text-rose-100">
              Worth <span className="font-black text-white">₹{(creditCoinsBalance / 50).toFixed(2)}</span> off at checkout (50 coins = ₹1 discount)
            </p>
          </div>
        </div>
        <Link
          href="/menu"
          className="rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-rose-600 shadow-md transition-all hover:bg-rose-50"
        >
          Order &amp; Earn 10% Coins
        </Link>
      </div>

      <Card className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
          <span className="flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-amber-500" />
            {tier.name}
          </span>
          <span className="text-zinc-400">{tier.next ? `${tier.next - creditCoinsBalance} coins to next tier` : "Top tier reached"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${tierProgress}%` }} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Gift, t: "10% Cashback", d: "Earn 10% value in CreditCoins automatically on every completed order." },
          { icon: Zap, t: "1-Click Redemption", d: "50 coins = ₹1 discount applied directly at checkout." },
          { icon: Crown, t: "VIP Advantage", d: "VIP Club members earn 2x bonus CreditCoins on all dining orders." },
        ].map((x) => {
          const Icon = x.icon;
          return (
            <Card key={x.t} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-black text-zinc-900">{x.t}</h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{x.d}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 text-center">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Live Balance Sync</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Your CreditCoins are tied directly to your user account and balance updates instantly across web and mobile.
        </p>
      </Card>
    </div>
  );

  /* 7. Favorites Tab */
  const renderFavorites = () => (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-zinc-500">{favoritedDishes.length} favorite dishes</p>
      {favoritedDishes.length === 0 ? (
        <Card className="space-y-3 p-8 text-center">
          <Heart className="mx-auto h-12 w-12 text-zinc-300" />
          <p className="text-sm font-bold text-zinc-700">No favorites saved yet</p>
          <p className="text-xs text-zinc-400">Tap the heart on any dish in the menu to save it here.</p>
          <Link href="/menu" className="inline-flex rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700">
            Explore Menu
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favoritedDishes.map((dish) => (
            <Card key={dish.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-40 bg-zinc-100">
                <img src={dish.image} alt={dish.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-4">
                <h4 className="truncate text-sm font-bold text-zinc-900">{dish.title}</h4>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-black text-rose-600">₹{Number(dish.price).toFixed(0)}</span>
                  <button
                    onClick={() => {
                      addToCart(dish, 1);
                      showToast(`Added ${dish.title} to cart`);
                    }}
                    className="rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-rose-700 cursor-pointer"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  /* 8. Dietary Preferences Tab */
  const renderDietary = () => (
    <Card className="space-y-3 p-5 sm:p-6">
      {[
        { t: "Jain Mode (No Onion / Garlic)", d: "Show dishes prepared strictly without root vegetables.", v: jainMode, s: setJainMode },
        { t: "Vegan Mode", d: "Highlight dishes made entirely without dairy or honey.", v: veganMode, s: setVeganMode },
        { t: "Eco-friendly Packaging", d: "Use compostable sealed paper packaging where possible.", v: ecoPackaging, s: setEcoPackaging },
        { t: "WhatsApp Order Updates", d: "Get live kitchen and dispatch updates on your WhatsApp.", v: whatsappUpdates, s: setWhatsappUpdates },
      ].map((row) => (
        <div key={row.t} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900">{row.t}</p>
            <p className="text-xs text-zinc-500">{row.d}</p>
          </div>
          <Toggle checked={row.v} onChange={row.s} label={row.t} />
        </div>
      ))}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-900">Default Spice Level</p>
          <p className="text-xs text-zinc-500">Our chefs adjust regional spices and gravies to this heat profile.</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["Mild", "Medium", "Hot"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSpiceLevel(lvl)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${spiceLevel === lvl ? "border-rose-600 bg-rose-600 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-rose-50"
                }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => showToast("Dietary preferences updated successfully")}
        className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
      >
        Save Preferences
      </button>
    </Card>
  );

  /* 9. Settings Tab */
  const renderSettings = () => {
    const rows = [
      { icon: User, label: "Full Name", value: userProfile.name },
      { icon: Phone, label: "Mobile Number", value: userProfile.mobile || "Not added" },
      { icon: Mail, label: "Email Address", value: userProfile.email || "Not added" },
      { icon: Award, label: "Gender", value: userProfile.gender || "Not specified" },
      { icon: Gift, label: "Anniversary", value: formatDate(userProfile.anniversary) },
      { icon: Calendar, label: "Member Since", value: userProfile.joinedDate },
    ];
    return (
      <div className="space-y-5">
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-zinc-900">Personal Information</h3>
              <p className="text-xs text-zinc-500">Used for deliveries, orders, and table reservations.</p>
            </div>
            <button
              onClick={handleOpenEditProfile}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Details
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="space-y-1 rounded-2xl border border-zinc-200/70 bg-zinc-50 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <Icon className="h-3.5 w-3.5 text-rose-600" />
                    {r.label}
                  </div>
                  <p className="truncate text-sm font-black text-zinc-900">{r.value}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-red-900">Sign out of this device</p>
            <p className="text-xs text-red-700">You will need to sign in again to access saved items and active orders.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  const content = {
    overview: renderOverview,
    orders: renderOrders,
    membership: renderMembership,
    creditcoins: renderCoins,
    addresses: renderAddresses,
    bookings: renderBookings,
    favorites: renderFavorites,
    dietary: renderDietary,
    settings: renderSettings,
  }[activeTab];

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="min-h-screen bg-zinc-50/70 pb-24 pt-36 sm:pt-40">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-4 top-28 z-[70] flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 sm:right-6">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <Link href="/" className="transition-colors hover:text-rose-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-bold text-rose-600">My Account</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-36 h-[calc(100vh-10rem)] rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xs">
              {renderSidebar()}
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 space-y-5">
            {/* Mobile / tablet account bar */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs lg:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 text-sm font-black text-white">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-900">{userProfile.name}</p>
                  <p className="truncate text-[11px] font-semibold text-rose-600">{activeNav.label}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white cursor-pointer"
                aria-label="Open account menu"
              >
                <Menu className="h-4 w-4" />
                Menu
              </button>
            </div>

            {/* Mobile quick scrollable nav pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden -mx-1 px-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const selected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => goTab(item.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${selected
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${selected ? "text-amber-400" : "text-zinc-400"}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${selected ? "bg-zinc-700 text-amber-300" : "bg-zinc-100 text-zinc-600"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Section title */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">{activeNav.label}</h1>
                <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
                  Welcome back, {userProfile.name.split(" ")[0]}
                </p>
              </div>
              {activeTab === "overview" && (
                <button
                  onClick={handleOpenEditProfile}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-rose-600 shadow-xs border border-rose-100 transition-all hover:bg-rose-50 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            {content && content()}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[61] flex w-[86vw] max-w-sm flex-col bg-white p-4 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Account menu"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black text-zinc-900">Account Menu</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-all hover:bg-zinc-200 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1">{renderSidebar()}</div>
      </aside>

      {/* Edit profile modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-zinc-100 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">Edit Profile</h3>
                  <p className="text-[11px] text-zinc-500">Update your personal details</p>
                </div>
              </div>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 overflow-y-auto p-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Full Name *</label>
                <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputCls} placeholder="Your full name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Mobile Number *</label>
                  <input type="tel" required value={profileForm.mobile} onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })} className={inputCls} placeholder="10-digit number" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Email *</label>
                  <input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className={inputCls} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Gender</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: "Male", label: "Male", icon: "👨" },
                    { id: "Female", label: "Female", icon: "👩" },
                    { id: "Other", label: "Other", icon: "✨" },
                    { id: "Prefer not to say", label: "Private", icon: "🔒" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, gender: g.id })}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-bold transition-all cursor-pointer ${profileForm.gender === g.id ? "border-rose-600 bg-rose-600 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-rose-50"
                        }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Anniversary Date</label>
                <input type="date" value={profileForm.anniversary} onChange={(e) => setProfileForm({ ...profileForm, anniversary: e.target.value })} className={inputCls} />
                <p className="mt-1.5 rounded-lg border border-rose-100 bg-rose-50/80 p-2 text-[11px] font-medium text-rose-700">
                  🎉 Enjoy a complimentary chef treat on your anniversary.
                </p>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-zinc-100 pt-4">
                <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                  <Check className="h-4 w-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address modal: step 1 pin on map, step 2 details */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 p-5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {addrStep === "map" ? "Pin your location" : editingAddressId ? "Edit Address" : "Address details"}
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    {addrStep === "map"
                      ? "Step 1 of 2: place the pin where we should deliver"
                      : "Step 2 of 2: add the finer details"}
                  </p>
                </div>
              </div>
              <button onClick={closeAddressModal} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 cursor-pointer" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            {addrStep === "map" ? (
              <div className="space-y-3 overflow-y-auto p-5">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-3 text-xs font-bold text-white shadow-sm shadow-rose-600/20 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  {locating ? "Getting a precise fix…" : "Use my live location"}
                </button>

                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      placeholder="Or search an area, society or landmark"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={searching}
                      className="flex shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-3.5 text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
                      aria-label="Search place"
                    >
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                      {searchResults.map((r) => (
                        <li key={r.place_id}>
                          <button
                            type="button"
                            onClick={() => pickSearchResult(r)}
                            className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-zinc-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                            <span className="line-clamp-2">{r.display_name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <MapPicker
                  position={addrForm.lat != null && addrForm.lng != null ? { lat: addrForm.lat, lng: addrForm.lng } : null}
                  accuracy={accuracy}
                  onPick={(lat, lng) => setPin(lat, lng, null)}
                />

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  {addrForm.lat == null ? (
                    <p className="text-xs text-zinc-500">
                      No pin yet. Use your live location, search for a place, or tap the map.
                    </p>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900">
                          {resolving ? "Finding address…" : detectedAddress || "Pin placed"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          {accuracy != null
                            ? `Accurate to about ${Math.round(accuracy)} m. ${accuracy > 100 ? "Drag the pin to correct it." : "Drag the pin to fine-tune."}`
                            : "Drag the pin or tap the map to adjust."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {addrError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] font-medium text-red-700">
                    {addrError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddrStep("form")}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:underline cursor-pointer"
                  >
                    Enter address manually
                  </button>
                  <button
                    type="button"
                    disabled={addrForm.lat == null || resolving || locating}
                    onClick={() => setAddrStep("form")}
                    className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    Confirm location
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddressSubmit} className="space-y-4 overflow-y-auto p-5">
                <div
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${addrForm.lat != null ? "border-emerald-200 bg-emerald-50/70" : "border-zinc-200 bg-zinc-50"
                    }`}
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${addrForm.lat != null ? "text-emerald-600" : "text-zinc-400"}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-900">
                        {addrForm.lat != null ? "Location pinned" : "No map pin yet"}
                      </p>
                      <p className="truncate text-[11px] text-zinc-600">
                        {detectedAddress || addrForm.addressLine || "Add a pin for accurate delivery"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddrStep("map")}
                    className="shrink-0 rounded-lg border border-rose-100 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    {addrForm.lat != null ? "Change" : "Pin on map"}
                  </button>
                </div>

                {addrError && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] font-medium text-amber-800">
                    {addrError}
                  </p>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Save address as</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Home", "Office", "Other"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddrForm({ ...addrForm, tag })}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${addrForm.tag === tag ? "border-rose-500 bg-rose-50 text-rose-700" : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-700">Recipient Name *</label>
                    <input type="text" required value={addrForm.recipientName} onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-700">Phone *</label>
                    <input type="tel" required value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-zinc-700">Flat / House no. / Floor</label>
                  <input type="text" value={addrForm.houseNo} onChange={(e) => setAddrForm({ ...addrForm, houseNo: e.target.value })} placeholder="e.g. Flat 302, Tower B" className={inputCls} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-zinc-700">Street / Area *</label>
                  <textarea required rows={2} value={addrForm.addressLine} onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })} placeholder="Building, street, locality" className={`${inputCls} resize-none`} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-zinc-700">Landmark (optional)</label>
                  <input type="text" value={addrForm.landmark} onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })} placeholder="Near temple, opposite school…" className={inputCls} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-700">City</label>
                    <input type="text" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-700">State</label>
                    <input type="text" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-700">PIN Code</label>
                    <input type="text" value={addrForm.zipCode} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultAddrCheck"
                    checked={Boolean(addrForm.isDefault)}
                    onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="isDefaultAddrCheck" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>

                <div className="flex items-center justify-between gap-2.5 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddrStep("map")}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to map
                  </button>
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 cursor-pointer">
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}