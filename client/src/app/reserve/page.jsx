"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Search,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Check,
  Flame,
  Phone,
  ShieldCheck,
  Crown,
  Star,
  Download,
  Share2,
  ArrowRight,
  Car,
  Music,
  UtensilsCrossed,
  X,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Send,
  AlertCircle,
  MessageSquare,
  Camera,
  PenLine,
  Receipt,
  Printer,
  LogIn,
} from "lucide-react";
import HistoryCard from "../../Component/HistoryCard";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/axiosInstance";
import { openRazorpayModal } from "../../lib/razorpay";

// Swiper Carousel Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Restaurant Gallery Showcase for Swiper
const galleryImages = [
  {
    id: "g-1",
    url: "/img/dining/royal-courtyard.jpg",
    title: "The Royal Courtyard",
    subtitle: "Chandelier Fine Dining & Live Sitar",
    zoneId: "royal-courtyard",
    badge: "Grand Dining",
  },
  {
    id: "g-2",
    url: "/img/dining/rooftop-terrace.jpg",
    title: "Starlit Rooftop Terrace",
    subtitle: "Twilight Skyline & Open Garden",
    zoneId: "rooftop-terrace",
    badge: "Scenic View",
  },
  {
    id: "g-3",
    url: "/img/dining/private-vip.jpg",
    title: "Private VIP Suite",
    subtitle: "Exclusive Teak Wood Dining with Butler",
    zoneId: "private-vip",
    badge: "VIP Luxury",
  },
  {
    id: "g-4",
    url: "/img/category/royal-thali.jpg",
    title: "Artisanal Royal Feast",
    subtitle: "Authentic Multi-Course Pure Veg Pairing",
    zoneId: "royal-courtyard",
    badge: "Signature Feast",
  },
  {
    id: "g-5",
    url: "/img/category/paneer-tikka.jpg",
    title: "Clay Tandoor Masterpieces",
    subtitle: "Charcoal Grilled Fresh Cottage Cheese",
    zoneId: "royal-courtyard",
    badge: "Chef Special",
  },
];

// Restaurant Profile Data
const restaurantData = {
  name: "TASTORA Pure Veg Restaurant",
  tagline: "Royal Heritage Cuisine • 100% Pure Vegetarian Kitchen",
  pic: "/img/dining/royal-courtyard.jpg",
  phone: "+1 (800) 123-4567",
  status: true, // true = Open Now, false = Closed
  discount: 20,
  seatAvailable: 24,
  reservationPrice: 25,
  finalPrice: 20, // Discounted price per seat / cover
  address: "42 Flavor Street, Near Central Plaza, Manhattan, NY 10001",
  openTime: "11:00",
  closeTime: "23:30",
  displayHours: "11:00 AM – 11:30 PM",
};

// Dining Ambiance Zones
const diningZones = [
  {
    id: "royal-courtyard",
    name: "The Royal Courtyard",
    tagline: "Fine Dining & Live Classical Sitar",
    description: "Grand imperial hall beneath glistening crystal chandeliers with soft live sitar & flute melodies.",
    image: "/img/dining/royal-courtyard.jpg",
    capacity: "2 – 12 Guests",
    vibe: "Grand & Celebratory",
    badge: "Most Popular",
    badgeColor: "bg-rose-600",
  },
  {
    id: "rooftop-terrace",
    name: "Starlit Rooftop Terrace",
    tagline: "Twilight Breeze & Skyline Vistas",
    description: "Open-air garden dining under glowing fairy lights with sweeping city skyline views.",
    image: "/img/dining/rooftop-terrace.jpg",
    capacity: "2 – 8 Guests",
    vibe: "Romantic & Social",
    badge: "Scenic View",
    badgeColor: "bg-emerald-600",
  },
  {
    id: "private-vip",
    name: "Private VIP Suite",
    tagline: "Soundproof Sanctuary with Dedicated Butler",
    description: "Intimate dark teak wood room with private lounge, ambient lighting, and dedicated chef service.",
    image: "/img/dining/private-vip.jpg",
    capacity: "4 – 16 Guests",
    vibe: "Exclusive & Luxurious",
    badge: "VIP Butler",
    badgeColor: "bg-amber-600",
  },
];

// Special Add-ons
const addOnsList = [
  {
    id: "welcome-drink",
    name: "Royal Saffron Shahi Thandai Welcome",
    price: 6,
    unit: "per guest",
    description: "Chilled almond, pistachios & saffron infused welcome mocktail upon arrival.",
  },
  {
    id: "celebration-cake",
    name: "Chef's Eggless Belgian Truffle Cake (500g)",
    price: 24,
    unit: "per cake",
    description: "Freshly baked pure-veg chocolate cake with custom gold lettering.",
  },
  {
    id: "floral-candles",
    name: "Fresh Rose Bouquet & Tabletop Candlelight Setup",
    price: 18,
    unit: "per table",
    description: "Handpicked red rose arrangement with aromatic floating candles.",
  },
];

// Helper: Get today's ISO date string
function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Get list of upcoming dates for visual card and dropdown selection
function getUpcomingDatesList(totalDays = 30) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const dayNameShort = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNameFull = d.toLocaleDateString("en-US", { weekday: "long" });
    const monthShort = d.toLocaleDateString("en-US", { month: "short" });
    const monthFull = d.toLocaleDateString("en-US", { month: "long" });
    const dateNum = d.getDate();

    const isToday = i === 0;
    const isTomorrow = i === 1;

    let tag = dayNameShort;
    if (isToday) tag = "Today";
    else if (isTomorrow) tag = "Tomorrow";

    dates.push({
      iso,
      dateNum,
      monthShort,
      monthFull,
      year,
      dayNameShort,
      dayNameFull,
      tag,
      isToday,
      isTomorrow,
      isWeekend,
      displayLong: `${dayNameFull}, ${monthShort} ${dateNum}, ${year}${isToday ? " (Today)" : isTomorrow ? " (Tomorrow)" : isWeekend ? " (Weekend)" : ""}`,
    });
  }
  return dates;
}

