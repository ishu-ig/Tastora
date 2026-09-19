"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Clock,
  Check,
  Star,
  RotateCcw,
  Sparkles,
  ArrowRight,
  LogOut,
  Bell,
  Mail,
  Phone,
  Calendar,
  Gift,
  Award,
  Download,
  X,
  ExternalLink,
} from "lucide-react";
import HistoryCard from "../../Component/HistoryCard";
import { useCart } from "../../context/CartContext";
import { fullMenuCatalog } from "../menu/page";

export default function ProfilePage() {
  const {
    userProfile,
    setUserProfile,
    ordersHistory,
    reorderPastOrder,
    reservationsHistory,
    cancelReservation,
    savedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    superCoinsBalance,
    favorites,
    addToCart,
  } = useCart();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "addresses" | "supercoins" | "favorites" | "dietary" | "settings"
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || "Ishaan Sharma",
    mobile: userProfile?.mobile || userProfile?.phone || "+1 (555) 234-5678",
    email: userProfile?.email || "ishaan.sharma@example.com",
    gender: userProfile?.gender || "Male",
    anniversary: userProfile?.anniversary || "2024-11-24",
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrForm, setAddrForm] = useState({
    tag: "Home",
    recipientName: userProfile.name,
    phone: userProfile.mobile || userProfile.phone,
    addressLine: "",
    landmark: "",
    city: "New York",
    zipCode: "10001",
    type: "home",
  });

  // Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Dietary Preferences State
  const [jainMode, setJainMode] = useState(false);
  const [veganMode, setVeganMode] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState("Medium 🌶️🌶️");
  const [ecoPackaging, setEcoPackaging] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatAnniversary = (dateStr) => {
    if (!dateStr) return "Not specified";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleCopyCoupon = (code) => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(code);
      setCopiedCoupon(code);
      showToast(`Copied coupon code ${code}!`);
      setTimeout(() => setCopiedCoupon(null), 2500);
    }
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: userProfile?.name || "",
      mobile: userProfile?.mobile || userProfile?.phone || "",
      email: userProfile?.email || "",
      gender: userProfile?.gender || "Male",
      anniversary: userProfile?.anniversary || "",
    });
    setIsEditProfileModalOpen(true);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updated = {
      ...userProfile,
      name: profileForm.name,
      mobile: profileForm.mobile,
      phone: profileForm.mobile,
      email: profileForm.email,
      gender: profileForm.gender,
      anniversary: profileForm.anniversary,
    };
    setUserProfile(updated);
    setIsEditProfileModalOpen(false);
    showToast("Profile details updated successfully!");
  };

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      tag: "Home",
      recipientName: userProfile.name,
      phone: userProfile.phone,
      addressLine: "",
      landmark: "",
      city: "New York",
      zipCode: "10001",
      type: "home",
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrForm(addr);
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addrForm.addressLine) return;
    if (editingAddressId) {
      updateAddress(editingAddressId, addrForm);
      showToast("Address updated successfully!");
    } else {
      addAddress(addrForm);
      showToast("New address added successfully!");
    }
    setIsAddressModalOpen(false);
  };

  const favoritedDishes = fullMenuCatalog.filter((d) => favorites[d.id]);
  const activeLiveOrder = (ordersHistory || []).find(
    (o) => o.status === "In Kitchen" || o.status === "Picked Up" || o.status === "Confirmed"
  );
  const upcomingReservation = (reservationsHistory || []).find(
    (r) => r.status === "Confirmed"
  );

  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-zinc-950 text-white px-5 py-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">My Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">
            Customer Dashboard &amp; VIP Hub
          </h1>
        </div>

        {/* User Hero Banner Card */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black shadow-inner">
                {userProfile.gender === "Female" ? "👩" : "👨"}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px]">
                🌱
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black">{userProfile.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase shadow-2xs">
                  100% Pure Veg VIP Patron
                </span>
                {userProfile.gender && (
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-rose-100 text-[10px] font-bold">
                    {userProfile.gender}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-rose-100 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-rose-200" />
                  {userProfile.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rose-200" />
                  {userProfile.mobile || userProfile.phone}
                </span>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-rose-200 flex-wrap">
                {userProfile.anniversary && (
                  <span className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-md font-medium text-white">
                    💍 Anniversary: {formatAnniversary(userProfile.anniversary)}
                  </span>
                )}
                <span>Member since {userProfile.joinedDate}</span>
                <span>•</span>
                <span className="font-bold text-amber-200">{superCoinsBalance} SuperCoins Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>My Orders &rarr;</span>
            </Link>

            <button
              onClick={handleOpenEditProfile}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200/80 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "overview", label: "VIP Patron Hub", icon: Sparkles },
            { id: "addresses", label: "Saved Addresses", icon: MapPin, badge: savedAddresses.length },
            { id: "supercoins", label: "SuperCoins Rewards", icon: Coins, badge: `${superCoinsBalance} pts` },
            { id: "favorites", label: "Saved Favorites", icon: Heart, badge: favoritedDishes.length },
            { id: "dietary", label: "Dietary Preferences", icon: ShieldCheck },
            { id: "settings", label: "Account & Security", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200/80 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-zinc-800 text-amber-300" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB CONTENT 1: VIP OVERVIEW & QUICK ACCESS HUB
        ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Active Live Order / Reservation HUD (if any active) */}
            {activeLiveOrder && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-rose-600/15 border border-rose-400/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Live Food Dispatch
                    </span>
                    <span className="text-xs font-mono text-rose-100">
                      #{activeLiveOrder.id} • ETA: {activeLiveOrder.eta || "18-22 mins"}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white">
                    {activeLiveOrder.status === "In Kitchen"
                      ? "👨‍🍳 Chef is Preparing Your Meal in 100% Pure Veg Kitchen"
                      : activeLiveOrder.status === "Picked Up"
                      ? "🛵 Rider is On The Way with Sealed Thermal Bag"
                      : "✨ Order Confirmed & Cooking in Progress"}
                  </p>
                </div>

                <Link
                  href={`/orders/track?id=${activeLiveOrder.id}`}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Live GPS Map &rarr;</span>
                </Link>
              </div>
            )}

            {/* VIP Patron Membership & Benefits Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 rounded-3xl p-6 text-white border border-zinc-800 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                        👑
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                          Tier 1 VIP Member
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          Satvik Royal Patron
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      Active
                    </span>
                  </div>

                  {/* VIP Unlocked Perks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <div className="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-2.5">
                      <span className="text-base">🚚</span>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">Free Express Delivery</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">On all Satvik orders above $25</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-2.5">
                      <span className="text-base">🥤</span>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">Welcome Saffron Lassi</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Complimentary on all table bookings</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-2.5">
                      <span className="text-base">⚡</span>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">Priority Cooking Queue</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Orders dispatched 10 mins faster</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-2.5">
                      <span className="text-base">🪙</span>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">2x SuperCoin Multiplier</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Earn double rewards on combos & thalis</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span>Lifetime Satvik Savings: <strong className="text-emerald-400 font-bold">$42.80</strong></span>
                  <Link href="/menu" className="text-amber-400 hover:underline font-bold">
                    Browse Menu &rarr;
                  </Link>
                </div>
              </div>

              {/* SuperCoins Quick Widget */}
              <div className="bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    Rewards Balance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black">{superCoinsBalance}</h3>
                    <span className="text-sm font-bold text-amber-100">Coins</span>
                  </div>
                  <p className="text-xs text-rose-100 leading-relaxed">
                    Use coins for instant discounts on doorstep deliveries or table reservations.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("supercoins")}
                  className="w-full py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Open Rewards Store</span>
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Hub (4 Tiles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/orders"
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    🍲
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-black">
                    {ordersHistory.length} Total
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 group-hover:text-rose-600 transition-colors">
                    Food &amp; Dining Orders
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Live GPS tracking, invoice downloads &amp; 1-tap reordering.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/reserve"
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    🍽️
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-black">
                    {reservationsHistory.length} Bookings
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 group-hover:text-rose-600 transition-colors">
                    Table Reservations
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Book fine-dining courtyard tables, VIP lounges &amp; party slots.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span>Reserve a Table</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button
                onClick={() => setActiveTab("addresses")}
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-3 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    📍
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-black">
                    {savedAddresses.length} Saved
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 group-hover:text-rose-600 transition-colors">
                    Delivery Addresses
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Manage home, office, and doorstep delivery destinations.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span>Manage Addresses</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setActiveTab("favorites")}
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-3 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-pink-100 text-rose-600 flex items-center justify-center font-bold">
                    ❤️
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-black">
                    {favoritedDishes.length} Dishes
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 group-hover:text-rose-600 transition-colors">
                    Saved Favorites
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Your bookmarked pure veg curries, dosas &amp; desserts.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span>View Favorites</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Exclusive VIP Coupons Carousel / Grid */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm sm:text-base font-black text-zinc-900">
                    VIP Patron Vouchers &amp; Coupons
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-semibold">1-Click Copy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    code: "PUREVEG50",
                    title: "50% OFF up to $10",
                    desc: "Valid on all Sattvic Paneer & Thali combos",
                    color: "border-rose-200 bg-rose-50/60 text-rose-950",
                  },
                  {
                    code: "FEAST20",
                    title: "Flat 20% OFF",
                    desc: "Applicable on orders above $35",
                    color: "border-emerald-200 bg-emerald-50/60 text-emerald-950",
                  },
                  {
                    code: "FREESHIP",
                    title: "Free Express Delivery",
                    desc: "No minimum spend required for VIP members",
                    color: "border-amber-200 bg-amber-50/60 text-amber-950",
                  },
                ].map((c) => (
                  <div
                    key={c.code}
                    className={`p-4 rounded-2xl border ${c.color} flex flex-col justify-between space-y-2 relative`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-zinc-900 bg-white px-2 py-0.5 rounded-lg border border-zinc-200">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopyCoupon(c.code)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          {copiedCoupon === c.code ? "Copied! ✓" : "Copy"}
                        </button>
                      </div>
                      <p className="font-black text-xs text-zinc-900 mt-2">{c.title}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 100% Satvik Pure Veg Certification */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
              <span className="text-2xl leading-none">🌿</span>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                  Certified 100% Pure Vegetarian &amp; Sattvic Promise
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your profile is configured with dedicated Sattvic Kitchen assurance. Every order is prepared in an exclusive pure-veg commercial kitchen with zero non-veg contact, sealed thermal bags, and unadulterated cold-pressed oils.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 2: SAVED ADDRESSES
        ========================================================================= */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                Delivery Addresses ({savedAddresses.length})
              </h3>
              <button
                onClick={handleOpenNewAddress}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-sm shadow-rose-600/20 hover:bg-rose-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase">
                        <MapPin className="w-3 h-3 text-rose-600" />
                        <span>{addr.tag}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                          title="Edit address"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-600 space-y-1">
                      <p className="font-black text-sm text-zinc-900">{addr.recipientName}</p>
                      <p className="leading-relaxed">{addr.addressLine}</p>
                      {addr.landmark && (
                        <p className="text-[11px] text-zinc-400 italic">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-[11px] font-mono text-zinc-500">{addr.city}, {addr.zipCode}</p>
                      <p className="text-[11px] text-zinc-500">Contact: {addr.phone}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                    <span>Active Delivery Zone (25-35 min ETA)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 3: SUPERCOINS & REWARDS
        ========================================================================= */}
        {activeTab === "supercoins" && (
          <div className="space-y-6">
            {/* Rewards Card */}
            <div className="bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                  🪙
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                    Available Balance
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black">
                    {superCoinsBalance} <span className="text-lg font-bold">Coins</span>
                  </h3>
                  <p className="text-xs text-rose-100 mt-0.5">
                    Worth <span className="font-black text-white">$2.50</span> instant discount on checkout
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Link
                  href="/menu"
                  className="px-5 py-2.5 rounded-2xl bg-white text-rose-600 font-bold text-xs shadow-md hover:bg-rose-50 transition-all"
                >
                  Earn More on Next Order
                </Link>
              </div>
            </div>

            {/* SuperCoins Activity Ledger */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                SuperCoins History
              </h3>

              <div className="divide-y divide-zinc-100 text-xs">
                {[
                  { desc: "Earned on Order #ORD-98421", date: "12 Sep 2026", coins: "+45 Coins", type: "credit" },
                  { desc: "Welcome Bonus on Signup", date: "15 Jan 2025", coins: "+150 Coins", type: "credit" },
                  { desc: "Earned on Order #ORD-87319", date: "08 Sep 2026", coins: "+55 Coins", type: "credit" },
                ].map((log, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-900">{log.desc}</p>
                      <p className="text-[11px] text-zinc-400">{log.date}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                      {log.coins}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 4: SAVED FAVORITES
        ========================================================================= */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
              Your Favorited Dishes ({favoritedDishes.length})
            </h3>

            {favoritedDishes.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center space-y-3">
                <Heart className="w-12 h-12 text-zinc-300 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">No favorite dishes saved yet.</p>
                <p className="text-xs text-zinc-400">
                  Click the heart icon on any dish across the menu to save it here for instant ordering.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  <span>Explore Menu</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favoritedDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="relative h-40 bg-zinc-100">
                      <img
                        src={dish.image}
                        alt={dish.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {dish.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-rose-600 font-mono">
                          ${dish.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            addToCart(dish, 1);
                            showToast(`Added ${dish.title} to cart!`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          + Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 5: DIETARY & SETTINGS
        ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Personal Details Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-900">
                    VIP Patron Profile Information
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Your personal details used for food deliveries and dining table reservations.
                  </p>
                </div>
                <button
                  onClick={handleOpenEditProfile}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    <span>Full Name</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900">{userProfile.name}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mobile Number</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900">{userProfile.mobile || userProfile.phone}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-rose-600" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900 truncate">{userProfile.email}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-rose-600" />
                    <span>Gender</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900">{userProfile.gender || "Not specified"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1 sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <Gift className="w-3.5 h-3.5 text-rose-600" />
                    <span>Anniversary Date</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-zinc-900">{formatAnniversary(userProfile.anniversary)}</p>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      🎉 Special Treat Eligible
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-500">
                Dietary &amp; Flavor Preferences
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      Jain Vegetarian Mode (No Onion / Garlic)
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Auto-filter dishes prepared strictly without root vegetables.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="w-4 h-4 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      Default Spice Tolerance
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Our chefs will customize default gravies to this heat level.
                    </p>
                  </div>
                  <select className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-zinc-300">
                    <option>Mild 🌶️</option>
                    <option selected>Medium 🌶️🌶️</option>
                    <option>Hot &amp; Fiery 🔥</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      WhatsApp Live Order Updates
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Receive live kitchen dispatch and rider tracking via WhatsApp.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 accent-rose-600"
                  />
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-900">Sign Out of Account</p>
                <p className="text-[11px] text-red-700">You will need to sign in again to access saved items.</p>
              </div>
              <button
                onClick={() => showToast("Signed out of session.")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">Edit Profile</h3>
                  <p className="text-[11px] text-zinc-500">Update your personal & dining preferences</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>Mobile Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-600" />
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-rose-600" />
                  <span>Gender</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "Male", label: "Male", icon: "👨" },
                    { id: "Female", label: "Female", icon: "👩" },
                    { id: "Other", label: "Other", icon: "✨" },
                    { id: "Prefer not to say", label: "Private", icon: "🔒" },
                  ].map((g) => {
                    const isSelected = profileForm.gender === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, gender: g.id })}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-rose-50"
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anniversary Date */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-600" />
                  <span>Anniversary Date</span>
                </label>
                <input
                  type="date"
                  value={profileForm.anniversary}
                  onChange={(e) => setProfileForm({ ...profileForm, anniversary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <p className="text-[10px] text-rose-700 mt-1.5 flex items-center gap-1 font-medium bg-rose-50/80 p-2 rounded-lg border border-rose-100">
                  <span>🎉</span>
                  <span>We offer complimentary chef treats & table surprise on your anniversary!</span>
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-base font-black text-zinc-900">
                {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">Tag:</label>
                <div className="flex gap-2">
                  {["Home", "Office", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddrForm({ ...addrForm, tag })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        addrForm.tag === tag
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
                  Recipient Name:
                </label>
                <input
                  type="text"
                  required
                  value={addrForm.recipientName}
                  onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Address Line:
                </label>
                <textarea
                  required
                  rows={2}
                  value={addrForm.addressLine}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT / INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  🧾
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">
                    Official Tax Invoice
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Order #{selectedInvoiceOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Date &amp; Time:</span>
                <span className="font-bold text-zinc-900">{selectedInvoiceOrder.date}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Payment Mode:</span>
                <span className="font-bold text-zinc-900">{selectedInvoiceOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Billed To:</span>
                <span className="font-bold text-zinc-900">{userProfile.name}</span>
              </div>

              <div className="pt-2 border-t border-zinc-100 divide-y divide-zinc-100">
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>
                      {item.quantity}x {item.title}
                    </span>
                    <span className="font-mono font-bold text-zinc-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1 font-mono text-zinc-600">
                <div className="flex justify-between">
                  <span>Item Total:</span>
                  <span>${selectedInvoiceOrder.itemTotal.toFixed(2)}</span>
                </div>
                {selectedInvoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${selectedInvoiceOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span>${selectedInvoiceOrder.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-zinc-900 pt-1 border-t border-zinc-200">
                  <span>Total Paid:</span>
                  <span className="text-rose-600">${selectedInvoiceOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => {
                  showToast("Invoice downloaded to device!");
                  setSelectedInvoiceOrder(null);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
