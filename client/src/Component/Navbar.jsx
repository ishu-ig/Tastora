"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  ShoppingBag,
  ShoppingCart,
  Menu,
  X,
  Flame,
  User,
  ChevronDown,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  HelpCircle,
  Sparkles,
  Plus,
  Check,
  LogIn,
  UserPlus,
  Search,
  ArrowUpRight,
  TrendingUp,
  Coins,
  Gift,
  Zap,
  Crown,
  Home,
  Utensils,
  Percent,
  Calendar,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { AuthModal } from "./AuthModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axiosInstance";
import { TastoraLogo, TastoraIcon } from "./TastoraLogo";

// Searchable dishes catalog
const searchCatalog = [
  { id: "s-1", title: "Paneer Tikka", category: "North Indian", price: "$14.99", image: "/img/category/paneer-tikka.jpg", link: "#category", desc: "Charcoal grilled cottage cheese skewers" },
  { id: "s-2", title: "Masala Dosa", category: "South Indian", price: "$10.99", image: "/img/category/masala-dosa.jpg", link: "#category", desc: "Crispy golden crepe with potato masala & sambar" },
  { id: "s-3", title: "Shahi Veg Biryani", category: "Rice & Dum", price: "$12.99", image: "/img/category/veg-biryani.jpg", link: "#category", desc: "Fragrant basmati rice with royal saffron & spices" },
  { id: "s-4", title: "Chole Bhature", category: "Punjabi Special", price: "$11.99", image: "/img/category/chole-bhature.jpg", link: "#category", desc: "Golden puffed bhature with spicy dark chole" },
  { id: "s-5", title: "Dal Makhani", category: "Lentils", price: "$13.99", image: "/img/category/dal-makhani.jpg", link: "#category", desc: "12-hour slow simmered black lentils in butter" },
  { id: "s-6", title: "Classic Smash Burger", category: "Burgers", price: "$14.99", image: "/img/menu/1.jpg", link: "#menu", desc: "Double patty, cheddar & special sauce on brioche" },
  { id: "s-7", title: "Margherita Royale Pizza", category: "Pizza", price: "$19.99", image: "/img/menu/2.jpg", link: "#menu", desc: "San Marzano tomatoes, buffalo mozzarella & basil" },
  { id: "s-8", title: "Truffle Mushroom Pasta", category: "Pasta", price: "$16.99", image: "/img/menu/6.jpg", link: "#menu", desc: "Tagliatelle, wild mushrooms & shaved black truffle" },
  { id: "s-9", title: "Nutella Lava Cake", category: "Desserts", price: "$8.99", image: "/img/menu/5.jpg", link: "#menu", desc: "Molten chocolate cake with vanilla bean gelato" },
  { id: "s-10", title: "Royal Maharaja Thali", category: "Combos", price: "$19.99", image: "/img/category/royal-thali.jpg", link: "/combos", desc: "Grand feast thali with 8 multi-dish pairings" },
  { id: "s-11", title: "Mumbai Pav Bhaji", category: "Street Food", price: "$11.49", image: "/img/category/pav-bhaji.jpg", link: "#category", desc: "Butter loaded vegetable mash with toasted pavs" },
];

const trendingSearches = ["Paneer Tikka", "Thali Combo", "Biryani", "Burger", "Dosa", "Pizza"];