// Helper: Generate 1-hour slots from openTime to closeTime
function generateTimeSlots(openTime, closeTime) {
  if (!openTime || !closeTime) return [];
  const slots = [];
  let start = new Date(`1970-01-01T${openTime}:00`);
  const end = new Date(`1970-01-01T${closeTime}:00`);
  const fmt = (t) => t.toString().padStart(2, "0");
  while (start < end) {
    const next = new Date(start);
    next.setMinutes(start.getMinutes() + 60);

    // Format to 12-hour AM/PM
    const format12 = (h, m) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${fmt(m)} ${ampm}`;
    };

    const formatted = `${format12(start.getHours(), start.getMinutes())} - ${format12(next.getHours(), next.getMinutes())}`;
    slots.push(formatted);
    start = next;
  }
  return slots;
}

// Helper: Filter slots for date (excluding passed slots for today)
function filterSlotsForDate(allSlots, dateStr) {
  if (!dateStr || dateStr !== getTodayStr()) return allSlots;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return allSlots.filter((slot) => {
    // Parse 12-hour time e.g. "1:00 PM"
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return true;
    let hh = parseInt(match[1], 10);
    const mm = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    const slotMins = hh * 60 + mm;
    return slotMins > nowMinutes;
  });
}

export default function ReservePage() {
  const {
    reservationsHistory,
    bookReservation,
    cancelReservation,
    rateReservation,
    userProfile,
  } = useCart();
  const { user: authUser } = useAuth() || {};

  // Navigation tab: "book" or "history"
  const [activeTab, setActiveTab] = useState("book");
  const [historySearch, setHistorySearch] = useState("");
  const [voucherModalRes, setVoucherModalRes] = useState(null);
  const [ratingModalRes, setRatingModalRes] = useState(null);
  const [resRatingVal, setResRatingVal] = useState(5);
  const [resFeedbackText, setResFeedbackText] = useState("");
  const [resRatingSuccess, setResRatingSuccess] = useState(false);
  const [resRatingError, setResRatingError] = useState("");

  // Main Configuration State
  const [selectedZone, setSelectedZone] = useState(diningZones[0]);
  const [reservationDate, setReservationDate] = useState(() => getTodayStr());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [qtySeats, setQtySeats] = useState(2);
  const [paymentMode, setPaymentMode] = useState("COD"); // "COD" | "Razorpay"
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState("Standard Pure Veg");
  const [occasion, setOccasion] = useState("Casual Dining");

  // Seats left (starts from the restaurant's capacity, drops after each booking)
  const [seatsLeft, setSeatsLeft] = useState(restaurantData.seatAvailable);

  // Login prompt modal
  const [loginModal, setLoginModal] = useState({ visible: false, message: "" });

  // Primary Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Validation & UI State
  const [showErrors, setShowErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState({ date: "", slot: "", general: "" });
  const [shareCopied, setShareCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [reservationActionError, setReservationActionError] = useState("");

  // Swiper Slider State
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    const targetIdx = galleryImages.findIndex((g) => g.zoneId === zone.id);
    if (targetIdx !== -1 && swiperInstance) {
      swiperInstance.slideTo(targetIdx);
    }
  };

  // Reviews State
  const [comments, setComments] = useState([
    {
      _id: "rev-1",
      user: { name: "Ananya Deshmukh" },
      rating: 5,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      comment: "The Royal Courtyard ambiance with live classical sitar was out of this world. Dal Makhani and Shahi Paneer melted in our mouths. Best pure veg dining in NY!",
      zone: "The Royal Courtyard",
    },
    {
      _id: "rev-2",
      user: { name: "Rajesh & Priya Patel" },
      rating: 5,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      comment: "We requested a strict Jain thali arrangement for my parents' 50th anniversary. The staff took extraordinary care and the flavors were divine!",
      zone: "Private VIP Suite",
    },
    {
      _id: "rev-3",
      user: { name: "Marcus Vance" },
      rating: 5,
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      comment: "Booked the Rooftop Terrace for our team dinner. The crispy dosas, signature mocktails, and sunset view made it an unforgettable evening.",
      zone: "Starlit Rooftop",
    },
  ]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Upcoming Dates list (30 days) for non-calendar visual selector
  const upcomingDates = useMemo(() => getUpcomingDatesList(30), []);

  // Meal Period Filter State
  const [selectedMealPeriod, setSelectedMealPeriod] = useState("all"); // "all" | "lunch" | "evening" | "dinner"

  // Generate All Time Slots for the restaurant's operational hours
  const allGeneratedSlots = useMemo(() => {
    return generateTimeSlots(restaurantData.openTime, restaurantData.closeTime);
  }, []);

  const handleDateSelect = (dateIso) => {
    setReservationDate(dateIso);
    setErrorMsg((prev) => ({ ...prev, date: "" }));
    // Clean up past slots if switching to today
    setSelectedSlots((prev) =>
      prev.filter((s) => filterSlotsForDate(allGeneratedSlots, dateIso).includes(s))
    );
  };

  const selectedDateInfo = useMemo(() => {
    return (
      upcomingDates.find((d) => d.iso === reservationDate) || {
        iso: reservationDate,
        displayLong: reservationDate,
        tag: "Selected",
        dateNum: reservationDate ? reservationDate.split("-")[2] : "",
        monthShort: "",
        dayNameShort: "",
        isToday: reservationDate === getTodayStr(),
      }
    );
  }, [upcomingDates, reservationDate]);

  const thisWeekendIso = useMemo(() => {
    const weekendDate = upcomingDates.find((d) => d.isWeekend && !d.isToday);
    return weekendDate ? weekendDate.iso : null;
  }, [upcomingDates]);

  // Filter slots available for the selected date
  const availableSlotsForDate = useMemo(() => {
    return filterSlotsForDate(allGeneratedSlots, reservationDate);
  }, [allGeneratedSlots, reservationDate]);

  // Helper to categorize slot period
  const getSlotPeriod = useCallback((slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return "lunch";
    let hh = parseInt(match[1], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    if (hh < 16) return "lunch";
    if (hh < 19) return "evening";
    return "dinner";
  }, []);

  // Filtered slots by active meal period
  const filteredSlotsForPeriod = useMemo(() => {
    if (selectedMealPeriod === "all") return availableSlotsForDate;
    return availableSlotsForDate.filter((slot) => getSlotPeriod(slot) === selectedMealPeriod);
  }, [availableSlotsForDate, selectedMealPeriod, getSlotPeriod]);

  // Handle direct 1-tap slot selection (toggle or cycle max 2 slots)
  const handleToggleSlot = (slot) => {
    if (!slot) return;
    if (selectedSlots.includes(slot)) {
      setSelectedSlots((prev) => prev.filter((s) => s !== slot));
    } else {
      if (selectedSlots.length >= 2) {
        // Automatically cycle: replace first slot
        setSelectedSlots((prev) => [prev[1], slot]);
      } else {
        setSelectedSlots((prev) => [...prev, slot]);
      }
      setErrorMsg((prev) => ({ ...prev, slot: "" }));
    }
  };

  // Add-on cost calculation
  const totalAddOnCost = useMemo(() => {
    return selectedAddOns.reduce((total, id) => {
      const item = addOnsList.find((a) => a.id === id);
      if (!item) return total;
      if (item.unit === "per guest") {
        return total + item.price * qtySeats;
      }
      return total + item.price;
    }, 0);
  }, [selectedAddOns, qtySeats]);

  const baseSeatsCost = restaurantData.finalPrice * qtySeats;
  const grandTotal = baseSeatsCost + totalAddOnCost;
  const taxAmount = Number((grandTotal * 0.085).toFixed(2));
  const totalPayable = Number((grandTotal + taxAmount).toFixed(2));

  const avgRating = useMemo(() => {
    if (!comments.length) return "5.0";
    return (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1);
  }, [comments]);

  // Logged-in user id (auth context first, then localStorage)
  const getStoredUserId = () => {
    if (authUser?._id || authUser?.id) return authUser._id || authUser.id;
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userid") || localStorage.getItem("userId");
  };

  // Lowers the seat count after a booking. If NEXT_PUBLIC_RESTAURANT_ID is set
  // and syncServer is true, the new count is also saved on the server.
  const reduceSeats = async (count, syncServer) => {
    const next = Math.max(0, seatsLeft - count);
    setSeatsLeft(next);
    const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID;
    if (!syncServer || !restaurantId) return;
    try {
      const res = await api.put(`/resturent/user/${restaurantId}`, { seatAvailable: next });
      if (res.data?.result !== "Done") {
        console.error("Seat update failed after booking was created:", res.data);
      }
    } catch (seatErr) {
      // The booking already exists, so don't block the user. Worth reconciling server-side.
      console.error("Seat update failed after booking was created:", seatErr);
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurantData.name,
          text: `Reserve a table at ${restaurantData.name} - 100% Pure Veg Fine Dining!`,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled share sheet
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  // Submit Reservation
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);

    // Restaurant must be open to accept any booking at all.
    if (!restaurantData.status) {
      alert("This restaurant is currently closed and not accepting new bookings.");
      return;
    }

    // Check login first, so the person isn't asked to fill the form for nothing.
    const userId = getStoredUserId();
    if (!userId) {
      setLoginModal({ visible: true, message: "Log in to reserve a table." });
      return;
    }

    if (!reservationDate) {
      setErrorMsg((prev) => ({ ...prev, date: "Reservation Date is required." }));
      return;
    }

    const selDate = new Date(reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selDate < today) {
      setErrorMsg((prev) => ({ ...prev, date: "Past date is not allowed." }));
      return;
    }

    if (!selectedSlots.length) {
      setErrorMsg((prev) => ({ ...prev, slot: "Please select at least one time slot." }));
      return;
    }

    // A slot can be valid when picked and pass while the form sits open.
    const validSlotsNow = filterSlotsForDate(allGeneratedSlots, reservationDate);
    const stillValidSlots = selectedSlots.filter((s) => validSlotsNow.includes(s));
    if (stillValidSlots.length === 0) {
      setErrorMsg((prev) => ({
        ...prev,
        slot: "Your selected time slot(s) have already passed. Please choose another.",
      }));
      setSelectedSlots([]);
      return;
    }

    if (seatsLeft <= 0) {
      setErrorMsg((prev) => ({ ...prev, general: "No seats are available right now." }));
      return;
    }
    if (qtySeats > seatsLeft) {
      setErrorMsg((prev) => ({
        ...prev,
        general: `Only ${seatsLeft} seat${seatsLeft > 1 ? "s" : ""} left. Please reduce the number of guests.`,
      }));
      setQtySeats(seatsLeft);
      return;
    }

    if (!window.confirm("Are you sure you want to make a booking?")) {
      return;
    }

    setIsSubmitting(true);
    setErrorMsg((prev) => ({ ...prev, general: "" }));
    const tax = taxAmount;
    const total = totalPayable;
    const addOnNames = selectedAddOns.map((id) => addOnsList.find((item) => item.id === id)?.name).filter(Boolean);
    const bookingPayload = {
      user: userId,
      paymentMode: paymentMode === "COD" ? "COD" : "Razorpay",
      date: reservationDate,
      time: stillValidSlots.join(", "),
      seats: qtySeats,
      total,
      restaurantName: restaurantData.name,
      zone: selectedZone.name,
      zoneImage: selectedZone.image,
      occasion,
      dietary: selectedDiet,
      addOns: addOnNames,
      guestName: guestName.trim() || userProfile?.name || "",
      guestPhone: guestPhone.trim() || userProfile?.phone || "",
      guestEmail: guestEmail.trim() || userProfile?.email || "",
      specialNotes: specialNotes.trim(),
      coverPricePerGuest: restaurantData.finalPrice,
      addOnTotal: totalAddOnCost,
      tax,
    };

    let pendingBookingId = null;
    let paymentAuthorized = false;
    try {
      // Step 1: create the booking
      const bookingResponse = await api.post("/booking", bookingPayload);
      const savedBooking = bookingResponse.data?.data;
      if (bookingResponse.data?.result !== "Done" || !savedBooking?._id) {
        throw new Error(bookingResponse.data?.reason || "Could not save your reservation.");
      }
      pendingBookingId = savedBooking._id;

      // Step 2: online payment (only for Razorpay)
      let confirmedPaymentMethod = "COD (Pay at Counter)";
      if (paymentMode !== "COD") {
        const orderResponse = await api.post("/booking/order", { checkid: savedBooking._id });
        const razorpayOrder = orderResponse.data?.data;
        if (orderResponse.data?.result !== "Done" || !razorpayOrder?.id) {
          throw new Error(orderResponse.data?.reason || "Could not start Razorpay payment.");
        }

        const paymentResponse = await openRazorpayModal({
          amount: total,
          orderId: razorpayOrder.id,
          orderName: "Tastora Dining Reservation",
          description: `${qtySeats} guests • ${selectedZone.name}`,
          prefill: {
            name: bookingPayload.guestName,
            email: bookingPayload.guestEmail,
            contact: bookingPayload.guestPhone,
          },
        });
        paymentAuthorized = true;

        const verifyResponse = await api.post("/booking/verify", {
          checkid: savedBooking._id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        });
        if (verifyResponse.data?.result !== "Done") {
          throw new Error(verifyResponse.data?.message || "Razorpay payment verification failed.");
        }
        confirmedPaymentMethod = "Razorpay";
      }

      // Step 3: reduce seats. COD saves it on the server right away.
      // For Razorpay only the on-screen count drops here (the payment is already
      // verified server-side).
      await reduceSeats(qtySeats, paymentMode === "COD");

      const bookingRef = `RES-${String(savedBooking._id).slice(-6).toUpperCase()}`;
      const booked = bookReservation({
        id: bookingRef,
        dbId: savedBooking._id,
        dateDisplay: `${selectedDateInfo.displayLong} • ${stillValidSlots.join(", ")}`,
        zoneName: selectedZone.name,
        zoneImage: selectedZone.image,
        guests: qtySeats,
        slots: stillValidSlots,
        occasion,
        dietary: selectedDiet,
        addOns: addOnNames,
        guestName: bookingPayload.guestName,
        guestPhone: bookingPayload.guestPhone,
        guestEmail: bookingPayload.guestEmail,
        specialNotes: bookingPayload.specialNotes,
        coverPricePerGuest: restaurantData.finalPrice,
        addOnTotal: totalAddOnCost,
        taxes: tax,
        total,
        depositPaid: paymentMode === "COD" ? 0 : total,
        paymentMethod: confirmedPaymentMethod,
      });

      setSelectedSlots(stillValidSlots);
      setBookingId(booked.id);
      setBookingConfirmed(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (pendingBookingId && paymentMode !== "COD" && !paymentAuthorized) {
        await api.post(`/booking/${encodeURIComponent(pendingBookingId)}/cancel`).catch(() => {});
      }
      const serverReason = error.response?.data?.reason || error.response?.data?.message;
      const message = typeof serverReason === "string" ? serverReason : error.message;
      setErrorMsg((prev) => ({
        ...prev,
        general: message?.toLowerCase().includes("dismiss")
          ? "Payment was cancelled. Your reservation is not confirmed; you can try again."
          : message || "Could not complete your reservation.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel a reservation
  const handleCancelReservation = async (reservationId) => {
    const reservation = reservationsHistory.find(
      (item) => item.id === reservationId || item.dbId === reservationId
    );
    if (!reservation?.dbId) {
      setReservationActionError("This reservation is not linked to a saved booking.");
      return;
    }
    try {
      const response = await api.post(`/booking/${encodeURIComponent(reservation.dbId)}/cancel`);
      if (response.data?.result !== "Done") {
        throw new Error(response.data?.reason || "Could not cancel this reservation.");
      }
      cancelReservation(reservation.id);
      setReservationActionError("");
    } catch (error) {
      setReservationActionError(error.response?.data?.reason || error.message || "Could not cancel this reservation.");
    }
  };

  // Submit Review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setReviewError("Please write a few words about your dining experience.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    setTimeout(() => {
      const newReview = {
        _id: `rev-${Date.now()}`,
        user: { name: reviewName.trim() || "Verified Diner" },
        rating: reviewRating,
        createdAt: new Date().toISOString(),
        comment: reviewText.trim(),
        zone: "Main Dining Hall",
      };

      setComments((prev) => [newReview, ...prev]);
      setReviewText("");
      setReviewName("");
      setReviewRating(5);
      setReviewSubmitting(false);
      setReviewSuccess("Thank you! Your dining review has been posted.");
      setTimeout(() => {
        setReviewSuccess("");
        setShowReviewModal(false);
      }, 1500);
    }, 500);
  };

  // Filtered reservations memo
  const filteredReservations = useMemo(() => {
    return (reservationsHistory || []).filter((res) => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        res.id?.toLowerCase().includes(q) ||
        res.date?.toLowerCase().includes(q) ||
        res.zone?.toLowerCase().includes(q) ||
        res.guestName?.toLowerCase().includes(q) ||
        res.occasion?.toLowerCase().includes(q)
      );
    });
  }, [reservationsHistory, historySearch]);

  const handleSaveResRating = async (e) => {
    e.preventDefault();
    if (!ratingModalRes?.dbId) {
      setResRatingError("This reservation is not linked to a saved booking.");
      return;
    }
    setResRatingError("");
    try {
      const response = await api.post(`/booking/${encodeURIComponent(ratingModalRes.dbId)}/rating`, {
        ratingGiven: resRatingVal,
        feedback: resFeedbackText.trim(),
      });
      if (response.data?.result !== "Done") {
        throw new Error(response.data?.reason || "Could not save your rating.");
      }
      rateReservation(ratingModalRes.id, resRatingVal, resFeedbackText.trim());
      setResRatingSuccess(true);
      setTimeout(() => {
        setRatingModalRes(null);
        setResRatingSuccess(false);
      }, 1500);
    } catch (error) {
      setResRatingError(error.response?.data?.reason || error.message || "Could not save your rating.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 pt-56 sm:pt-52 md:pt-44 lg:pt-40 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 mt-1 sm:mt-2">
        {reservationActionError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {reservationActionError}
          </p>
        )}

        {/* ------------------------------------------
            COMPACT HEADER & QUICK INFO
        ------------------------------------------ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-rose-600 font-bold">Table Reservation</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Table Reservation
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-rose-600" />
                100% Pure Veg
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <Check className="w-3 h-3 text-emerald-600" />
                Instant Priority Table
              </span>
            </div>

            <p className="text-xs text-zinc-500 mt-1 font-medium flex flex-wrap items-center gap-2">
              <span>{restaurantData.address}</span>
              <span>•</span>
              <span className="text-zinc-700 font-bold">{restaurantData.displayHours}</span>
              <span>•</span>
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {avgRating} ({comments.length} reviews)
              </span>
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:border-rose-300 text-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer group"
              aria-label="Share restaurant"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              <span>Share</span>
              {shareCopied && (
                <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-bold whitespace-nowrap shadow-md animate-in fade-in">
                  Copied!
                </span>
              )}
            </button>

            <a
              href={`tel:${restaurantData.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Concierge Hotline</span>
            </a>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab("book");
              setBookingConfirmed(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "book"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Book a Table</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "history"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Reservations History ({reservationsHistory?.length || 0})</span>
          </button>
        </div>

        {/* Dynamic View: History Tab OR Booking Form */}
        {activeTab === "history" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search Box */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search reservations by ID (e.g. RES-78219), Dining Zone, or Date..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                {historySearch && (
                  <button
                    onClick={() => setHistorySearch("")}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Reservations List */}
            {filteredReservations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-100/70 border border-rose-200 flex items-center justify-center text-4xl shadow-inner">
                  🪑
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-zinc-900">
                    No Table Reservations Found
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                    {historySearch
                      ? `No reservations matching "${historySearch}". Try another search keyword.`
                      : "You haven't made any table reservations yet."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("book")}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Reserve a Table Now
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredReservations.map((res) => (
                  <HistoryCard
                    key={res.id}
                    type="reservation"
                    item={res}
                    onCancelReservation={handleCancelReservation}
                    onOpenRating={(item) => {
                      setRatingModalRes(item);
                      setResRatingVal(item.ratingGiven || 5);
                      setResFeedbackText(item.feedback || "");
                      setResRatingSuccess(false);
                      setResRatingError("");
                    }}
                    onOpenInvoice={(item) => setVoucherModalRes(item)}
                    onBookAgain={() => {
                      setActiveTab("book");
                      setBookingConfirmed(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : bookingConfirmed ? (
          /* ==========================================
              OFFICIAL DIGITAL TABLE PASS / CONFIRMATION
          ========================================== */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Success Badge */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Reservation Confirmed
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-1">
                  Your Table is Reserved &amp; Ready!
                </h2>
                <p className="text-xs text-zinc-500">
                  Instant priority pass at TASTORA Pure Veg Restaurant.
                </p>
              </div>
            </div>

            {/* Boarding Pass Card */}
            <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-gradient-to-br from-rose-50/70 via-amber-50/40 to-white p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-2xs">
                    <Flame className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900">{restaurantData.name}</h3>
                    <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                      Official Table Pass
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Pass ID</p>
                  <p className="text-xs font-mono font-black text-zinc-900">{bookingId}</p>
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Date</p>
                  <p className="font-black text-zinc-900 mt-0.5 text-xs">
                    {new Date(reservationDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Time Slot</p>
                  <p className="font-black text-rose-600 mt-0.5 text-xs">
                    {selectedSlots.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Guests</p>
                  <p className="font-black text-zinc-900 mt-0.5 text-xs">{qtySeats} Guests</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Seating</p>
                  <p className="font-black text-zinc-900 mt-0.5 text-xs">Main Dining Hall</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-rose-200/80 text-xs">
                <div>
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Payment</p>
                  <p className="font-bold text-zinc-800 text-[11px] py-3">
                    {paymentMode === "COD" ? "Pay at Restaurant" : "Razorpay (Paid Online)"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 font-semibold uppercase text-[9px]">Total</p>
                  <p className="font-black text-rose-600 text-sm">₹{totalPayable.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save / Print</span>
              </button>
              <Link
                href="/menu"
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 text-center shadow-xs"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Explore Menu</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setBookingConfirmed(false);
                  setSelectedSlots([]);
                  setGuestName("");
                  setGuestPhone("");
                  setGuestEmail("");
                }}
                className="py-2.5 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================
              COMPACT SPLIT LAYOUT: SHOWCASE + BOOKING
          ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* ------------------------------------------
                LEFT COLUMN (5 Cols): COMPACT RESTAURANT SHOWCASE
            ------------------------------------------ */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compact Image Carousel */}
              <div className="relative rounded-2xl overflow-hidden shadow-md aspect-16/10 bg-zinc-950 group">
                <Swiper
                  modules={[Autoplay, Pagination, Navigation, EffectFade]}
                  effect="fade"
                  fadeEffect={{ crossFade: true }}
                  speed={700}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  onSwiper={setSwiperInstance}
                  onSlideChange={(s) => setActiveSlideIndex(s.realIndex || s.activeIndex)}
                  navigation={{
                    prevEl: ".hero-swiper-prev",
                    nextEl: ".hero-swiper-next",
                  }}
                  className="h-full w-full"
                >
                  {galleryImages.map((img, idx) => (
                    <SwiperSlide key={img.id} className="relative h-full w-full">
                      <Image
                        src={img.url}
                        alt={img.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Swiper Prev & Next Buttons on Hover */}
                <button
                  type="button"
                  className="hero-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="hero-swiper-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <div className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow-2xs">
                    <Camera className="w-3 h-3 text-rose-400" />
                    <span>
                      {activeSlideIndex + 1}/{galleryImages.length} Photos
                    </span>
                  </div>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20 text-white pointer-events-none">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm sm:text-base font-black drop-shadow-md truncate">
                      {galleryImages[activeSlideIndex]?.title}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold shrink-0 shadow-2xs">
                      {galleryImages[activeSlideIndex]?.badge || "Pure Veg"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Thumbnail Pills */}
              <div className="grid grid-cols-5 gap-1.5">
                {galleryImages.map((img, idx) => {
                  const isActive = activeSlideIndex === idx;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => swiperInstance?.slideTo(idx)}
                      className={`relative h-11 rounded-xl overflow-hidden border transition-all cursor-pointer ${isActive
                          ? "border-rose-500 ring-1 ring-rose-400 shadow-2xs scale-105"
                          : "border-zinc-200 opacity-60 hover:opacity-100"
                        }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <Image src={img.url} alt={img.title} fill className="object-cover" />
                    </button>
                  );
                })}
              </div>

              {/* Consolidated Quick Details Card */}
              <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-2xs space-y-3">
                {/* Price & Seats Available Bar */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Reservation Cover
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black text-rose-600">
                        ${restaurantData.finalPrice}
                      </span>
                      {restaurantData.reservationPrice !== restaurantData.finalPrice && (
                        <span className="text-[11px] text-zinc-400 line-through font-semibold">
                          ${restaurantData.reservationPrice}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500">/ seat</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        seatsLeft > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {seatsLeft > 0 ? `${seatsLeft} Seats Available` : "Fully Booked"}
                    </span>
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">{restaurantData.discount}% OFF Booking</p>
                  </div>
                </div>

                {/* Amenities Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Pure Veg</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <Car className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Free Valet</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <Music className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Live Sitar Music</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <Crown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Main Dining Hall</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------
                RIGHT COLUMN (7 Cols): COMPACT BOOKING FORM
            ------------------------------------------ */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleReservationSubmit}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                      Instant Table Reservation
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[9px] font-extrabold shrink-0">
                    Instant Pass
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Closed warning if applicable */}
                  {!restaurantData.status && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This restaurant is currently closed for reservations.</span>
                    </div>
                  )}

                  {/* 1. Date Selection (Compact Non-Calendar Format) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        <span>Date of Visit *</span>
                      </label>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-extrabold border border-rose-200/70">
                        {selectedDateInfo.displayLong}
                      </span>
                    </div>

                    {/* Quick Preset Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                      <button
                        type="button"
                        onClick={() => handleDateSelect(upcomingDates[0]?.iso)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 shrink-0 cursor-pointer ${reservationDate === upcomingDates[0]?.iso
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                          }`}
                      >
                        ⚡ Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateSelect(upcomingDates[1]?.iso)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 shrink-0 cursor-pointer ${reservationDate === upcomingDates[1]?.iso
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                          }`}
                      >
                        📅 Tomorrow
                      </button>
                      {thisWeekendIso && (
                        <button
                          type="button"
                          onClick={() => handleDateSelect(thisWeekendIso)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 shrink-0 cursor-pointer ${reservationDate === thisWeekendIso
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                            }`}
                        >
                          🎉 Weekend
                        </button>
                      )}
                    </div>

                    {/* Horizontal Interactive Day Cards Carousel/Strip */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                      {upcomingDates.slice(0, 10).map((item) => {
                        const isSelected = reservationDate === item.iso;
                        return (
                          <button
                            key={item.iso}
                            type="button"
                            onClick={() => handleDateSelect(item.iso)}
                            className={`group relative flex flex-col items-center justify-between p-2 min-w-[62px] sm:min-w-[66px] rounded-xl border transition-all duration-150 text-center shrink-0 cursor-pointer ${isSelected
                                ? "bg-gradient-to-b from-rose-600 to-pink-600 border-rose-600 text-white shadow-xs scale-[1.02]"
                                : "bg-white hover:bg-rose-50/60 border-zinc-200 text-zinc-800"
                              }`}
                          >
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded ${isSelected
                                  ? "bg-white/20 text-white"
                                  : item.isToday
                                    ? "bg-rose-100 text-rose-700"
                                    : item.isWeekend
                                      ? "bg-amber-100 text-amber-800"
                                      : "text-zinc-400 bg-zinc-100"
                                }`}
                            >
                              {item.tag}
                            </span>
                            <span
                              className={`text-base font-black my-0.5 tracking-tight ${isSelected ? "text-white" : "text-zinc-900"
                                }`}
                            >
                              {item.dateNum}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${isSelected ? "text-rose-100" : "text-zinc-400"
                                }`}
                            >
                              {item.monthShort}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {showErrors && errorMsg.date && (
                      <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errorMsg.date}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. Time Slot Selector Grid (Compact) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Dining Time (Max 2 Slots) *</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {selectedSlots.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedSlots([])}
                            className="text-[10px] font-bold text-zinc-400 hover:text-red-500 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${selectedSlots.length > 0
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-700"
                              : "bg-zinc-100 border-zinc-200 text-zinc-500"
                            }`}
                        >
                          {selectedSlots.length === 0
                            ? "0/2 Slots"
                            : `${selectedSlots.length} Selected (${selectedSlots.length} hr)`}
                        </span>
                      </div>
                    </div>

                    {/* Meal Period Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                      {[
                        { id: "all", label: "All" },
                        { id: "lunch", label: "☀️ Lunch" },
                        { id: "evening", label: "🌆 Evening" },
                        { id: "dinner", label: "🌙 Dinner" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedMealPeriod(tab.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs shrink-0 cursor-pointer ${selectedMealPeriod === tab.id
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {availableSlotsForDate.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>All slots for today have passed. Please choose tomorrow.</span>
                      </div>
                    ) : filteredSlotsForPeriod.length === 0 ? (
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs font-semibold text-center">
                        No slots in this period.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {filteredSlotsForPeriod.map((slot) => {
                          const isSelected = selectedSlots.includes(slot);
                          const startTime = slot.split(" - ")[0];

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleToggleSlot(slot)}
                              className={`p-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${isSelected
                                  ? "bg-gradient-to-r from-rose-600 to-pink-600 border-rose-600 text-white shadow-2xs scale-[1.01]"
                                  : "bg-white hover:bg-rose-50/60 border-zinc-200 text-zinc-800"
                                }`}
                            >
                              <p className={`text-xs font-black ${isSelected ? "text-white" : "text-zinc-900"}`}>
                                {startTime}
                              </p>
                              <span className={`text-[9px] mt-0.5 ${isSelected ? "text-rose-100" : "text-zinc-400"}`}>
                                1 Hour Slot
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {showErrors && errorMsg.slot && (
                      <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errorMsg.slot}</span>
                      </p>
                    )}
                  </div>

                  {/* 3. Combined Guests & Payment in 1 Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Guest Stepper */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-rose-600" />
                          <span>Guests</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          Max {seatsLeft}
                        </span>
                      </label>
                      <div className="h-13 bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/90 flex items-center justify-between shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setQtySeats((p) => Math.max(1, p - 1))}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-800 font-black text-base flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
                          aria-label="Decrease guests"
                        >
                          <Minus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <div className="text-center px-2">
                          <p className="text-base font-black text-zinc-900 leading-tight">
                            {qtySeats} {qtySeats > 1 ? "Guests" : "Guest"}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                            Seats Reserved
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQtySeats((p) => Math.min(Math.max(seatsLeft, 1), p + 1))}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-800 font-black text-base flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
                          aria-label="Increase guests"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                        <span>Payment Preference</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 h-13">
                        <button
                          type="button"
                          onClick={() => setPaymentMode("COD")}
                          className={`h-full rounded-2xl border flex flex-col items-center justify-center px-2 transition-all cursor-pointer shadow-2xs ${
                            paymentMode === "COD"
                              ? "bg-rose-50 border-rose-400 text-rose-950 font-black ring-2 ring-rose-400/40 shadow-xs"
                              : "bg-white hover:bg-zinc-50 border-zinc-200/90 text-zinc-700 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-black">Pay at Dine</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-medium mt-0.5">
                            Cash / Card
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMode("Razorpay")}
                          className={`h-full rounded-2xl border flex flex-col items-center justify-center px-2 transition-all cursor-pointer shadow-2xs ${
                            paymentMode === "Razorpay"
                              ? "bg-rose-50 border-rose-400 text-rose-950 font-black ring-2 ring-rose-400/40 shadow-xs"
                              : "bg-white hover:bg-zinc-50 border-zinc-200/90 text-zinc-700 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-xs font-black">Pay Online</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-medium mt-0.5">
                            Razorpay • UPI / Card
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Submit Action */}
                  <div className="pt-3 border-t border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <p className="text-xs text-zinc-500 font-semibold">Total Payable</p>
                        <p className="text-[10px] text-zinc-400">
                          ₹{restaurantData.finalPrice} × {qtySeats} seat{qtySeats > 1 ? "s" : ""} + add-ons + tax
                        </p>
                      </div>
                      <span className="text-xl font-black text-rose-600">
                        ₹{totalPayable.toFixed(2)}
                      </span>
                    </div>

                    {errorMsg.general && (
                      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                        {errorMsg.general}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !restaurantData.status || seatsLeft <= 0}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing Reservation...</span>
                      ) : seatsLeft <= 0 ? (
                        <span>Fully Booked</span>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>{paymentMode === "COD" ? "Confirm Table" : "Pay & Reserve"} (₹{totalPayable.toFixed(2)})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            COMPACT GUEST REVIEWS & FEEDBACK
        ------------------------------------------ */}
        <section className="mt-8 pt-6 border-t border-zinc-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <h3 className="text-base sm:text-lg font-black text-zinc-900">
                  Guest Dining Reviews ({comments.length})
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Feedback from patrons who celebrated dining moments with us.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{avgRating} / 5.0</span>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {comments.slice(0, 3).map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-zinc-900">{rev.user?.name || "Verified Diner"}</p>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 italic line-clamp-3">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------
            LOGIN REQUIRED MODAL
        ------------------------------------------ */}
        {loginModal.visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-zinc-100 space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-zinc-900">Login Required</h3>
                <p className="text-xs text-zinc-500">{loginModal.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginModal({ visible: false, message: "" })}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Link
                  href="/login"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            WRITE A REVIEW MODAL
        ------------------------------------------ */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-zinc-100 space-y-4 relative animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900">
                      Write a Dining Review
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Share your dining experience &amp; feedback
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reviewSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {reviewError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating Picker */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-200 hover:text-amber-200"
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-zinc-600 ml-1">
                      {reviewRating === 5
                        ? "Exceptional (5/5)"
                        : reviewRating === 4
                          ? "Very Good (4/5)"
                          : reviewRating === 3
                            ? "Average (3/5)"
                            : reviewRating === 2
                              ? "Fair (2/5)"
                              : "Poor (1/5)"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ishaan Sharma"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-rose-500 focus:bg-white text-xs font-bold text-zinc-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with the food, hospitality, and ambiance..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-rose-500 focus:bg-white text-xs font-medium text-zinc-800 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reviewSubmitting ? "Posting..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================
            OFFICIAL RESERVATION VOUCHER MODAL
        ==================================================== */}
        {voucherModalRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
              <div className="p-5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black">Official Reservation Voucher</h3>
                </div>
                <button
                  onClick={() => setVoucherModalRes(null)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-700">
                <div className="text-center pb-4 border-b border-zinc-200 space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-sm font-black text-zinc-900">
                    <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      🌿
                    </span>
                    <span>TASTORA PURE VEG RESTAURANT</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    42 Flavor Street, Midtown Manhattan, NY 10001
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    GSTIN: 27AABCP1234F1Z8 • Priority Table Booking Pass
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-200">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Booking Ref ID:</span>
                    <span className="font-mono font-bold text-zinc-900">{voucherModalRes.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Date &amp; Slot:</span>
                    <span className="font-medium text-zinc-900">{voucherModalRes.date}</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-zinc-400 block text-[10px]">Reserved For:</span>
                    <span className="font-bold text-zinc-900">
                      {voucherModalRes.guestName || userProfile?.name || "Guest"}
                    </span>
                    <p className="text-[11px] text-zinc-500">{voucherModalRes.guestPhone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-black uppercase text-[10px] text-zinc-400 pb-1 border-b border-zinc-100">
                    <span>Dining Experience</span>
                    <span>Amount</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    <div className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-zinc-900">{voucherModalRes.zone}</p>
                        <p className="text-[10px] text-zinc-400">
                          {voucherModalRes.guests} Guests Cover @ ${voucherModalRes.coverPricePerGuest || 20}/guest
                        </p>
                      </div>
                      <span className="font-mono font-bold text-zinc-900">
                        ${((voucherModalRes.guests || 2) * (voucherModalRes.coverPricePerGuest || 20)).toFixed(2)}
                      </span>
                    </div>

                    {voucherModalRes.addOnTotal > 0 && (
                      <div className="py-2 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-900">Special Add-on Setups</p>
                          <p className="text-[10px] text-zinc-400">
                            {voucherModalRes.addOns?.join(", ") || "Selected Addons"}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-zinc-900">
                          +${voucherModalRes.addOnTotal?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-right">
                  <div className="flex justify-between">
                    <span>Hospitality Taxes:</span>
                    <span className="font-mono">${voucherModalRes.taxes?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-sm text-zinc-900">
                    <span>Total Deposit ({voucherModalRes.paymentMethod}):</span>
                    <span className="text-rose-600 font-mono">${Number(voucherModalRes.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-[10px] text-zinc-400">
                  Please show this digital voucher to our Maitre D' at reception. 100% Pure Veg Certified.
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>

                <button
                  onClick={() => setVoucherModalRes(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            EXPERIENCE RATING MODAL
        ==================================================== */}
        {ratingModalRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
              <div className="p-5 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-white" />
                  <h3 className="text-base font-black">Rate Table Experience</h3>
                </div>
                <button
                  onClick={() => setRatingModalRes(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveResRating} className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Booking: {ratingModalRes.id} • {ratingModalRes.zone}
                  </p>
                  <p className="text-sm font-black text-zinc-900">
                    How was the ambiance, food, and hospitality?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setResRatingVal(star)}
                      className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= resRatingVal
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  value={resFeedbackText}
                  onChange={(e) => setResFeedbackText(e.target.value)}
                  placeholder="Share any special compliments for our Chef and Concierge..."
                  className="w-full p-3 text-xs rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                />

                {resRatingSuccess && (
                  <p className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you for your rating!</span>
                  </p>
                )}
                {resRatingError && (
                  <p role="alert" className="text-center text-xs font-semibold text-red-600">{resRatingError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}