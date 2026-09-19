"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Zap,
  ShoppingBag,
  Clock,
  Sparkles,
  Flame,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Gift,
  Tag,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const multipleOffers = [
  {
    id: "offer-1",
    badge: "👑 Royal Special Deal",
    badgeColor: "from-rose-600 to-amber-500",
    title: "Grand Maharaja Thali Feast",
    discountTag: "FLAT 40% OFF",
    highlight: "40% OFF",
    description: "Paneer Lababdar, Dal Makhani, 2 Butter Naans, Saffron Biryani, Gulab Jamun & Sweet Lassi.",
    originalPrice: "$29.99",
    offerPrice: "$17.99",
    saveAmount: "SAVE $12.00",
    couponCode: "ROYAL40",
    image: "/img/category/royal-thali.jpg",
    cardTopTint: "from-rose-500/10 via-pink-500/5 to-transparent",
    accentBorder: "border-rose-200/90 hover:border-rose-400",
    glowBadge: "bg-rose-100 text-rose-900 border-rose-300",
    ctaLink: "/combos",
    ctaText: "Claim Thali Deal",
  },
  {
    id: "offer-2",
    badge: "⚡ Weekend Flash Combo",
    badgeColor: "from-rose-600 to-pink-500",
    title: "Double Smash Burger & Truffle Fries",
    discountTag: "30% OFF COMBO",
    highlight: "30% OFF",
    description: "Double crispy patty, aged cheddar, caramelized onions, truffle fries & vanilla malt shake.",
    originalPrice: "$24.99",
    offerPrice: "$17.49",
    saveAmount: "SAVE 30%",
    couponCode: "SMASH30",
    image: "/img/off-img.jpg",
    cardTopTint: "from-rose-500/10 via-amber-500/5 to-transparent",
    accentBorder: "border-rose-200/90 hover:border-rose-400",
    glowBadge: "bg-rose-100 text-rose-900 border-rose-300",
    ctaLink: "/menu",
    ctaText: "Claim Burger Deal",
  },
  {
    id: "offer-3",
    badge: "🥞 South Indian Fest",
    badgeColor: "from-amber-500 to-yellow-500",
    title: "Butter Masala Dosa Duo Feast",
    discountTag: "BUY 1 GET 1 FREE",
    highlight: "BOGO FREE",
    description: "2 Crispy Golden Masala Dosas, 2 Steamed Idlis, Medu Vada, Sambar & Trio of Chutneys.",
    originalPrice: "$21.99",
    offerPrice: "$12.99",
    saveAmount: "BOGO FREE",
    couponCode: "DOSAFEST",
    image: "/img/category/masala-dosa.jpg",
    cardTopTint: "from-amber-500/10 via-yellow-500/5 to-transparent",
    accentBorder: "border-amber-200/90 hover:border-amber-400",
    glowBadge: "bg-amber-100 text-amber-900 border-amber-300",
    ctaLink: "/combos",
    ctaText: "Claim BOGO Deal",
  },
  {
    id: "offer-4",
    badge: "🥢 Wok Indo-Chinese Fest",
    badgeColor: "from-rose-600 to-amber-500",
    title: "Fiery Chilli Paneer & Hakka Noodles",
    discountTag: "FLAT $8 OFF",
    highlight: "$8 OFF",
    description: "Smoky Veg Hakka Noodles, Fiery Chilli Paneer Gravy, 4 Crispy Spring Rolls & Schezwan Dip.",
    originalPrice: "$23.49",
    offerPrice: "$15.49",
    saveAmount: "SAVE $8.00",
    couponCode: "WOK8OFF",
    image: "/img/category/chinese-noodles.jpg",
    cardTopTint: "from-rose-500/10 via-amber-500/5 to-transparent",
    accentBorder: "border-rose-200/90 hover:border-rose-400",
    glowBadge: "bg-rose-100 text-rose-900 border-rose-300",
    ctaLink: "/combos",
    ctaText: "Claim Wok Platter",
  },
  {
    id: "offer-5",
    badge: "👨‍👩‍👧‍👦 Mega Family Feast",
    badgeColor: "from-pink-600 to-amber-500",
    title: "12-Item Ultimate Family Box",
    discountTag: "SAVE $15 FLAT",
    highlight: "35% OFF",
    description: "Paneer Butter Masala, Dal Makhani, 4 Garlic Naans, Veg Biryani, Raita & 4 Gulab Jamuns.",
    originalPrice: "$54.99",
    offerPrice: "$39.99",
    saveAmount: "SAVE $15.00",
    couponCode: "FAMILY35",
    image: "/img/category/chole-bhature.jpg",
    cardTopTint: "from-pink-500/10 via-rose-500/5 to-transparent",
    accentBorder: "border-pink-200/90 hover:border-rose-400",
    glowBadge: "bg-pink-100 text-pink-900 border-pink-300",
    ctaLink: "/combos",
    ctaText: "Claim Family Deal",
  },
  {
    id: "offer-6",
    badge: "🍯 Sweet Celebration",
    badgeColor: "from-rose-500 to-pink-500",
    title: "Free Dessert on Orders Over $25",
    discountTag: "COMPLIMENTARY",
    highlight: "FREE SWEET",
    description: "Get 2 warm Rose Gulab Jamuns or Saffron Kesar Rasmalai on any gourmet order above $25.",
    originalPrice: "$7.99",
    offerPrice: "$0.00",
    saveAmount: "FREE TREAT",
    couponCode: "SWEETFREE",
    image: "/img/category/gulab-jamun.jpg",
    cardTopTint: "from-pink-500/10 via-rose-500/5 to-transparent",
    accentBorder: "border-pink-200/90 hover:border-rose-400",
    glowBadge: "bg-rose-100 text-rose-900 border-rose-300",
    ctaLink: "/menu",
    ctaText: "Claim Free Sweet",
  },
];