export function Navbar() {
  const pathname = usePathname();
  const isOrdersPage = pathname?.startsWith("/orders");

  const { totalCartCount, superCoinsBalance: contextCoins, userProfile } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [topAddressDropdownOpen, setTopAddressDropdownOpen] = useState(false);
  const cartCount = totalCartCount;

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // SuperCoins State (Flipkart Style)
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);
  const coinRef = useRef(null);

  // Auth Context Integration
  const { user: authUser, setUser: setAuthUser, checkAuth } = useAuth() || {};
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // "login" | "signup"

  // Active Authenticated User (null if not signed in)
  const currentUser = authUser
    ? {
        ...authUser,
        fullName: authUser.name || authUser.fullName || "Customer",
        name: authUser.name || authUser.fullName || "Customer",
        phone: authUser.phoneNo || authUser.phone || "",
        email: authUser.email || "",
        tier: authUser.tier || "VIP Patron",
        superCoins: authUser.superCoins ?? (contextCoins || 250),
      }
    : null;

  const coinsBalance = currentUser?.superCoins || contextCoins || 250;

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      if (setAuthUser) setAuthUser(null);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  // Customer Saved Addresses
  const savedAddresses = [
    {
      id: 1,
      tag: "Home",
      fullAddress: "42 Flavor Street, Apt 4B, Manhattan, NY",
      eta: "20-30 min",
    },
    {
      id: 2,
      tag: "Office",
      fullAddress: "750 7th Ave, Suite 1400, Times Square, NY",
      eta: "30-40 min",
    },
    {
      id: 3,
      tag: "Gym",
      fullAddress: "120 Broadway, Financial District, NY",
      eta: "35-45 min",
    },
  ];

  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0]);

  const profileRef = useRef(null);
  const addressRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on click outside & keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (addressRef.current && !addressRef.current.contains(event.target)) {
        setTopAddressDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (coinRef.current && !coinRef.current.contains(event.target)) {
        setCoinDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (!isOrdersPage && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered search results
  const filteredDishes = searchQuery.trim()
    ? searchCatalog.filter(
      (dish) =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : searchCatalog.slice(0, 4);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Combos", href: "/combos" },
    { name: "reserve table ", href: "/reserve" },
    { name: "About Us", href: "/#about" },
    // { name: "Special Deals", href: "/#special" },
    { name: "ContactUs", href: "/#contact-section" },
  ];

  const mobileNavItems = [
    { name: "Home", href: "/", icon: Home, badge: null },
    { name: "Explore Menu", href: "/menu", icon: Utensils, badge: "Hot" },
    { name: "Royal Combos & Thalis", href: "/combos", icon: Crown, badge: "Chef Special" },
    { name: "Reserve a Table", href: "/reserve", icon: Calendar, badge: "Instant" },
    { name: "Special Deals & Offers", href: "/#special", icon: Percent, badge: "Save 20%" },
    { name: "About Our Heritage", href: "/#about", icon: Sparkles, badge: null },
    { name: "Contact & Location", href: "/#contact-section", icon: Phone, badge: null },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* 1. MAIN NAVBAR (Clean, Airy, Luxurious Layout - Higher z-index for dropdowns) */}
      <div
        className={`w-full relative z-30 transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-rose-950/5 py-3 border-b border-rose-100/60"
          : "bg-white/90 backdrop-blur-sm py-3.5 border-b border-zinc-100/80"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* BRAND LOGO */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            >
              <TastoraLogo size={38} subtitle="Pure Gourmet Dining" />
            </Link>

            {/* RESPONSIVE NAVIGATION LINKS (Adaptive for Tablet & Desktop) */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-7 xl:gap-8">
              {/* Primary Links always visible on Tablet & Desktop */}
              <a
                href="/"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
              <a
                href="/menu"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group flex items-center gap-1"
              >
                <span>Menu</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[9px] font-extrabold hidden sm:inline-block">
                  Hot
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
              <a
                href="/combos"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group flex items-center gap-1"
              >
                <span>Combos</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold hidden xl:inline-block">
                  Feasts
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
              <a
                href="/reserve"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group"
              >
                Dinning
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>

              {/* Secondary links (Visible on large screens, or clean tablet spacing) */}
              {/* <a
                href="/#special"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group hidden lg:inline-block"
              >
                Special Deals
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a> */}
              <a
                href="/#about"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group hidden xl:inline-block"
              >
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
              <a
                href="/#contact-section"
                className="text-xs lg:text-sm font-bold text-zinc-700 hover:text-rose-600 transition-colors relative py-1 group hidden lg:inline-block"
              >
                ContactUs
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            </nav>

            {/* RIGHT SIDE ACTIONS (Coins + Cart + Profile) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* FLIPKART STYLE SUPERCOINS BADGE (On Right Side) */}
              <div className="relative" ref={coinRef}>
                <button
                  onClick={() => setCoinDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer group select-none ${coinDropdownOpen
                    ? "bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30"
                    : "bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50/60 hover:from-amber-100 hover:to-yellow-100 border-amber-300/80 hover:border-amber-400 shadow-2xs"
                    }`}
                  aria-label="SuperCoins Balance"
                  title="Tastora SuperCoins"
                >
                  {/* 3D Gold Coin Disc */}
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 text-zinc-950 font-black text-[10px] shadow-sm shadow-amber-500/50 group-hover:rotate-12 transition-transform">
                    <span className="leading-none drop-shadow-xs font-serif font-black">₹</span>
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping opacity-80"></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black bg-gradient-to-r from-amber-800 via-amber-700 to-orange-600 bg-clip-text text-transparent">
                      {coinsBalance}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 hidden lg:inline">
                      Coins
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3 h-3 text-amber-700/80 transition-transform duration-200 ${coinDropdownOpen ? "rotate-180 text-amber-800" : ""
                      }`}
                  />
                </button>

                {/* SuperCoins Interactive Dropdown Card */}
                {coinDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-76 sm:w-84 rounded-3xl bg-white/98 backdrop-blur-xl border border-amber-200/90 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Balance Card Banner */}
                    <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500 text-zinc-950 shadow-md overflow-hidden">
                      <div className="absolute -right-3 -bottom-3 w-20 h-20 rounded-full bg-white/20 blur-md pointer-events-none"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center font-serif font-black text-sm shadow-xs">
                            🪙
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-950/80">
                              SuperCoin Balance
                            </p>
                            <h3 className="text-xl font-black tracking-tight text-zinc-950 flex items-baseline gap-1">
                              {coinsBalance}
                              <span className="text-xs font-bold text-amber-950">Coins</span>
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-950/15 text-[10px] font-extrabold uppercase">
                            = ${(coinsBalance * 0.01).toFixed(2)} Value
                          </span>
                        </div>
                      </div>

                      {/* Tier progress */}
                      <div className="mt-3 pt-2 border-t border-amber-600/30">
                        <div className="flex justify-between text-[10px] font-bold text-amber-950 mb-1">
                          <span>Silver Foodie</span>
                          <span>50 Coins to Gold 👑</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-amber-950/20 overflow-hidden">
                          <div className="w-4/5 h-full rounded-full bg-zinc-950"></div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                        SuperCoin Benefits
                      </p>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/70 border border-amber-100/80 text-zinc-800">
                          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                          <p className="text-[11px] leading-snug">
                            <span className="font-bold">Use 100% on Orders:</span> 100 Coins = $1.00 Direct Discount at Checkout.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-orange-50/70 border border-orange-100/80 text-zinc-800">
                          <Gift className="w-4 h-4 text-orange-600 shrink-0" />
                          <p className="text-[11px] leading-snug">
                            <span className="font-bold">Earn 2x Coins:</span> Get 20 Coins on every $10 spent on Pure Veg Combos.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Link */}
                    <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-medium">Auto-applied at checkout</span>
                      <Link
                        href="/menu"
                        onClick={() => setCoinDropdownOpen(false)}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
                      >
                        <span>Use Coins on Menu</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full text-zinc-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group focus:outline-none"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown / Sign In Trigger */}
              <div className="relative" ref={profileRef}>
                {currentUser ? (
                  <button
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 focus:outline-none cursor-pointer ${profileDropdownOpen
                      ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
                      : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                      }`}
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-zinc-800">
                      {(currentUser.fullName || currentUser.name || "Customer").split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-rose-600" : ""
                        }`}
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setAuthModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && currentUser && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-500/20">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-zinc-900 truncate">
                            {currentUser.fullName || currentUser.name || "Customer"}
                          </p>
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                            VIP
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                          {currentUser.phone || currentUser.phoneNo || currentUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="px-2 py-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-zinc-400" />
                          <span>My Orders</span>
                        </div>
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-full">
                          Orders
                        </span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-zinc-400" />
                        <span>Favorites</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span>Delivery Addresses</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <span>Dietary &amp; Settings</span>
                      </Link>
                    </div>

                    {/* Support & Logout */}
                    <div className="pt-1.5 mt-1 border-t border-zinc-100 px-2 space-y-0.5">
                      <Link
                        href="/support"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-zinc-400" />
                        <span>Help &amp; Support</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE CONTROLS (Coins + Cart + Menu Toggle) */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Coins Trigger Button */}
              <button
                onClick={() => setCoinDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300/80 text-zinc-900 cursor-pointer shadow-2xs active:scale-95 transition-transform"
                aria-label="SuperCoins"
              >
                <span className="text-xs">🪙</span>
                <span className="text-xs font-black text-amber-900">{coinsBalance}</span>
              </button>

              {/* Shopping Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-zinc-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY SUB-NAVBAR (Address + Search + Quick Delivery Perks) */}
      <div className="w-full relative z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 py-2 sm:py-2.5 transition-all duration-300 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* MOBILE SUB-HEADER (Clean, Native App Layout) */}
          <div className="flex md:hidden flex-col gap-2">
            {/* Row 1: Delivery Location & Quick Offer */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1 min-w-0" ref={addressRef}>
                <button
                  onClick={() => setTopAddressDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-left w-full focus:outline-none group cursor-pointer"
                  aria-label="Change delivery address"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-[11px] text-zinc-500 font-medium shrink-0">Deliver to:</span>
                  <span className="text-xs font-black text-zinc-900 group-hover:text-rose-600 transition-colors flex items-center gap-0.5 truncate">
                    {selectedAddress.tag}
                    <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-rose-600 transition-transform ${topAddressDropdownOpen ? "rotate-180 text-rose-600" : ""}`} />
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                    ({selectedAddress.fullAddress})
                  </span>
                </button>

                {/* Mobile Address Dropdown */}
                {topAddressDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white/98 backdrop-blur-xl border border-zinc-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                      <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Select Delivery Address
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                        {selectedAddress.eta}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddress.id === addr.id;
                        return (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddress(addr);
                              setTopAddressDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected
                              ? "bg-rose-50 border border-rose-300 text-zinc-900 shadow-xs"
                              : "hover:bg-zinc-50 border border-transparent text-zinc-700"
                              }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900">{addr.tag}</span>
                                <span className="text-[10px] text-zinc-500">({addr.eta})</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate max-w-[190px]">
                                {addr.fullAddress}
                              </p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Free Delivery Badge */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 shrink-0 shadow-2xs">
                <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>Free Del. &gt; $30</span>
              </div>
            </div>

            {/* Row 2: Mobile Clean Search Bar */}
            {!isOrdersPage && (
              <div className="relative w-full" ref={searchRef}>
                <div className="relative flex items-center w-full">
                  <Search className="w-4 h-4 text-rose-500 absolute left-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search gourmet dishes, combos, pizzas..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder-zinc-400 border border-transparent focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP & TABLET SUB-HEADER (Spacious Adaptive Layout) */}
          <div className="hidden md:flex items-center justify-between gap-3 lg:gap-4">
            {/* Tablet & Desktop Address Selector */}
            <div className="relative shrink-0" ref={addressRef}>
              <button
                onClick={() => setTopAddressDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-300 text-zinc-800 transition-all shadow-2xs group cursor-pointer text-xs"
                aria-label="Change delivery address"
              >
                <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <MapPin className="w-3.5 h-3.5 lg:w-3.5 lg:h-3.5" />
                </span>
                <div className="text-left flex items-center gap-1 text-xs">
                  <span className="text-zinc-500 font-medium hidden lg:inline">Deliver to:</span>
                  <span className="font-extrabold text-zinc-900 group-hover:text-rose-600 transition-colors">
                    {selectedAddress.tag}
                  </span>
                  <span className="text-zinc-400 font-normal max-w-[90px] lg:max-w-[180px] xl:max-w-[240px] truncate hidden md:inline">
                    ({selectedAddress.fullAddress})
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 shrink-0">
                  {selectedAddress.eta}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-600 transition-transform duration-200 ${topAddressDropdownOpen ? "rotate-180 text-rose-600" : ""
                    }`}
                />
              </button>

              {/* Desktop Address Dropdown Modal */}
              {topAddressDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white/98 backdrop-blur-xl border border-zinc-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                      Select Delivery Address
                    </span>
                    <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                      {selectedAddress.eta}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddress.id === addr.id;
                      return (
                        <button
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddress(addr);
                            setTopAddressDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${isSelected
                            ? "bg-rose-50 border border-rose-300 text-zinc-900 shadow-xs"
                            : "hover:bg-zinc-50 border border-transparent text-zinc-700"
                            }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{addr.tag}</span>
                              <span className="text-[10px] font-medium text-zinc-500">({addr.eta})</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate max-w-[220px]">
                              {addr.fullAddress}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Center Search Bar */}
            {!isOrdersPage ? (
              <div className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-4xl relative" ref={searchRef}>
                <div className="relative flex items-center w-full">
                  <Search className="w-4 h-4 text-rose-500 absolute left-4 pointer-events-none transition-colors" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search dishes, royal thalis, burgers, pizzas, desserts..."
                    className="w-full pl-11 pr-16 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 placeholder-zinc-400 border border-zinc-200/90 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-2xs"
                  />
                  <div className="absolute right-3.5 flex items-center gap-1">
                    {searchQuery ? (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="p-1 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-100 rounded-md border border-zinc-200 select-none">
                        ⌘K
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Search Live Results Dropdown */}
                {searchOpen && (
                  <div className="absolute left-0 right-0 mt-2 max-h-[420px] overflow-y-auto rounded-2xl bg-white/98 backdrop-blur-xl border border-zinc-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                    {/* Popular Trending Tags when empty */}
                    {!searchQuery.trim() && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 px-1 mb-2">
                          <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            Trending Delicacies
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {trendingSearches.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                setSearchQuery(tag);
                                searchInputRef.current?.focus();
                              }}
                              className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 text-xs font-medium transition-colors cursor-pointer border border-zinc-200/60"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-100 mb-2">
                      <span className="text-xs font-bold text-zinc-700">
                        {searchQuery.trim()
                          ? `Results (${filteredDishes.length})`
                          : "Recommended for You"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Tastora Menu
                      </span>
                    </div>

                    {/* Results List */}
                    {filteredDishes.length > 0 ? (
                      <div className="space-y-1">
                        {filteredDishes.map((dish) => (
                          <a
                            key={dish.id}
                            href={dish.link}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-rose-50/80 transition-all duration-150 group border border-transparent hover:border-rose-200/60"
                          >
                            <img
                              src={dish.image}
                              alt={dish.title}
                              className="w-11 h-11 rounded-lg object-cover shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-rose-600 transition-colors truncate">
                                  {dish.title}
                                </h4>
                                <span className="text-xs font-black text-rose-600 shrink-0">
                                  {dish.price}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-bold">
                                  {dish.category}
                                </span>
                                <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                                  {dish.desc}
                                </p>
                              </div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 px-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-2">
                          <Search className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-zinc-800">
                          No dishes found for "{searchQuery}"
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Try searching for "paneer", "dosa", "biryani", or "combos"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Desktop Free Delivery Highlight */}
            <div className="flex items-center shrink-0 text-xs">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-bold shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>Free Delivery &gt; $30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 3. OFF-CANVAS MOBILE SIDEBAR DRAWER (Luxury Native App Experience) */}
      {/* BACKDROP OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* SIDEBAR PANEL */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[86vw] max-w-[380px] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out md:hidden border-l border-zinc-200/80 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-label="Mobile Navigation Sidebar"
      >
        {/* TOP BRAND HEADER */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <TastoraLogo size={34} subtitle="Gourmet Dining" />

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-full bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE DRAWER BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* USER PROFILE OR AUTH HERO CARD */}
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/90 via-amber-50/50 to-white border border-rose-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0 text-sm">
                    {(currentUser.fullName || currentUser.name) ? (currentUser.fullName || currentUser.name).charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-zinc-900 truncate">
                        {currentUser.fullName || currentUser.name || "Customer"}
                      </p>
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-extrabold shrink-0">
                        VIP Patron
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {currentUser.phone || currentUser.phoneNo || currentUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Coins & Status bar */}
              <div className="flex items-center justify-between pt-2 border-t border-rose-100/80 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{coinsBalance} SuperCoins</span>
                </div>
                <span className="text-[10px] text-rose-600 font-semibold">Tier 1 • Active</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white shadow-md border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Welcome to Tastora!</p>
                  <p className="text-[10px] text-zinc-400">Sign in for member offers & rewards</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold transition-all text-center shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all text-center cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE DELIVERY ADDRESS SUMMARY PILL */}
          <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delivering To</p>
                <p className="text-xs font-bold text-zinc-800 truncate">
                  {selectedAddress.tag} • <span className="font-normal text-zinc-500">{selectedAddress.eta}</span>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold shrink-0">
              Fast
            </span>
          </div>

          {/* QUICK SHORTCUTS GRID (4 Tiles) */}
          <div className="grid grid-cols-4 gap-2">
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 transition-all text-[11px] font-bold text-zinc-800 gap-1 text-center"
            >
              <Package className="w-4 h-4 text-rose-500" />
              <span>Orders</span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100/70 border border-pink-100 transition-all text-[11px] font-bold text-zinc-800 gap-1 text-center"
            >
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Favorites</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTopAddressDropdownOpen(true);
              }}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 transition-all text-[11px] font-bold text-zinc-800 gap-1 text-center cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Addresses</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCoinDropdownOpen(true);
              }}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-yellow-50/60 hover:bg-yellow-100/70 border border-yellow-100 transition-all text-[11px] font-bold text-zinc-800 gap-1 text-center cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Coins</span>
            </button>
          </div>

          {/* PRIMARY NAVIGATION LINKS */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-1.5">
              Explore &amp; Discover
            </p>
            {mobileNavItems.map((item) => {
              const IconComp = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-zinc-700 font-semibold hover:bg-rose-50 hover:text-rose-600 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-rose-100 group-hover:text-rose-600 flex items-center justify-center transition-colors">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-extrabold">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* 100% PURE VEG PROMISE CARD */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5">
            <span className="text-base leading-none">🌿</span>
            <div>
              <p className="text-[11px] font-extrabold text-emerald-900">100% Gourmet Quality Assurance</p>
              <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                Artisan recipes &amp; fresh premium farm ingredients every day.
              </p>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOOTER (Sticky Action Bar) */}
        <div className="p-4 border-t border-zinc-100 bg-white space-y-2.5">
          <a
            href="tel:+18001234567"
            className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-zinc-600 hover:text-rose-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-500" />
            <span>Need Help? Call: +1 (800) 123-4567</span>
          </a>

          <a
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-98 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Tastora Menu</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </aside>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          if (user) {
            if (setAuthUser) setAuthUser(user);
            if (checkAuth) checkAuth();
          }
          setProfileDropdownOpen(false);
        }}
      />
    </header>
  );
}

export default Navbar;
