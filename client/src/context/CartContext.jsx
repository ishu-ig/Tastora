"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fullMenuCatalog } from "../app/menu/page";

const CartContext = createContext(null);

// Initial mock addresses
const initialAddresses = [
  {
    id: "addr-1",
    tag: "Home",
    isDefault: true,
    recipientName: "Ishaan Sharma",
    phone: "+1 (555) 234-5678",
    addressLine: "Flat 4B, Emerald Heights, 42 Flavor Street",
    landmark: "Opposite Central Botanical Garden",
    city: "New York",
    zipCode: "10001",
    type: "home",
  },
  {
    id: "addr-2",
    tag: "Office",
    isDefault: false,
    recipientName: "Ishaan Sharma",
    phone: "+1 (555) 234-5678",
    addressLine: "Suite 1400, Tech Innovation Tower, 750 7th Ave",
    landmark: "Near Times Square Metro Station",
    city: "New York",
    zipCode: "10036",
    type: "work",
  },
];

// Initial mock orders history with diverse modes (Delivery, Takeaway, Dine-In) and active tracking
const initialOrders = [
  {
    id: "ORD-98421",
    date: "Today, 01:15 PM",
    orderMode: "delivery",
    status: "In Kitchen",
    statusColor: "orange",
    eta: "20-25 mins",
    currentStep: 2, // 1: Confirmed, 2: In Kitchen, 3: Picked Up, 4: Delivered
    items: [
      { id: "ni-1", title: "Paneer Tikka Charcoal Skewers", price: 14.99, quantity: 2, image: "/img/category/paneer-tikka.jpg", note: "Medium spicy, mint chutney" },
      { id: "ni-8", title: "Butter Garlic Naan", price: 4.49, quantity: 3, image: "/img/category/dal-makhani.jpg" },
      { id: "ds-1", title: "Warm Shahi Gulab Jamun (2 Pcs)", price: 6.99, quantity: 1, image: "/img/category/gulab-jamun.jpg" },
    ],
    itemTotal: 43.45,
    discount: 5.0,
    couponApplied: "FIRSTDEL",
    deliveryFee: 0.0,
    taxes: 3.47,
    tip: 3.0,
    total: 44.92,
    deliveryAddress: "Flat 4B, Emerald Heights, 42 Flavor Street, NY 10001",
    deliveryInstruction: "Leave at door",
    paymentMethod: "UPI (Google Pay)",
    ratingGiven: null,
    driverName: "Rajesh Kumar",
    driverPhone: "+1 (555) 345-9876",
  },
  {
    id: "ORD-87319",
    date: "Yesterday, 08:30 PM",
    orderMode: "dinein",
    tableNumber: "Table 07",
    status: "Delivered",
    statusColor: "emerald",
    currentStep: 4,
    items: [
      { id: "tc-1", title: "Royal Maharaja Grand Thali", price: 19.99, quantity: 2, image: "/img/category/royal-thali.jpg", note: "Extra butter on rotis" },
      { id: "bv-1", title: "Royal Amritsari Malai Lassi", price: 5.99, quantity: 2, image: "/img/category/beverage-lassi.jpg" },
    ],
    itemTotal: 51.96,
    discount: 10.0,
    couponApplied: "PUREVEG50",
    deliveryFee: 0.0,
    taxes: 3.77,
    tip: 0.0,
    total: 45.73,
    deliveryAddress: "Dine-In Table 07 (Main Dining Hall)",
    paymentMethod: "Credit Card (•••• 4242)",
    ratingGiven: 5,
    feedback: "The Thali was truly grand and fresh! Outstanding paneer and warm dal makhani.",
  },
  {
    id: "ORD-76204",
    date: "08 Sep 2026, 07:45 PM",
    orderMode: "takeaway",
    pickupTime: "Ready in 20 mins",
    status: "Delivered",
    statusColor: "emerald",
    currentStep: 4,
    items: [
      { id: "ff-1", title: "Double Truffle Smash Burger", price: 14.99, quantity: 1, image: "/img/menu/1.jpg" },
      { id: "ff-3", title: "Margherita Royale Sourdough Pizza", price: 19.99, quantity: 1, image: "/img/menu/2.jpg" },
      { id: "ds-2", title: "Nutella Molten Lava Cake", price: 8.99, quantity: 1, image: "/img/menu/5.jpg" },
    ],
    itemTotal: 43.97,
    discount: 6.60,
    couponApplied: "FEAST20",
    deliveryFee: 0.0,
    taxes: 3.18,
    tip: 0.0,
    total: 40.55,
    deliveryAddress: "Pickup Counter #2 (42 Flavor Street, NY)",
    paymentMethod: "Apple Pay",
    ratingGiven: 5,
    feedback: "Crispy crust and sizzling hot burgers when picked up!",
  },
  {
    id: "ORD-65192",
    date: "28 Aug 2026, 01:30 PM",
    orderMode: "delivery",
    status: "Delivered",
    statusColor: "emerald",
    currentStep: 4,
    items: [
      { id: "si-1", title: "Mysore Butter Masala Dosa", price: 12.99, quantity: 2, image: "/img/category/south-indian.jpg" },
      { id: "si-2", title: "Steamed Ghee Idli & Medu Vada", price: 9.99, quantity: 1, image: "/img/category/south-indian.jpg" },
      { id: "bv-3", title: "Masala Kulhad Chai (Hot)", price: 3.99, quantity: 2, image: "/img/category/beverage-lassi.jpg" },
    ],
    itemTotal: 43.95,
    discount: 0.0,
    deliveryFee: 0.0,
    taxes: 3.73,
    tip: 2.0,
    total: 49.68,
    deliveryAddress: "Suite 1400, Tech Innovation Tower, NY 10036",
    paymentMethod: "Net Banking (Chase)",
    ratingGiven: 4,
  },
];

