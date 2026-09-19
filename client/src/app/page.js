"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Utensils,
  Play,
  Flame,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Marquee } from "../Component/Marquee";
import { Category } from "../Component/Category";
import { Menu } from "../Component/Menu";
import { Combos } from "../Component/Combos";
import { About } from "../Component/About";
import { Offers } from "../Component/offers";
import { Testimonial } from "../Component/Testimonial";
import { Contactus } from "../Component/ContactUs";

const heroSlides = [
  {
    id: "paneer-tikka",
    badge: "100% Pure Vegetarian Special",
    titlePrefix: "Savor Pure Flavors Of",
    titleHighlight: "Paneer Tikka",
    titleSuffix: "Charcoal Grilled & Fresh",
    description:
      "Tender cottage cheese cubes marinated in aromatic Indian spices and slow-roasted to smoky perfection in traditional clay tandoors.",
    image: "/img/category/paneer-tikka.jpg",
    offerBadge: "Flat 25% OFF Today",
    deliveryTime: "20-25 mins",
  },
  {
    id: "masala-dosa",
    badge: "Authentic South Indian Heritage",
    titlePrefix: "Golden Crispy",
    titleHighlight: "Masala Dosa",
    titleSuffix: "With Sambar & Chutneys",
    description:
      "Thin golden crepe fermented naturally, stuffed with spiced tempered potato mash, served alongside steaming sambar and fresh coconut dip.",
    image: "/img/category/masala-dosa.jpg",
    offerBadge: "Chef's Signature Pick",
    deliveryTime: "15-20 mins",
  },
  {
    id: "veg-biryani",
    badge: "Royal Hyderabadi Dum Style",
    titlePrefix: "Aromatic & Fluffy",
    titleHighlight: "Shahi Veg Biryani",
    titleSuffix: "Layered With Saffron & Herbs",
    description:
      "Fragrant long-grain aged Basmati rice layered with garden-fresh vegetables, caramelized onions, mint, and hand-ground royal spices.",
    image: "/img/category/veg-biryani.jpg",
    offerBadge: "Top Ordered Dish",
    deliveryTime: "25-30 mins",
  },
  {
    id: "chole-bhature",
    badge: "Authentic Punjabi Delicacy",
    titlePrefix: "Puffed Golden",
    titleHighlight: "Chole Bhature",
    titleSuffix: "Rich Spiced Chickpea Curry",
    description:
      "Fluffy, golden deep-fried bread paired with Amritsari dark spiced chole, pickled green chilies, and fresh crunchy onion rings.",
    image: "/img/category/chole-bhature.jpg",
    offerBadge: "Best Selling Combo",
    deliveryTime: "15-20 mins",
  },
  {
    id: "dal-makhani",
    badge: "Slow-Cooked 12+ Hours",
    titlePrefix: "Velvety & Smoky",
    titleHighlight: "Dal Makhani",
    titleSuffix: "Simmered In Pure Makhan",
    description:
      "Whole black lentils and kidney beans slow-simmered overnight with pure white butter, rich dairy cream, and aromatic garam masalas.",
    image: "/img/category/dal-makhani.jpg",
    offerBadge: "Customer Favorite",
    deliveryTime: "20-25 mins",
  },
];

