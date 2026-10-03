"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fullMenuCatalog } from "../app/menu/page";
import { useAuth } from "./AuthContext";
import api from "../lib/axiosIntance";

const CartContext = createContext(null);

// No demo addresses or order history are shown while the backend is unavailable.
const initialAddresses = [];
const initialOrders = [];
const initialReservations = [];
const initialSampleCart = {};
const initialSampleNotes = {};

// Available coupon codes
export const availableCoupons = [
  {
    code: "PUREVEG50",
    discountPercent: 20,
    maxDiscount: 10,
    minOrder: 25,
    description: "20% OFF up to $10 on orders above $25",
    terms: "Valid on all 100% Pure Veg & Satvik delicacies",
    tag: "BEST VALUE",
    badgeColor: "from-rose-600 to-amber-500",
  },
  {
    code: "FEAST20",
    discountPercent: 15,
    maxDiscount: 15,
    minOrder: 40,
    description: "15% OFF up to $15 on family & party orders above $40",
    terms: "Applicable on Thalis, Combos, and Family Platters",
    tag: "FAMILY FEAST",
    badgeColor: "from-pink-600 to-rose-500",
  },
  {
    code: "FIRSTDEL",
    discountAmount: 5,
    minOrder: 20,
    description: "Flat $5 OFF on your delicious order",
    terms: "Valid on first 3 orders above $20",
    tag: "WELCOME",
    badgeColor: "from-emerald-500 to-teal-500",
  },
  {
    code: "JAINSPECIAL",
    discountPercent: 10,
    maxDiscount: 8,
    minOrder: 30,
    description: "10% OFF up to $8 on Jain & No Onion/Garlic selections",
    terms: "Valid on our specialized Pure Satvik & Jain kitchen dishes",
    tag: "SATVIK PURE",
    badgeColor: "from-green-600 to-emerald-600",
  },
  {
    code: "THALIPARTY",
    discountAmount: 8,
    minOrder: 50,
    description: "Flat $8 OFF on Grand Maharaja Royal Thalis & Combos",
    terms: "Min order value ₹50. Cannot be clubbed with CreditCoins.",
    tag: "ROYAL THALI",
    badgeColor: "from-amber-500 to-rose-600",
  },
  {
    code: "SWEETTREAT",
    discountAmount: 4,
    minOrder: 22,
    description: "Flat $4 OFF on warm Gulab Jamun & Desserts",
    terms: "Valid when ordering any artisanal dessert",
    tag: "DESSERT LOVE",
    badgeColor: "from-rose-500 to-pink-600",
  },
];