// Initial mock reservations history with active and past dining experiences
const initialReservations = [
  {
    id: "RES-78219",
    type: "reservation",
    date: "Tonight, 08:00 PM – 09:00 PM",
    bookingDate: "Today",
    status: "Confirmed",
    statusColor: "emerald",
    zone: "The Royal Courtyard",
    zoneImage: "/img/dining/royal-courtyard.jpg",
    guests: 4,
    slots: ["08:00 PM - 09:00 PM"],
    occasion: "Anniversary Celebration 🎂",
    dietary: "Strict Jain / Pure Satvik 🌿",
    addOns: [
      "Royal Saffron Shahi Thandai Welcome",
      "Fresh Rose Bouquet & Tabletop Candlelight Setup",
    ],
    tableNumber: "Table #12 (Courtyard Fountain View)",
    guestName: "Ishaan Sharma",
    guestPhone: "+1 (555) 234-5678",
    guestEmail: "ishaan.sharma@example.com",
    specialNotes: "Please arrange candle-light setup near the live sitar stage.",
    coverPricePerGuest: 20.0,
    addOnTotal: 42.0,
    taxes: 8.5,
    total: 130.5,
    depositPaid: 130.5,
    paymentMethod: "Net Banking (Chase)",
    ratingGiven: null,
  },
  {
    id: "RES-65410",
    type: "reservation",
    date: "10 Sep 2026, 01:00 PM – 02:00 PM",
    bookingDate: "10 Sep 2026",
    status: "Completed",
    statusColor: "emerald",
    zone: "Starlit Rooftop Terrace",
    zoneImage: "/img/dining/rooftop-terrace.jpg",
    guests: 2,
    slots: ["01:00 PM - 02:00 PM"],
    occasion: "Casual Dining",
    dietary: "Standard Pure Veg",
    addOns: ["Chef's Eggless Belgian Truffle Cake (500g)"],
    tableNumber: "Table #04 (Skyline View)",
    guestName: "Ishaan Sharma",
    guestPhone: "+1 (555) 234-5678",
    guestEmail: "ishaan.sharma@example.com",
    specialNotes: "",
    coverPricePerGuest: 20.0,
    addOnTotal: 24.0,
    taxes: 5.44,
    total: 69.44,
    depositPaid: 69.44,
    paymentMethod: "Credit Card (•••• 4242)",
    ratingGiven: 5,
    feedback: "Incredible skyline view and prompt service. The eggless truffle cake was divine!",
  },
  {
    id: "RES-54321",
    type: "reservation",
    date: "25 Aug 2026, 07:30 PM – 08:30 PM",
    bookingDate: "25 Aug 2026",
    status: "Completed",
    statusColor: "emerald",
    zone: "Private VIP Suite",
    zoneImage: "/img/dining/private-vip.jpg",
    guests: 6,
    slots: ["07:30 PM - 08:30 PM"],
    occasion: "Family Reunion",
    dietary: "No Onion No Garlic",
    addOns: ["Royal Saffron Shahi Thandai Welcome"],
    tableNumber: "VIP Teak Room 1",
    guestName: "Ishaan Sharma",
    guestPhone: "+1 (555) 234-5678",
    guestEmail: "ishaan.sharma@example.com",
    specialNotes: "Elderly guests attending, quiet corner preferred.",
    coverPricePerGuest: 20.0,
    addOnTotal: 36.0,
    taxes: 13.26,
    total: 169.26,
    depositPaid: 169.26,
    paymentMethod: "Apple Pay",
    ratingGiven: 5,
    feedback: "Dedicated butler service was exemplary. Everyone loved the authentic satvik dishes!",
  },
];

