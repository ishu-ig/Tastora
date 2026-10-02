"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getMaincategory } from "@/Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "@/Redux/ActionCreators/SubcategoryActionCreators";
import {
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Utensils,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

/* ============================================================================
   THEME PRESETS
   Cycles dynamically through 8 vibrant color palettes for each category
============================================================================ */
const THEME_PRESETS = [
  {
    accentColor: "from-rose-600 via-red-500 to-amber-500",
    glowColor: "shadow-rose-500/30",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconActiveBg: "bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white",
    iconInactiveBg: "bg-gradient-to-b from-rose-50/80 via-white to-rose-100/40 border-rose-200/80 text-rose-950 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/20",
    ambientGlow: "from-rose-500/30 to-amber-500/20",
    activeRing: "border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
    textColor: "text-rose-600",
    hoverTextColor: "group-hover:text-rose-600",
    dotColor: "bg-rose-500",
    subChipBg: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300",
  },
  {
    accentColor: "from-amber-500 via-orange-500 to-yellow-500",
    glowColor: "shadow-amber-500/30",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconActiveBg: "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 text-white",
    iconInactiveBg: "bg-gradient-to-b from-amber-50/80 via-white to-amber-100/40 border-amber-200/80 text-amber-950 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20",
    ambientGlow: "from-amber-500/30 to-orange-500/20",
    activeRing: "border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-amber-50 text-amber-800 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500",
    textColor: "text-amber-600",
    hoverTextColor: "group-hover:text-amber-600",
    dotColor: "bg-amber-500",
    subChipBg: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300",
  },
  {
    accentColor: "from-emerald-500 via-teal-500 to-green-600",
    glowColor: "shadow-emerald-500/30",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconActiveBg: "bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 text-white",
    iconInactiveBg: "bg-gradient-to-b from-emerald-50/80 via-white to-emerald-100/40 border-emerald-200/80 text-emerald-950 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20",
    ambientGlow: "from-emerald-500/30 to-teal-500/20",
    activeRing: "border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-emerald-50 text-emerald-800 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    textColor: "text-emerald-600",
    hoverTextColor: "group-hover:text-emerald-600",
    dotColor: "bg-emerald-500",
    subChipBg: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300",
  },
  {
    accentColor: "from-purple-600 via-fuchsia-500 to-pink-500",
    glowColor: "shadow-purple-500/30",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    iconActiveBg: "bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 text-white",
    iconInactiveBg: "bg-gradient-to-b from-purple-50/80 via-white to-purple-100/40 border-purple-200/80 text-purple-950 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20",
    ambientGlow: "from-purple-500/30 to-fuchsia-500/20",
    activeRing: "border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
    textColor: "text-purple-600",
    hoverTextColor: "group-hover:text-purple-600",
    dotColor: "bg-purple-500",
    subChipBg: "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300",
  },
  {
    accentColor: "from-orange-500 via-amber-500 to-red-500",
    glowColor: "shadow-orange-500/30",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    iconActiveBg: "bg-gradient-to-tr from-orange-500 via-amber-500 to-red-500 text-white",
    iconInactiveBg: "bg-gradient-to-b from-orange-50/80 via-white to-orange-100/40 border-orange-200/80 text-orange-950 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20",
    ambientGlow: "from-orange-500/30 to-amber-500/20",
    activeRing: "border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-orange-50 text-orange-700 border-orange-200 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500",
    textColor: "text-orange-600",
    hoverTextColor: "group-hover:text-orange-600",
    dotColor: "bg-orange-500",
    subChipBg: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300",
  },
  {
    accentColor: "from-indigo-600 via-blue-600 to-cyan-500",
    glowColor: "shadow-indigo-500/30",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconActiveBg: "bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white",
    iconInactiveBg: "bg-gradient-to-b from-indigo-50/80 via-white to-indigo-100/40 border-indigo-200/80 text-indigo-950 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20",
    ambientGlow: "from-indigo-500/30 to-blue-500/20",
    activeRing: "border-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600",
    textColor: "text-indigo-600",
    hoverTextColor: "group-hover:text-indigo-600",
    dotColor: "bg-indigo-500",
    subChipBg: "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300",
  },
  {
    accentColor: "from-sky-500 via-cyan-500 to-blue-600",
    glowColor: "shadow-sky-500/30",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    iconActiveBg: "bg-gradient-to-tr from-sky-500 via-cyan-500 to-blue-600 text-white",
    iconInactiveBg: "bg-gradient-to-b from-sky-50/80 via-white to-sky-100/40 border-sky-200/80 text-sky-950 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20",
    ambientGlow: "from-sky-500/30 to-blue-500/20",
    activeRing: "border-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-sky-50 text-sky-700 border-sky-200 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500",
    textColor: "text-sky-600",
    hoverTextColor: "group-hover:text-sky-600",
    dotColor: "bg-sky-500",
    subChipBg: "hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300",
  },
  {
    accentColor: "from-pink-500 via-rose-500 to-purple-600",
    glowColor: "shadow-pink-500/30",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
    iconActiveBg: "bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white",
    iconInactiveBg: "bg-gradient-to-b from-pink-50/80 via-white to-pink-100/40 border-pink-200/80 text-pink-950 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20",
    ambientGlow: "from-pink-500/30 to-purple-500/20",
    activeRing: "border-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.45)]",
    badgeActive: "bg-white/25 text-white backdrop-blur-md border-white/40 shadow-xs",
    badgeInactive: "bg-pink-50 text-pink-700 border-pink-200 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500",
    textColor: "text-pink-600",
    hoverTextColor: "group-hover:text-pink-600",
    dotColor: "bg-pink-500",
    subChipBg: "hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300",
  },
];

const CATEGORY_META = {
  "Fast Food": { emoji: "🍔", pill: "🔥 Hot", tagline: "Gourmet Burgers, Sourdough Pizzas & Crispy Sides" },
  "South Indian": { emoji: "🥞", pill: "✨ Fresh", tagline: "Crispy Golden Dosas, Fluffy Idlis & Medu Vadas" },
  "North Indian": { emoji: "🍛", pill: "👑 Royal", tagline: "Royal Paneer Gravies, Dal Makhani & Tandoori Breads" },
  "Chinese & Asian": { emoji: "🥢", pill: "🍜 Wok", tagline: "Fiery Wok Hakka Noodles, Steamed Momos & Manchurian" },
  "Italian & Continental": { emoji: "🍕", pill: "🍕 Artisan", tagline: "Woodfired Gourmet Pizzas, Creamy Pastas & Garlic Breads" },
  "Biryani & Rice Bowls": { emoji: "🍚", pill: "🍲 Dum Saffron", tagline: "Hyderabadi Dum Biryanis, Paneer Pulao & Tikkas" },
  "Desserts & Bakery": { emoji: "🍰", pill: "🍯 Sweet", tagline: "Belgian Chocolate Truffles, Warm Gulab Jamun & Waffles" },
  "Beverages & Shakes": { emoji: "🥤", pill: "🧊 Chill", tagline: "Thick Shakes, Cold Brew Frappes & Fresh Mocktails" },
  "Street Food & Chaat": { emoji: "🫓", pill: "🌶️ Zesty", tagline: "Mumbai Pav Bhaji, Delhi Gol Gappe & Kathi Rolls" },
  "Healthy & Diet Food": { emoji: "🥗", pill: "🥑 Fit & Fresh", tagline: "Superfood Acai Bowls, Greek Salads & Protein Platters" },
};

const FALLBACK_PILL_BADGES = ["🔥 Hot", "👑 Royal", "✨ Fresh", "🍜 Wok", "🌶️ Zesty", "🍱 Feast", "🧊 Chill", "🍯 Sweet"];

export function Category() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────────────────────
  const rawMainCategories = useSelector((state) => state.MaincategoryStateData || []);
  const rawSubCategories = useSelector((state) => state.SubcategoryStateData || []);

  useEffect(() => {
    dispatch(getMaincategory());
    dispatch(getSubcategory());
  }, [dispatch]);

  // ── Map Backend Categories with Subcategories ──────────────────────────────
  const categoryData = useMemo(() => {
    const mains = Array.isArray(rawMainCategories)
      ? rawMainCategories.filter((m) => m.active !== false)
      : [];
    const subs = Array.isArray(rawSubCategories)
      ? rawSubCategories.filter((s) => s.active !== false)
      : [];

    return mains.map((main, index) => {
      const mainId = main._id;
      const meta = CATEGORY_META[main.name] || {};

      const childSubs = subs.filter((sub) => {
        const parentId = sub.maincategory?._id || sub.maincategory;
        return String(parentId) === String(mainId);
      });

      const theme = THEME_PRESETS[index % THEME_PRESETS.length];

      return {
        id: mainId,
        _id: mainId,
        name: main.name,
        pic: main.pic,
        tagline: meta.tagline || `${childSubs.length} delicious specialties prepared fresh`,
        iconEmoji: meta.emoji || "🍽️",
        pillBadge: meta.pill || FALLBACK_PILL_BADGES[index % FALLBACK_PILL_BADGES.length],
        theme,
        subcategories: childSubs.map((sub) => ({
          id: sub._id,
          _id: sub._id,
          name: sub.name,
          pic: sub.pic || main.pic,
          iconEmoji: "🍴",
        })),
      };
    });
  }, [rawMainCategories, rawSubCategories]);

  // Track hovered category for subcategory preview & popover
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const mainPrevRef = useRef(null);
  const mainNextRef = useRef(null);

  // Active or hovered category for dynamic ambient glow & preview
  const currentCategory = useMemo(() => {
    if (hoveredCatId) {
      const found = categoryData.find((c) => c.id === hoveredCatId);
      if (found) return found;
    }
    return categoryData[0] || null;
  }, [hoveredCatId, categoryData]);

  const handleMouseEnter = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCatId(catId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCatId(null);
    }, 250);
  };

  // On click on main category: redirect to /menu with selected maincategory
  const handleCategoryClick = (mainCat) => {
    router.push(`/menu?category=${encodeURIComponent(mainCat.name)}`);
  };

  // Loading skeleton while fetching categories from backend
  if (!categoryData.length) {
    return (
      <section id="category" className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-6 w-48 bg-zinc-200/80 rounded-full mx-auto animate-pulse" />
          <div className="flex justify-center gap-4 py-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-zinc-200/70 animate-pulse" />
                <div className="w-16 h-3 bg-zinc-200/70 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="category"
      className="py-12 sm:py-16 relative overflow-visible text-zinc-900 transition-colors duration-700 bg-gradient-to-b from-white via-zinc-50/40 to-white"
    >
      {/* Dynamic Ambient Atmospheric Glows */}
      {currentCategory && (
        <>
          <div
            className={`absolute top-1/4 left-1/6 w-[650px] h-[400px] rounded-full blur-[130px] pointer-events-none -z-10 transition-all duration-700 opacity-25 bg-gradient-to-tr ${currentCategory.theme.ambientGlow}`}
          />
          <div
            className={`absolute bottom-10 right-1/6 w-[550px] h-[380px] rounded-full blur-[130px] pointer-events-none -z-10 transition-all duration-700 opacity-20 bg-gradient-to-bl ${currentCategory.theme.ambientGlow}`}
          />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-7 sm:space-y-8">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-zinc-100/90 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Gourmet Cuisine Explorer</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
              Explore By{" "}
              <span className={`bg-gradient-to-r ${(currentCategory || categoryData[0]).theme.accentColor} bg-clip-text text-transparent transition-all duration-500`}>
                Cuisine &amp; Delicacies
              </span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-medium max-w-xl">
              Hover over any category to view its subcategories, or click to explore the full menu.
            </p>
          </div>

          {/* Navigation Arrows for Categories Swiper */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              ref={mainPrevRef}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-zinc-900 text-zinc-700 hover:text-white border border-zinc-200 shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-25 cursor-pointer"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              ref={mainNextRef}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-zinc-900 text-zinc-700 hover:text-white border border-zinc-200 shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-25 cursor-pointer"
              aria-label="Next categories"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CATEGORIES CAROUSEL WITH SUB-CATEGORIES ON HOVER
        ========================================================================= */}
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Categories
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-zinc-50 text-zinc-700 border-zinc-200">
                Click to Open Menu
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 hidden sm:inline">
              {categoryData.length} Signature Worlds • Hover to preview varieties
            </span>
          </div>

          {/* Swiper Slider with Popovers on Hover */}
          <div className="py-2 !overflow-visible">
            <Swiper
              modules={[FreeMode, Navigation]}
              freeMode={{ enabled: true, momentum: true, momentumRatio: 0.8 }}
              slidesPerView={"auto"}
              spaceBetween={16}
              breakpoints={{
                640: { spaceBetween: 20 },
                1024: { spaceBetween: 24 },
              }}
              navigation={{
                prevEl: mainPrevRef.current,
                nextEl: mainNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = mainPrevRef.current;
                swiper.params.navigation.nextEl = mainNextRef.current;
              }}
              className="!overflow-visible py-4 w-full"
            >
              {categoryData.map((mainCat) => {
                const isHovered = hoveredCatId === mainCat.id;

                return (
                  <SwiperSlide key={mainCat.id} className="!w-auto !overflow-visible">
                    <div
                      className="relative group select-none flex flex-col items-center"
                      onMouseEnter={() => handleMouseEnter(mainCat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Main Category Clickable Card / Bubble */}
                      <button
                        onClick={() => handleCategoryClick(mainCat)}
                        className="flex flex-col items-center cursor-pointer focus:outline-none transition-all duration-300 hover:-translate-y-2 active:scale-95 text-center px-1"
                        aria-label={`Explore ${mainCat.name} menu`}
                      >
                        {/* Outer Frame with Ambient Halo & Badge */}
                        <div className="relative p-1">
                          {/* Mini Pill Badge */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border shadow-xs transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1 ${
                                isHovered
                                  ? mainCat.theme.badgeActive
                                  : mainCat.theme.badgeInactive
                              }`}
                            >
                              {mainCat.pillBadge}
                            </span>
                          </div>

                          {/* Ambient Glow Aura */}
                          <div
                            className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 pointer-events-none bg-gradient-to-tr ${
                              mainCat.theme.ambientGlow
                            } ${
                              isHovered
                                ? "opacity-95 scale-115"
                                : "opacity-0 group-hover:opacity-85 group-hover:scale-110"
                            }`}
                          />

                          {/* Glowing Ring on Hover */}
                          <div
                            className={`absolute -inset-1.5 rounded-full border-2 ${
                              mainCat.theme.activeRing
                            } transition-opacity duration-300 pointer-events-none ${
                              isHovered ? "opacity-100 animate-pulse" : "opacity-0"
                            }`}
                          />

                          {/* 3D Circular Spherical Bubble Body */}
                          <div
                            className={`w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
                              isHovered
                                ? `${mainCat.theme.iconActiveBg} shadow-2xl scale-105`
                                : `${mainCat.theme.iconInactiveBg} border shadow-xs`
                            }`}
                          >
                            {/* Glossy Specular Arc Highlight */}
                            <div className="absolute top-1 inset-x-2.5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-white/75 via-white/25 to-transparent pointer-events-none z-20" />

                            {/* Subtle Radial Shading */}
                            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none z-10" />

                            {/* Image or Icon Display */}
                            {mainCat.pic ? (
                              <img
                                src={mainCat.pic}
                                alt={mainCat.name}
                                className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                              />
                            ) : (
                              <div className="relative z-10 text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-120 group-hover:-rotate-6">
                                <span className={isHovered ? "drop-shadow-md" : "drop-shadow-xs"}>
                                  {mainCat.iconEmoji}
                                </span>
                              </div>
                            )}

                            {/* Center Spark on Hover */}
                            {isHovered && (
                              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none z-20" />
                            )}
                          </div>
                        </div>

                        {/* Label Below Category */}
                        <div className="mt-2.5 flex flex-col items-center">
                          <span
                            className={`text-xs sm:text-sm font-black tracking-tight leading-tight transition-colors duration-200 text-center max-w-[95px] truncate ${
                              isHovered
                                ? `${mainCat.theme.textColor} font-black`
                                : `text-zinc-700 ${mainCat.theme.hoverTextColor} font-bold`
                            }`}
                          >
                            {mainCat.name}
                          </span>

                          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                            {mainCat.subcategories.length} Varieties
                          </span>

                          {/* Indicator Capsule */}
                          <div
                            className={`h-1 rounded-full mt-1 transition-all duration-300 ${
                              isHovered
                                ? `w-6 bg-gradient-to-r ${mainCat.theme.accentColor} shadow-xs`
                                : "w-0 bg-transparent"
                            }`}
                          />
                        </div>
                      </button>

                      {/* =========================================================
                          HOVER SUBCATEGORY POPOVER CARD
                      ========================================================= */}
                      {isHovered && mainCat.subcategories.length > 0 && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-80 sm:w-96 lg:w-[420px] max-w-[90vw] bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-3xl p-4 shadow-2xl shadow-zinc-900/15 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
                          onMouseEnter={() => handleMouseEnter(mainCat.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {/* Triangle Arrow */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-zinc-200 rotate-45" />

                          {/* Popover Header */}
                          <div className="relative z-10 flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{mainCat.iconEmoji}</span>
                              <span className="text-xs font-black text-zinc-900 tracking-tight">
                                {mainCat.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                              {mainCat.subcategories.length} Subcategories
                            </span>
                          </div>

                          {/* Subcategories Horizontal Scroll Row (Image on Top, Name on Bottom) */}
                          <div className="relative z-10 flex items-start gap-3 sm:gap-4 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-zinc-200">
                            {mainCat.subcategories.map((sub) => {
                              const itemImage = sub.pic || mainCat.pic;
                              return (
                                <Link
                                  key={sub.id}
                                  href={`/menu?category=${encodeURIComponent(mainCat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                  className="group/sub flex flex-col items-center shrink-0 w-[68px] sm:w-[74px] text-center transition-transform hover:-translate-y-1 active:scale-95"
                                >
                                  {/* Image Bubble on Top */}
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-zinc-200/90 bg-zinc-100 shadow-2xs group-hover/sub:border-rose-400 group-hover/sub:shadow-md transition-all duration-300 flex items-center justify-center">
                                    {itemImage ? (
                                      <img
                                        src={itemImage}
                                        alt={sub.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/sub:scale-110"
                                      />
                                    ) : (
                                      <span className="text-2xl">{sub.iconEmoji || mainCat.iconEmoji}</span>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-300" />
                                  </div>

                                  {/* Subcategory Name on Bottom */}
                                  <span className="mt-2 text-[11px] font-bold text-zinc-700 leading-tight group-hover/sub:text-rose-600 line-clamp-2 max-w-[68px] sm:max-w-[74px] transition-colors">
                                    {sub.name}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Direct Redirect Explore Button on Bottom of All */}
                          <Link
                            href={`/menu?category=${encodeURIComponent(mainCat.name)}`}
                            className={`relative z-10 mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r ${mainCat.theme.accentColor} text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98] group/btn`}
                          >
                            <span>Explore All {mainCat.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        {/* =========================================================================
            DYNAMIC INTERACTIVE SUBCATEGORY PREVIEW CHIP BAR (Current / Hovered)
        ========================================================================= */}
        {currentCategory && currentCategory.subcategories.length > 0 && (
          <div className="pt-2 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-zinc-50 via-white to-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{currentCategory.iconEmoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-900 truncate">
                      {currentCategory.name} Varieties
                    </span>
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase border ${currentCategory.theme.badgeBg}`}>
                      {currentCategory.subcategories.length} Available
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium truncate">
                    {currentCategory.tagline}
                  </p>
                </div>
              </div>

              {/* Subcategories quick chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentCategory.subcategories.slice(0, 5).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/menu?category=${encodeURIComponent(currentCategory.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-bold text-zinc-700 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-2xs"
                  >
                    <span>{sub.name}</span>
                  </Link>
                ))}
                {currentCategory.subcategories.length > 5 && (
                  <Link
                    href={`/menu?category=${encodeURIComponent(currentCategory.name)}`}
                    className="text-[10px] font-black text-rose-600 hover:underline px-1"
                  >
                    +{currentCategory.subcategories.length - 5} more
                  </Link>
                )}
                <Link
                  href={`/menu?category=${encodeURIComponent(currentCategory.name)}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-rose-600 text-white text-[10px] font-black transition-colors ml-1 shadow-2xs shrink-0"
                >
                  <span>Go to Menu</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Category;