export default function HomePage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate hero slides every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      {/* HERO SECTION - SLEEK, COMPACT & PROPORTIONATE CAROUSEL */}
      <section id="hero" className="relative pt-48 sm:pt-44 lg:pt-44 pb-6 sm:pb-10 lg:pb-14 overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[250px] sm:h-[350px] bg-gradient-to-tr from-rose-200/30 via-pink-100/20 to-amber-100/30 rounded-full blur-[70px] sm:blur-[90px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center">
            {/* Left Column: Minimal Dynamic Text */}
            <div className="lg:col-span-7 space-y-2.5 sm:space-y-4 text-center lg:text-left">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-[10px] sm:text-xs font-bold shadow-2xs">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <Star className="w-2 h-2 fill-white" />
                </div>
                <span>{heroSlides[currentSlide].badge}</span>
              </div>

              {/* Dynamic Main Headline */}
              <h1
                key={`headline-${currentSlide}`}
                className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 leading-snug sm:leading-[1.2] animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {heroSlides[currentSlide].titlePrefix}{" "}
                <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].titleHighlight}
                </span>{" "}
                <br className="hidden sm:inline" />
                <span className="text-zinc-800 font-extrabold text-base sm:text-3xl lg:text-4xl block sm:inline">
                  {heroSlides[currentSlide].titleSuffix}
                </span>
              </h1>

              {/* Dynamic Subtitle / Description - Hidden on small mobile to save space, visible on tablet+ */}
              <p
                key={`desc-${currentSlide}`}
                className="hidden sm:block text-zinc-600 text-xs sm:text-sm max-w-lg mx-auto lg:mx-0 leading-relaxed min-h-[40px] animate-in fade-in duration-300"
              >
                {heroSlides[currentSlide].description}
              </p>

              {/* Fixed Action Buttons */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-0.5">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2 sm:px-7 sm:py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                >
                  <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                  <span>Order Now</span>
                </a>

                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs hover:border-zinc-300 transition-all cursor-pointer"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>Watch Story</span>
                </button>
              </div>

              {/* Minimal Slide Dots */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 pt-0.5 sm:pt-1">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx
                      ? "w-6 sm:w-7 bg-gradient-to-r from-rose-600 to-amber-500 shadow-xs"
                      : "w-2 bg-zinc-200 hover:bg-zinc-300"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Mobile Compact Trust Badges (Single line) */}
              <div className="flex sm:hidden items-center justify-center gap-3 pt-1 text-[11px] font-semibold text-zinc-600">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  100% Pure Veg
                </span>
                <span className="text-zinc-300">•</span>
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  ★ 4.9 Rated
                </span>
                <span className="text-zinc-300">•</span>
                <span className="flex items-center gap-1">
                  ⚡ 20 min Fast
                </span>
              </div>

              {/* Desktop/Tablet Stats Row */}
              <div className="hidden sm:flex pt-3 border-t border-zinc-100 items-center justify-center lg:justify-start gap-6 sm:gap-8 text-left">
                <div>
                  <div className="text-lg sm:text-xl font-black text-zinc-900">100%</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">Pure Veg</div>
                </div>
                <div className="w-px h-7 bg-zinc-200" />
                <div>
                  <div className="text-lg sm:text-xl font-black text-rose-600">4.9 ★</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">Top Rated</div>
                </div>
                <div className="w-px h-7 bg-zinc-200" />
                <div>
                  <div className="text-lg sm:text-xl font-black text-zinc-900">20 min</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">Fast Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Column: Scaled, Balanced Dynamic Food Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-1 sm:pt-2 lg:pt-0">
              {/* Outer Subtle Dash Ring */}
              <div className="absolute w-48 h-48 sm:w-68 sm:h-68 lg:w-76 lg:h-76 rounded-full border border-dashed border-rose-200/80 animate-spin-slow pointer-events-none" />

              {/* Dynamic Dish Image */}
              <div className="relative z-10 w-40 h-40 sm:w-60 sm:h-60 lg:w-68 lg:h-68 rounded-full p-1.5 sm:p-2 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-lg sm:shadow-xl shadow-rose-500/20">
                <div className="w-full h-full rounded-full overflow-hidden border-2 sm:border-4 border-white relative bg-zinc-100">
                  <img
                    key={`hero-img-${currentSlide}`}
                    src={heroSlides[currentSlide].image}
                    alt={heroSlides[currentSlide].titleHighlight}
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-400"
                  />

                  {/* Authentic Veg Badge on Hero Image */}
                  <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-md bg-white border border-emerald-600 flex items-center justify-center shadow-md p-0.5 z-20">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 inline-block" />
                  </div>
                </div>
              </div>

              {/* Floating Slide Navigation Controls - Hidden on small mobile to avoid blocking dish, visible on tablet+ */}
              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
                }
                className="hidden sm:flex absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-rose-600 hover:text-white text-zinc-700 shadow-md border border-zinc-200/80 hover:border-rose-600 items-center justify-center transition-all cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
                }
                className="hidden sm:flex absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-rose-600 hover:text-white text-zinc-700 shadow-md border border-zinc-200/80 hover:border-rose-600 items-center justify-center transition-all cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Single Clean Floating Promo Pill */}
              <div className="absolute -bottom-1 left-2 sm:bottom-1 sm:left-4 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-md border border-zinc-100 flex items-center gap-1.5 sm:gap-2 animate-in fade-in duration-300">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                </div>
                <div>
                  <div className="font-black text-[10px] sm:text-xs text-zinc-900 leading-tight">
                    {heroSlides[currentSlide].offerBadge}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-zinc-500 font-medium">Fresh &amp; piping hot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Trigger */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-red-500 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/RXv_uIN6e-Y?autoplay=1"
                title="Restaurant Story Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* INFINITE MARQUEE TICKER */}
      {/* <Marquee /> */}

      {/* CATEGORY SECTION */}
      <Category />

      {/* DELICIOUS MENU SECTION WITH FILTER BUTTONS & CARDS */}
      <Menu />

      {/* SUPER SAVER FOOD COMBOS & THALIS */}
      <Combos />

      {/* ABOUT STORY SECTION */}
      <About />

      {/* SPECIAL WEEKEND DEAL */}
      <Offers />

      {/* TESTIMONIALS SECTION */}
      <Testimonial />

      {/* CONTACT US SECTION */}
      <Contactus />
    </div>
  );
}