// Initial sample cart items so Cart and Checkout pages have rich data out-of-the-box
const initialSampleCart = {
  "tc-1": 1, // Royal Maharaja Grand Thali
  "ni-1": 2, // Paneer Tikka Charcoal Skewers
  "ni-8": 3, // Butter Garlic Naan
  "bv-1": 2, // Royal Amritsari Malai Lassi
  "ds-1": 1, // Warm Shahi Gulab Jamun
};

const initialSampleNotes = {
  "ni-1": "Medium spicy, extra mint chutney please",
  "tc-1": "Extra butter on the rotis",
};

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
    terms: "Min order value $50. Cannot be clubbed with SuperCoins.",
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
  const [useSuperCoins, setUseSuperCoins] = useState(false);
  const [superCoinsBalance, setSuperCoinsBalance] = useState(250); // 250 coins = $2.50
  
  // Addresses & Orders State
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
      localStorage.setItem("tastora_cart_items", JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_user_profile", JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_favorites", JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_addresses", JSON.stringify(savedAddresses));
    } catch (e) {}
  }, [savedAddresses]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_orders", JSON.stringify(ordersHistory));
    } catch (e) {}
  }, [ordersHistory]);

  useEffect(() => {
    try {
      localStorage.setItem("tastora_reservations", JSON.stringify(reservationsHistory));
    } catch (e) {}
  }, [reservationsHistory]);

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

  // Address management
  const addAddress = (newAddr) => {
    const created = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setSavedAddresses((prev) => [...prev, created]);
    setSelectedAddressId(created.id);
  };

  const updateAddress = (id, updated) => {
    setSavedAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, ...updated } : addr))
    );
  };

  const deleteAddress = (id) => {
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== id));
    if (selectedAddressId === id) {
      setSelectedAddressId(savedAddresses[0]?.id || null);
    }
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
    const generatedId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReservation = {
      id: generatedId,
      type: "reservation",
      date: bookingData.dateDisplay || "Upcoming Date",
      bookingDate: "Today",
      status: "Confirmed",
      statusColor: "emerald",
      zone: bookingData.zoneName || "The Royal Courtyard",
      zoneImage: bookingData.zoneImage || "/img/dining/royal-courtyard.jpg",
      guests: bookingData.guests || 2,
      slots: bookingData.slots || ["07:00 PM - 08:00 PM"],
      occasion: bookingData.occasion || "Casual Dining",
      dietary: bookingData.dietary || "Standard Pure Veg",
      addOns: bookingData.addOns || [],
      tableNumber: bookingData.tableNumber || `Table #${Math.floor(1 + Math.random() * 20)}`,
      guestName: bookingData.guestName || userProfile.name,
      guestPhone: bookingData.guestPhone || userProfile.phone,
      guestEmail: bookingData.guestEmail || userProfile.email,
      specialNotes: bookingData.specialNotes || "",
      coverPricePerGuest: bookingData.coverPricePerGuest || 20.0,
      addOnTotal: bookingData.addOnTotal || 0,
      taxes: bookingData.taxes || 0,
      total: bookingData.total || 40.0,
      depositPaid: bookingData.depositPaid || bookingData.total || 40.0,
      paymentMethod: bookingData.paymentMethod || "COD (Pay at Counter)",
      ratingGiven: null,
      feedback: null,
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

  // Free delivery threshold: $35.00
  const freeDeliveryThreshold = 35.0;
  const isFreeDelivery = orderMode !== "delivery" || subtotal >= freeDeliveryThreshold;
  const deliveryFee = orderMode !== "delivery" ? 0 : subtotal === 0 ? 0 : isFreeDelivery ? 0 : 2.99;
  const freeDeliveryShortfall = orderMode === "delivery" ? Math.max(0, freeDeliveryThreshold - subtotal) : 0;

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

  // SuperCoins discount ($2.50 discount for 250 coins)
  const superCoinsDiscount = useSuperCoins ? 2.5 : 0;

  // Taxes: 8.5%
  const taxAmount = subtotal > 0 ? Number(((subtotal - discountAmount) * 0.085).toFixed(2)) : 0;

  // Grand Total
  const activeTip = orderMode === "delivery" ? (subtotal > 0 ? deliveryTip : 0) : 0;
  const grandTotal = Math.max(
    0,
    subtotal - discountAmount - superCoinsDiscount + deliveryFee + taxAmount + activeTip
  );

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
        useSuperCoins,
        setUseSuperCoins,
        superCoinsBalance,
        superCoinsDiscount,
        taxAmount,
        grandTotal,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
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