export function CartProvider({ children }) {
  // Cart items dictionary: { [dishId]: quantity }
  const [cartItems, setCartItems] = useState(initialSampleCart);
  // Item notes / instructions: { [dishId]: "extra spicy, etc" }
  const [itemNotes, setItemNotes] = useState(initialSampleNotes);

  // Order Fulfillment Mode: "delivery" | "takeaway" | "dinein"
  const [orderMode, setOrderMode] = useState("delivery");
  const [tableNumber, setTableNumber] = useState("Table 07");
  const [pickupTime, setPickupTime] = useState("Ready in 20-25 mins");

  // Checkout & Preferences State
  const [appliedCoupon, setAppliedCoupon] = useState(availableCoupons[0]); // PUREVEG50 applied by default
  const [deliveryTip, setDeliveryTip] = useState(3); // default $3 tip
  const [optOutCutlery, setOptOutCutlery] = useState(true);
  const [deliveryInstruction, setDeliveryInstruction] = useState("leave-at-door");
  const [useCreditCoins, setUseCreditCoins] = useState(false);
  // Balance starts at 10 (the DB default for new users) and syncs with the
  // authenticated user's cridetCoin field once AuthContext resolves.
  const [creditCoinsBalance, setCreditCoinsBalance] = useState(0);

  // Membership state
  const [membership, setMembership] = useState(null);
  const isMember = Boolean(
    membership && (!membership.endDate || new Date(membership.endDate) > new Date()) && membership.status === "active"
  );
  const [savedAddresses, setSavedAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const [ordersHistory, setOrdersHistory] = useState(initialOrders);
  const [reservationsHistory, setReservationsHistory] = useState(initialReservations);
  const [favorites, setFavorites] = useState({});

  // Active User State
  const [userProfile, setUserProfile] = useState({
    name: "Ishaan Sharma",
    mobile: "+1 (555) 234-5678",
    phone: "+1 (555) 234-5678",
    email: "ishaan.sharma@example.com",
    gender: "Male",
    anniversary: "2024-11-24",
    avatar: "/img/testimonial/user1.jpg",
    joinedDate: "January 2025",
    isPureVegVIP: true,
    dietaryPreference: "Pure Vegetarian",
    spiceTolerance: "Medium 🌶️🌶️",
  });

  // Sync CreditCoins balance from the authenticated user (cridetCoin field).
  // This runs once on mount and again whenever the auth state changes
  // (e.g. after login / logout / coin deduction).
  const { user: authUser } = useAuth() || {};
  useEffect(() => {
    if (authUser) {
      // DB field is "cridetCoin" (kept as-is to avoid migration).
      // Use Number() – not typeof check – because Mongoose sometimes returns
      // numeric fields as strings depending on the query path.
      const raw = authUser.cridetCoin ?? authUser.creditCoins ?? authUser.creditCoin;
      const coins = raw !== undefined && raw !== null ? Number(raw) : NaN;
      if (Number.isFinite(coins) && coins >= 0) {
        setCreditCoinsBalance(coins);
      } else if (authUser._id) {
        // cridetCoin missing from this auth object – fetch fresh from /auth/me
        api.get("/auth/me")
          .then((res) => {
            const u = res.data?.data;
            if (u) {
              const freshRaw = u.cridetCoin ?? u.creditCoins ?? u.creditCoin;
              const freshCoins = freshRaw !== undefined ? Number(freshRaw) : NaN;
              if (Number.isFinite(freshCoins) && freshCoins >= 0) {
                setCreditCoinsBalance(freshCoins);
              }
            }
          })
          .catch(() => { }); // Silent – don't crash on network errors
      }
      // Also pre-fill user profile from the real auth user if available.
      setUserProfile((prev) => ({
        ...prev,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        mobile: authUser.phoneNo ? String(authUser.phoneNo) : prev.mobile,
        phone: authUser.phoneNo ? String(authUser.phoneNo) : prev.phone,
        avatar: authUser.pic || prev.avatar,
      }));
      // Fetch active membership for user
      if (authUser?.activeMembership) {
        setMembership(authUser.activeMembership);
      } else if (authUser?._id || authUser?.id) {
        api.get(`/api/membership/current/${encodeURIComponent(authUser._id || authUser.id)}`)
          .then((res) => {
            if (res.data?.data) setMembership(res.data.data);
          })
          .catch(() => { });
      }
    } else {
      // Logged out — reset balance, membership, AND clear order/reservation history
      // so a previous session's live order never leaks to a logged-out/new user.
      setCreditCoinsBalance(0);
      setMembership(null);
      setOrdersHistory([]);
      setReservationsHistory([]);
    }
  }, [authUser]);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("tastora_cart_items") || localStorage.getItem("sarab_cart_items");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setCartItems(parsed);
        } else {
          setCartItems(initialSampleCart);
        }
      }

      const savedNotes = localStorage.getItem("tastora_item_notes") || localStorage.getItem("sarab_item_notes");
      if (savedNotes) {
        setItemNotes(JSON.parse(savedNotes));
      } else {
        setItemNotes(initialSampleNotes);
      }

      const savedFavs = localStorage.getItem("tastora_favorites") || localStorage.getItem("sarab_favorites");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedAddrs = localStorage.getItem("tastora_addresses") || localStorage.getItem("sarab_addresses");
      if (savedAddrs) setSavedAddresses(JSON.parse(savedAddrs));

      const savedOrds = localStorage.getItem("tastora_orders") || localStorage.getItem("sarab_orders");
      if (savedOrds) setOrdersHistory(JSON.parse(savedOrds));

      const savedRes = localStorage.getItem("tastora_reservations") || localStorage.getItem("sarab_reservations");
      if (savedRes) setReservationsHistory(JSON.parse(savedRes));

      const savedUser = localStorage.getItem("tastora_user_profile") || localStorage.getItem("sarab_user_profile");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserProfile((prev) => ({
          ...prev,
          ...parsedUser,
          mobile: parsedUser.mobile || parsedUser.phone || prev.mobile,
          phone: parsedUser.mobile || parsedUser.phone || prev.phone,
        }));
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tastora_order_mode");
      if (stored) setOrderMode(stored);
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      if (orderMode) localStorage.setItem("tastora_order_mode", orderMode);
    } catch (e) { }
  }, [orderMode]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_cart_items", JSON.stringify(cartItems));
    } catch (e) { }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_user_profile", JSON.stringify(userProfile));
    } catch (e) { }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_favorites", JSON.stringify(favorites));
    } catch (e) { }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_addresses", JSON.stringify(savedAddresses));
    } catch (e) { }
  }, [savedAddresses]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_orders", JSON.stringify(ordersHistory));
    } catch (e) { }
  }, [ordersHistory]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_reservations", JSON.stringify(reservationsHistory));
    } catch (e) { }
  }, [reservationsHistory]);

  // Sync backend orders and reservations when a user is logged in
  const activeUserId = authUser?._id || (typeof window !== "undefined" ? localStorage.getItem("userid") : null);

  useEffect(() => {
    if (!activeUserId) return;
    let isSubscribed = true;

    async function syncBackendData() {
      try {
        const checkoutRes = await api.get(`/checkout/user/${encodeURIComponent(activeUserId)}`);
        const serverCheckouts = checkoutRes.data?.data;
        if (isSubscribed && Array.isArray(serverCheckouts)) {
          const mappedOrders = serverCheckouts.map((ch) => ({
            id: `ORD-${ch._id.slice(-6).toUpperCase()}`,
            dbId: ch._id,
            date: ch.createdAt
              ? new Date(ch.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "Recent",
            orderMode: ch.orderMode || "delivery",
            tableNumber: ch.tableNumber || null,
            pickupTime: ch.pickupTime || null,
            status: ch.orderStatus || "Confirmed",
            statusColor: ch.orderStatus === "Delivered" ? "emerald" : "orange",
            currentStep: ch.orderStatus === "Delivered" ? 4 : 2,
            eta: ch.orderMode === "takeaway" ? "15-20 mins" : "25-30 mins",
            items: (ch.products || []).map((p) => {
              const productObj = p.product || {};
              const findDisplayName = (value, seen = new Set()) => {
                if (!value || typeof value === "number") return null;
                if (typeof value === "string") {
                  const cleaned = value.trim();
                  if (!cleaned || /^[a-f0-9]{24}$/i.test(cleaned) || /^ord-/i.test(cleaned) || /^res-/i.test(cleaned)) {
                    return null;
                  }
                  if (["full", "half", "regular", "standard", "default"].includes(cleaned.toLowerCase())) {
                    return null;
                  }
                  return cleaned;
                }
                if (Array.isArray(value)) {
                  for (const entry of value) {
                    const found = findDisplayName(entry, seen);
                    if (found) return found;
                  }
                  return null;
                }
                if (typeof value !== "object") return null;
                if (seen.has(value)) return null;
                seen.add(value);

                const priority = ["title", "name", "customName", "productName", "productTitle", "label", "displayName", "dishName", "variantName", "product"];
                for (const key of priority) {
                  const found = findDisplayName(value[key], seen);
                  if (found) return found;
                }

                for (const [key, nested] of Object.entries(value)) {
                  if (["variant", "variantName", "variants", "full", "half", "name"].includes(key) && typeof nested === "string" && ["full", "half", "regular", "standard", "default"].includes(nested.trim().toLowerCase())) {
                    continue;
                  }
                  const found = findDisplayName(nested, seen);
                  if (found) return found;
                }
                return null;
              };

              const savedProductName = [p.productName, productObj.name, p.name].find(
                (name) =>
                  typeof name === "string" &&
                  name.trim() &&
                  !["full", "half", "regular", "standard", "default"].includes(name.trim().toLowerCase())
              );
              const titleStr =
                savedProductName ||
                findDisplayName({ ...p, product: productObj }) ||
                "Item name unavailable";

              const rawPic = productObj.pic || p.image || p.pic;
              const picStr = Array.isArray(rawPic) ? rawPic[0] : rawPic;
              const imageUri =
                typeof picStr === "string" && picStr.length > 0
                  ? picStr.startsWith("http")
                    ? picStr
                    : `${process.env.NEXT_PUBLIC_BACKEND_SERVER || "http://localhost:8000"}/${picStr.replace(/^\/+/, "")}`
                  : "/img/category/paneer-tikka.jpg";

              return {
                id: productObj._id || p._id || Math.random().toString(36).slice(2),
                title: String(titleStr),
                price: p.total
                  ? Number(p.total) / (Number(p.qty) || 1)
                  : Number(productObj.finalPrice || productObj.basePrice || 12.99),
                quantity: Number(p.qty || p.quantity) || 1,
                image: imageUri,
                note: typeof p.note === "string" ? p.note : null,
              };
            }),
            itemTotal: ch.subtotal || 0,
            discount: (ch.discount || 0) + (ch.coinsDiscount || 0),
            couponApplied: ch.coupon || null,
            coinsDiscount: ch.coinsDiscount || 0,
            coinsUsed: ch.coinsUsed || 0,
            creditCoinsEarned: ch.creditCoinsEarned || Math.floor((Number(ch.subtotal) || 0) * 0.10),
            deliveryFee: ch.deliveryCharge || 0,
            taxes: ch.tax || 0,
            total: ch.total || 0,
            deliveryAddress:
              typeof ch.address === "object" && ch.address?.addressLine
                ? `${ch.address.addressLine}, ${ch.address.city || ""}`
                : ch.address || "Delivery Address",
            deliveryCoordinates:
              ch.address && Number.isFinite(Number(ch.address.lat)) && Number.isFinite(Number(ch.address.lng))
                ? { lat: Number(ch.address.lat), lng: Number(ch.address.lng) }
                : null,
            paymentMethod: ch.paymentMode || "COD",
            ratingGiven: Number(ch.customerRating || ch.ratingGiven) || null,
            feedback: ch.customerComment || ch.feedback || null,
            commentRewarded: Boolean(ch.commentRewarded),
            deliveryRating: Number(ch.deliveryRating) || null,
            deliveryFeedback: ch.deliveryFeedback || "",
            deliveryRatingRewarded: Boolean(ch.deliveryRatingRewarded),
            deliveryBoyAssigned: Boolean(ch.deliveryBoy?._id || ch.deliveryBoy),
            deliveryBoyName: ch.deliveryBoy?.name || "",
          }));

          setOrdersHistory((prev) => {
            const serverIds = new Set(mappedOrders.map((o) => o.dbId));
            const localOnly = prev.filter((o) => !o.dbId || !serverIds.has(o.dbId));
            return [...mappedOrders, ...localOnly];
          });
        }
      } catch (err) {
        // quiet fallback
      }

      try {
        const bookingRes = await api.get(`/booking/user/${encodeURIComponent(activeUserId)}`);
        const serverBookings = bookingRes.data?.data;
        if (isSubscribed && Array.isArray(serverBookings)) {
          const mappedBookings = serverBookings.map((b) => ({
            id: `RES-${b._id.slice(-6).toUpperCase()}`,
            dbId: b._id,
            type: "reservation",
            date: `${b.date || "Upcoming"}${b.time ? ` • ${b.time}` : ""}`,
            bookingDate: b.date || "Upcoming",
            status: b.bookingState === "cancelled" || b.bookingStatus === false || String(b.bookingStatus).toLowerCase() === "false"
              ? "Cancelled"
              : b.bookingStatus ? "Confirmed" : "Pending",
            statusColor: b.bookingState === "cancelled" || b.bookingStatus === false || String(b.bookingStatus).toLowerCase() === "false"
              ? "zinc"
              : b.bookingStatus ? "emerald" : "amber",
            zone: b.zone || b.resturent?.name || b.restaurantName || "Dining Room",
            zoneImage: b.zoneImage || b.resturent?.pic || "/img/dining/royal-courtyard.jpg",
            guests: b.seats || 2,
            slots: b.time ? b.time.split(", ") : [],
            occasion: b.occasion || "",
            dietary: b.dietary || "",
            addOns: Array.isArray(b.addOns) ? b.addOns : [],
            tableNumber: b.tableNumber || "",
            guestName: b.guestName || b.user?.name || "",
            guestPhone: b.guestPhone || b.user?.phone || "",
            guestEmail: b.guestEmail || b.user?.email || "",
            specialNotes: b.specialNotes || "",
            coverPricePerGuest: Number(b.coverPricePerGuest) || 0,
            addOnTotal: Number(b.addOnTotal) || 0,
            taxes: Number(b.tax) || 0,
            total: b.total || 0,
            depositPaid: b.paymentStatus === "Done" ? b.total || 0 : 0,
            paymentMethod: b.paymentMode || "COD",
            ratingGiven: b.ratingGiven || null,
            feedback: b.feedback || null,
          }));

          setReservationsHistory((prev) => {
            const serverIds = new Set(mappedBookings.map((r) => r.dbId));
            const localOnly = prev.filter((r) => !r.dbId);
            return [...mappedBookings, ...localOnly];
          });
        }
      } catch (err) {
        // quiet fallback
      }
      try {
        const addrRes = await api.get(`/api/address/user/${encodeURIComponent(activeUserId)}`);
        const serverAddrs = addrRes.data?.data;
        if (isSubscribed && Array.isArray(serverAddrs) && serverAddrs.length > 0) {
          const mapped = serverAddrs.map((a) => ({
            id: a._id,
            _id: a._id,
            tag: a.label || "Home",
            isDefault: Boolean(a.isDefault),
            recipientName: a.recipientName || authUser?.name || "Customer",
            phone: a.phone || (authUser?.phoneNo ? String(authUser.phoneNo) : ""),
            addressLine: a.address || "",
            landmark: a.landmark || "",
            city: a.city || "",
            state: a.state || "",
            zipCode: a.pin || "",
            lat: a.lat,
            lng: a.lng,
            type: (a.label || "home").toLowerCase(),
          }));
          setSavedAddresses(mapped);
          const def = mapped.find((a) => a.isDefault);
          if (def) setSelectedAddressId(def.id);
        }
      } catch (err) {
        // quiet fallback
      }
    }

    syncBackendData();

    // Poll every 30 seconds while user is logged in to keep order status fresh.
    // This ensures the live order banner reflects server-side status changes
    // (e.g. "In Kitchen" → "Out for Delivery") without a full page reload.
    const pollInterval = setInterval(() => {
      if (isSubscribed) syncBackendData();
    }, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [activeUserId]);

  // Cart helper functions
  const loadSampleCart = () => {
    setCartItems(initialSampleCart);
    setItemNotes(initialSampleNotes);
    setAppliedCoupon(availableCoupons[0]);
    setDeliveryTip(3);
    setOptOutCutlery(true);
  };

  const addToCart = (dish, qty = 1) => {
    setCartItems((prev) => {
      const current = prev[dish.id] || 0;
      return { ...prev, [dish.id]: current + qty };
    });
  };

  const updateQuantity = (id, delta, dish = null) => {
    setCartItems((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearCart = () => {
    setCartItems({});
    setItemNotes({});
    setAppliedCoupon(null);
  };

  const setItemCustomNote = (id, note) => {
    setItemNotes((prev) => ({ ...prev, [id]: note }));
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reorder all items from a past order
  const reorderPastOrder = (order) => {
    const newItems = { ...cartItems };
    order.items.forEach((item) => {
      newItems[item.id] = (newItems[item.id] || 0) + item.quantity;
    });
    setCartItems(newItems);
  };

  // Address management with full backend persistence
  const addAddress = async (newAddr) => {
    let created = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    if (activeUserId) {
      try {
        const res = await api.post("/api/address", {
          user: activeUserId,
          label: newAddr.tag || newAddr.type || "Home",
          address: newAddr.addressLine || newAddr.address,
          city: newAddr.city,
          state: newAddr.state,
          pin: newAddr.zipCode || newAddr.pin,
          lat: newAddr.lat,
          lng: newAddr.lng,
          isDefault: Boolean(newAddr.isDefault),
        });
        if (res.data?.data?._id) {
          created = {
            ...created,
            id: res.data.data._id,
            _id: res.data.data._id,
          };
        }
      } catch (e) {
        console.warn("Failed to persist address to server:", e);
      }
    }
    setSavedAddresses((prev) => {
      const updated = newAddr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
      return [...updated, created];
    });
    if (newAddr.isDefault || !selectedAddressId) {
      setSelectedAddressId(created.id);
    }
    return created;
  };

  const updateAddress = async (id, updated) => {
    if (activeUserId && id && !String(id).startsWith("addr-")) {
      try {
        await api.put(`/api/address/${id}`, {
          label: updated.tag || updated.label,
          address: updated.addressLine || updated.address,
          city: updated.city,
          state: updated.state,
          pin: updated.zipCode || updated.pin,
          lat: updated.lat,
          lng: updated.lng,
          isDefault: Boolean(updated.isDefault),
        });
      } catch (e) {
        console.warn("Failed to update address on server:", e);
      }
    }
    setSavedAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id || addr._id === id) {
          return { ...addr, ...updated };
        }
        if (updated.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
  };

  const deleteAddress = async (id) => {
    if (activeUserId && id && !String(id).startsWith("addr-")) {
      try {
        await api.delete(`/api/address/${id}`);
      } catch (e) {
        console.warn("Failed to delete address on server:", e);
      }
    }
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== id && addr._id !== id));
    if (selectedAddressId === id) {
      setSelectedAddressId(savedAddresses.find((a) => a.id !== id)?.id || null);
    }
  };

  const setDefaultAddress = async (id) => {
    if (activeUserId && id && !String(id).startsWith("addr-")) {
      try {
        await api.put(`/api/address/${id}`, { isDefault: true });
        await api.put(`/api/user/${activeUserId}`, { defaultAddress: id });
      } catch (e) {
        console.warn("Failed to set default address on server:", e);
      }
    }
    setSavedAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id || addr._id === id,
      }))
    );
    setSelectedAddressId(id);
  };

  // Place Order Simulation
  const placeOrder = (orderDetails) => {
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: "Just Now",
      orderMode: orderMode || "delivery",
      tableNumber: orderMode === "dinein" ? (tableNumber || "Table 07") : null,
      pickupTime: orderMode === "takeaway" ? (pickupTime || "Ready in 20 mins") : null,
      status: "In Kitchen",
      statusColor: "orange",
      currentStep: 2,
      eta: orderMode === "delivery" ? "25-30 mins" : orderMode === "takeaway" ? "15-20 mins" : "10-15 mins",
      items: Object.entries(cartItems).map(([id, qty]) => {
        const d = fullMenuCatalog.find((item) => item.id === id) || {
          title: "Delicious Dish",
          price: 12.99,
          image: "/img/category/paneer-tikka.jpg",
        };
        return {
          id,
          title: d.title,
          price: d.price,
          quantity: qty,
          image: d.image,
          note: itemNotes[id] || null,
        };
      }),
      itemTotal: subtotal,
      discount: discountAmount,
      couponApplied: appliedCoupon?.code || null,
      coinsDiscount: useCreditCoins ? (orderDetails.coinsDiscount || creditCoinsDiscount || 0) : 0,
      coinsUsed: useCreditCoins ? (orderDetails.coinsUsed || 0) : 0,
      creditCoinsEarned: Math.floor(subtotal * 0.10),
      deliveryFee,
      taxes: taxAmount,
      tip: orderMode === "delivery" ? deliveryTip : 0,
      total: grandTotal,
      deliveryAddress:
        orderMode === "dinein"
          ? `Dine-In ${tableNumber || "Table 07"}`
          : orderMode === "takeaway"
            ? "Pickup Counter #2 (42 Flavor Street, NY)"
            : savedAddresses.find((a) => a.id === selectedAddressId)?.addressLine ||
            "42 Flavor Street, Manhattan, NY",
      deliveryInstruction: orderMode === "delivery" ? deliveryInstruction : null,
      paymentMethod: orderDetails.paymentMethod || "UPI",
      ratingGiven: null,
      feedback: null,
      driverName: orderMode === "delivery" ? "Rajesh Kumar" : null,
      driverPhone: orderMode === "delivery" ? "+1 (555) 345-9876" : null,
    };

    setOrdersHistory((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Rate an existing order
  const rateOrder = (orderId, rating, feedbackText = "") => {
    setOrdersHistory((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, ratingGiven: rating, feedback: feedbackText || ord.feedback }
          : ord
      )
    );
  };

  // Reservation Management Methods
  const bookReservation = (bookingData) => {
    const generatedId = `RES-${Date.now().toString().slice(-6).toUpperCase()}`;
    const newReservation = {
      id: bookingData.id || generatedId,
      dbId: bookingData.dbId || null,
      type: "reservation",
      date: bookingData.dateDisplay || "",
      bookingDate: bookingData.bookingDate || "",
      status: bookingData.status || "Confirmed",
      statusColor: bookingData.statusColor || "emerald",
      zone: bookingData.zoneName || "",
      zoneImage: bookingData.zoneImage || "",
      guests: bookingData.guests ?? 0,
      slots: bookingData.slots || [],
      occasion: bookingData.occasion || "",
      dietary: bookingData.dietary || "",
      addOns: bookingData.addOns || [],
      tableNumber: bookingData.tableNumber || "",
      guestName: bookingData.guestName || userProfile.name,
      guestPhone: bookingData.guestPhone || userProfile.phone,
      guestEmail: bookingData.guestEmail || userProfile.email,
      specialNotes: bookingData.specialNotes || "",
      coverPricePerGuest: bookingData.coverPricePerGuest ?? 0,
      addOnTotal: bookingData.addOnTotal ?? 0,
      taxes: bookingData.taxes ?? 0,
      total: bookingData.total ?? 0,
      depositPaid: bookingData.depositPaid ?? 0,
      paymentMethod: bookingData.paymentMethod || "COD (Pay at Counter)",
      ratingGiven: bookingData.ratingGiven || null,
      feedback: bookingData.feedback || null,
    };

    setReservationsHistory((prev) => [newReservation, ...prev]);
    return newReservation;
  };

  const cancelReservation = (reservationId) => {
    setReservationsHistory((prev) =>
      prev.map((res) =>
        res.id === reservationId
          ? { ...res, status: "Cancelled", statusColor: "zinc" }
          : res
      )
    );
  };

  const rateReservation = (reservationId, rating, feedbackText = "") => {
    setReservationsHistory((prev) =>
      prev.map((res) =>
        res.id === reservationId
          ? { ...res, ratingGiven: rating, feedback: feedbackText || res.feedback }
          : res
      )
    );
  };

  // Calculations
  const totalCartCount = Object.values(cartItems).reduce((sum, q) => sum + q, 0);

  const subtotal = Object.entries(cartItems).reduce((sum, [id, qty]) => {
    const dish = fullMenuCatalog.find((d) => d.id === id);
    return sum + (dish ? dish.price * qty : 0);
  }, 0);

  // Free delivery threshold: $35.00, or FREE for VIP members
  const freeDeliveryThreshold = 35.0;
  const memberFreeDelivery = Boolean(isMember && membership?.freeDelivery);
  const isFreeDelivery = orderMode !== "delivery" || subtotal >= freeDeliveryThreshold || memberFreeDelivery;
  const deliveryFee = orderMode !== "delivery" ? 0 : subtotal === 0 ? 0 : isFreeDelivery ? 0 : 2.99;
  const freeDeliveryShortfall = orderMode === "delivery" && !memberFreeDelivery ? Math.max(0, freeDeliveryThreshold - subtotal) : 0;

  // Coupon discount computation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      const calc = (subtotal * appliedCoupon.discountPercent) / 100;
      discountAmount = appliedCoupon.maxDiscount
        ? Math.min(calc, appliedCoupon.maxDiscount)
        : calc;
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }

  // CreditCoins discount (50 coins = ₹1)
  const creditCoinsDiscount = useCreditCoins ? Number((creditCoinsBalance / 50).toFixed(2)) : 0;

  // Taxes: 8.5%
  const taxAmount = subtotal > 0 ? Number(((subtotal - discountAmount) * 0.085).toFixed(2)) : 0;

  // Grand Total
  const activeTip = orderMode === "delivery" ? (subtotal > 0 ? deliveryTip : 0) : 0;
  const grandTotal = Math.max(
    0,
    subtotal - discountAmount - creditCoinsDiscount + deliveryFee + taxAmount + activeTip
  );

  // Live / active order — the most recent server-confirmed order (has dbId)
  // that is not yet in a terminal state. Using only dbId orders ensures:
  // 1. The order belongs to the current authenticated user (fetched by userId)
  // 2. Local/optimistic orders never show as "live"
  // 3. Stale localStorage orders from old sessions are excluded
  const TERMINAL_STATUSES = ["Delivered", "Cancelled", "Rejected", "Failed", "Refunded"];
  const liveOrder = ordersHistory.find(
    (o) => o.dbId && o.status && !TERMINAL_STATUSES.includes(o.status)
  ) || null;

  return (
    <CartContext.Provider
      value={{
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
        favorites,
        toggleFavorite,
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
        useCreditCoins,
        setUseCreditCoins,
        creditCoinsBalance,
        setCreditCoinsBalance,
        creditCoinsDiscount,
        // (no superCoins aliases – all consumers use creditCoins names directly)
        taxAmount,
        grandTotal,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        ordersHistory,
        reorderPastOrder,
        placeOrder,
        rateOrder,
        reservationsHistory,
        bookReservation,
        cancelReservation,
        rateReservation,
        userProfile,
        setUserProfile,
        membership,
        setMembership,
        isMember,
        memberFreeDelivery,
        liveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