export function Offers() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
  });

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Live countdown timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 45, seconds: 30 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (n) => String(n).padStart(2, "0");

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section id="special" className="py-10 sm:py-14 bg-gradient-to-b from-rose-50/40 via-amber-50/20 to-white text-zinc-900 relative overflow-hidden">
      {/* Warm Ambient Gradient Halos */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-amber-200/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-gradient-to-bl from-pink-200/20 to-rose-200/25 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {/* Section Header with Cohesive Theme Styling & Live Timer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-rose-200/70 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Exclusive Member Specials &amp; Vouchers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">
              Hot Deals &amp;{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                Special Offer Banners
              </span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-medium">
              Copy exclusive promo coupon codes to unlock instant savings on your favourite Tastora pure veg feasts
            </p>
          </div>

          {/* Right: Live Countdown Clock & Slider Navigation */}
          <div className="flex items-center gap-3.5 self-start md:self-end">
            {/* Live Countdown Badge */}
            <div className="flex items-center gap-2.5 bg-white border border-rose-200/90 px-3.5 py-2 rounded-2xl shadow-xs">
              <Clock className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Expires In</div>
                <div className="text-xs sm:text-sm font-mono font-black text-zinc-900 tracking-wide">
                  {formatNumber(timeLeft.hours)}h : {formatNumber(timeLeft.minutes)}m : {formatNumber(timeLeft.seconds)}s
                </div>
              </div>
            </div>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                ref={prevRef}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-rose-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-rose-600 flex items-center justify-center transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-30"
                aria-label="Previous offers"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                ref={nextRef}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-rose-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-rose-600 flex items-center justify-center transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-30"
                aria-label="Next offers"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MULTIPLE OFFER BANNERS SLIDER
        ========================================================================= */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-zinc-300 !w-2.5 !h-2.5 !transition-all !duration-300",
              bulletActiveClass: "swiper-pagination-bullet-active !bg-rose-600 !w-7 !rounded-full",
            }}
            slidesPerView={1}
            spaceBetween={18}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
            }}
            className="pb-12 !overflow-visible"
          >
            {multipleOffers.map((offer) => {
              const isCopied = copiedCode === offer.couponCode;

              return (
                <SwiperSlide key={offer.id} className="h-auto flex">
                  {/* Luxury Feast Pass Banner Card Container - Guaranteed Uniform Size */}
                  <div
                    className={`group relative w-full h-full bg-white rounded-3xl border ${offer.accentBorder} p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-xl hover:shadow-rose-600/10 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Top Aesthetic Tint Overlay */}
                    <div
                      className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${offer.cardTopTint} pointer-events-none`}
                    />

                    {/* Banner Main Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center relative z-10 flex-1">
                      {/* Left: Text, Tag, Coupon & Details */}
                      <div className="sm:col-span-7 flex flex-col justify-between space-y-2.5">
                        {/* Top Category Badge */}
                        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${offer.badgeColor} shadow-xs`}
                          >
                            {offer.badge}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${offer.glowBadge}`}>
                            <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                            <span>{offer.discountTag}</span>
                          </span>
                        </div>

                        {/* Banner Title - Locked Uniform Height */}
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-zinc-900 tracking-tight leading-snug group-hover:text-rose-600 transition-colors line-clamp-2 h-14 flex items-center">
                          {offer.title}
                        </h3>

                        {/* Banner Description - Locked Uniform Height */}
                        <p className="text-zinc-600 text-xs sm:text-[13px] line-clamp-2 leading-relaxed font-medium h-10 flex items-center">
                          {offer.description}
                        </p>

                        {/* Coupon Code Pill with 1-Click Copy */}
                        <div className="pt-1 flex items-center gap-2 min-h-[38px]">
                          <div
                            onClick={(e) => handleCopyCode(e, offer.couponCode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed transition-all cursor-pointer select-none ${
                              isCopied
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                                : "bg-rose-50/80 hover:bg-rose-100/90 border-rose-300 text-rose-900 hover:border-rose-500 shadow-2xs"
                            }`}
                            title="Click to copy coupon code"
                          >
                            <Ticket className="w-3.5 h-3.5 text-rose-600" />
                            <span className="font-mono font-black text-xs sm:text-sm tracking-wider">
                              {offer.couponCode}
                            </span>
                            {isCopied ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                <Check className="w-3 h-3 stroke-[3]" /> COPIED!
                              </span>
                            ) : (
                              <Copy className="w-3 h-3 text-rose-600 hover:text-rose-800" />
                            )}
                          </div>

                          <span className="text-[10px] text-zinc-400 hidden sm:inline-block font-medium">
                            Tap to copy
                          </span>
                        </div>
                      </div>

                      {/* Right: Banner Dish Image with Fixed Dimensions */}
                      <div className="sm:col-span-5 relative flex items-center justify-center">
                        <div className="relative w-full h-44 sm:h-48 lg:h-52 rounded-2xl overflow-hidden border border-zinc-200/90 shadow-md bg-zinc-100">
                          <img
                            src={offer.image}
                            alt={offer.title}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          {/* Authentic Veg Badge */}
                          <div
                            className="absolute top-2.5 left-2.5 w-4.5 h-4.5 rounded-md bg-white border border-emerald-600 flex items-center justify-center shadow-md p-0.5 z-10"
                            title="100% Pure Vegetarian"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                          </div>

                          {/* Floating Price Badge */}
                          <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white px-2.5 py-1.5 rounded-xl shadow-lg border border-white/20 text-right">
                            {offer.originalPrice && (
                              <div className="text-[10px] line-through text-white/80 font-semibold leading-none">
                                {offer.originalPrice}
                              </div>
                            )}
                            <div className="text-sm sm:text-base font-black tracking-tight leading-none mt-0.5">
                              {offer.offerPrice}
                            </div>
                          </div>

                          {/* Discount Ribbon Tag */}
                          <div className="absolute top-2.5 right-2.5 bg-amber-400 text-zinc-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md">
                            {offer.saveAmount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-4 mt-4 border-t border-rose-100 flex items-center justify-between gap-3 relative z-10">
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium">
                        <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Valid for online &amp; dining orders</span>
                      </div>

                      <Link
                        href={offer.ctaLink}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:shadow-rose-600/35 hover:scale-105 active:scale-95 transition-all group/btn"
                      >
                        <span>{offer.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Offers;
