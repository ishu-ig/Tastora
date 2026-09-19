"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Users,
  Check,
  Plus,
  Minus,
  Flame,
  ArrowRight,
  Eye,
  Gift,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export const comboData = [
  {
    id: "royal-maharaja-thali",
    name: "Royal Maharaja Thali",
    category: "Thalis",
    tagline: "The grand 8-dish royal pure vegetarian feast",
    badge: "Bestseller Feast",
    discount: "31% OFF",
    originalPrice: 28.99,
    price: 19.99,
    serves: "1-2 Persons",
    prepTime: "20-25 mins",
    rating: "4.98",
    reviews: "1.4k",
    image: "/img/category/royal-thali.jpg",
    description:
      "A grand imperial brass thali packed with our signature gravies, fresh clay tandoor breads, basmati pulao, and traditional warm sweet.",
    items: [
      "Paneer Butter Masala (Rich Creamy Gravy)",
      "Slow-Cooked Dal Makhani (12h Makhan Simmered)",
      "Seasonal Mixed Vegetable Subz",
      "Fragrant Jeera Basmati Rice",
      "2 Hot Butter Naans / Tandoori Rotis",
      "Mint Boondi Raita & Roasted Crisp Papad",
      "Fresh Cucumber Salad & Green Chutney",
      "2 Warm Gulab Jamuns in Saffron Syrup",
    ],
    popular: true,
  },
  {
    id: "executive-punjabi-thali",
    name: "Executive Punjabi Thali Box",
    category: "Thalis",
    tagline: "Amritsari chole, paneer masala & garlic naan",
    badge: "Office Favorite",
    discount: "29% OFF",
    originalPrice: 22.49,
    price: 15.99,
    serves: "1 Person",
    prepTime: "15-20 mins",
    rating: "4.9",
    reviews: "820",
    image: "/img/category/royal-thali.jpg",
    description:
      "A balanced 6-course thali combo packed for rapid delivery with rich Punjabi curries and fluffy breads.",
    items: [
      "Paneer Tikka Masala (Smoky Gravy)",
      "Amritsari Pindi Dark Chole",
      "Steamed Long-Grain Basmati Rice",
      "2 Fresh Tandoori Garlic Naans",
      "Chatpata Laccha Onion & Green Chili",
      "1 Warm Kesar Gulab Jamun",
    ],
    popular: false,
  },
  {
    id: "tikka-biryani-duo",
    name: "Tandoori Tikka & Dum Biryani Duo",
    category: "Biryani Combos",
    tagline: "Smoky starter paired with royal handi dum rice",
    badge: "Chef's Special",
    discount: "32% OFF",
    originalPrice: 24.99,
    price: 16.99,
    serves: "2 Persons",
    prepTime: "20-25 mins",
    rating: "4.92",
    reviews: "980",
    image: "/img/category/paneer-tikka.jpg",
    description:
      "Charcoal-roasted cottage cheese skewers served with royal slow-cooked saffron basmati rice and cooling raita.",
    items: [
      "Charcoal Grilled Paneer Tikka (6 Pcs)",
      "Royal Shahi Veg Dum Biryani (Full Handi Portion)",
      "Cooling Cucumber Boondi Raita",
      "Spicy Mint-Coriander Chutney",
      "Pickled Laccha Onions",
      "2 Melt-in-Mouth Gulab Jamuns",
    ],
    popular: true,
  },
  {
    id: "hyderabadi-biryani-feast",
    name: "Hyderabadi Dum Biryani Feast",
    category: "Biryani Combos",
    tagline: "Layered saffron basmati with Mirchi Ka Salan",
    badge: "Royal Dum Style",
    discount: "30% OFF",
    originalPrice: 21.99,
    price: 15.49,
    serves: "1-2 Persons",
    prepTime: "18-22 mins",
    rating: "4.88",
    reviews: "670",
    image: "/img/category/veg-biryani.jpg",
    description:
      "Fragrant basmati rice layered with garden vegetables, served with authentic Hyderabadi peanut sesame gravy and sweet.",
    items: [
      "Hyderabadi Veg Dum Biryani (Double Portion)",
      "Authentic Mirchi Ka Salan (Peanut Sesame Gravy)",
      "Creamy Dahi Pyaaz Ka Raita",
      "Roasted Masala Papad (2 Pcs)",
      "1 Royal Matka Kulfi",
    ],
    popular: false,
  },
  {
    id: "south-indian-deluxe-feast",
    name: "South Indian Deluxe Feast",
    category: "South Specials",
    tagline: "Crisp dosas, fluffy idlis & Madras filter coffee",
    badge: "Heritage Combo",
    discount: "30% OFF",
    originalPrice: 19.99,
    price: 13.99,
    serves: "1-2 Persons",
    prepTime: "15-20 mins",
    rating: "4.85",
    reviews: "750",
    image: "/img/category/masala-dosa.jpg",
    description:
      "A traditional South Indian spread featuring our signature golden masala dosa, crispy vadas, and steaming filter coffee.",
    items: [
      "1 Jumbo Golden Mysore Masala Dosa",
      "2 Crispy Golden Medu Vadas",
      "2 Steamed Soft Button Idlis",
      "Piping Hot Dal Sambar (Unlimited Refill)",
      "Trio of Chutneys (Coconut, Tomato, Mint)",
      "1 Traditional Hot Madras Filter Coffee",
    ],
    popular: false,
  },
  {
    id: "punjabi-chole-bhature-express",
    name: "Punjabi Chole Bhature Box",
    category: "North Combos",
    tagline: "Delhi style spicy chole with golden puffed bhature",
    badge: "Weekend Hit",
    discount: "33% OFF",
    originalPrice: 17.99,
    price: 11.99,
    serves: "1 Person",
    prepTime: "15-20 mins",
    rating: "4.94",
    reviews: "1.2k",
    image: "/img/category/chole-bhature.jpg",
    description:
      "Two ultra-fluffy, golden-fried bhature served with rich Amritsari dark chole and sweet refreshing lassi.",
    items: [
      "2 Jumbo Puffed Golden Bhature",
      "Amritsari Dark Pindi Spiced Chole",
      "1 Tall Glass Sweet Punjabi Lassi (300ml)",
      "Spicy Pickled Green Chilies & Lemon",
      "Tangy Onion Salad",
      "1 Warm Gulab Jamun",
    ],
    popular: true,
  },
  {
    id: "dal-makhani-naan-box",
    name: "Dal Makhani & Naan Box",
    category: "North Combos",
    tagline: "Overnight cooked black lentils with garlic butter naan",
    badge: "Comfort Meal",
    discount: "31% OFF",
    originalPrice: 20.99,
    price: 14.49,
    serves: "1-2 Persons",
    prepTime: "15-20 mins",
    rating: "4.91",
    reviews: "890",
    image: "/img/category/dal-makhani.jpg",
    description:
      "Silky smooth dal makhani slow-cooked for 12 hours with fresh dairy butter, paired with garlic naans and jeera rice.",
    items: [
      "Signature 12-Hour Dal Makhani (Large)",
      "2 Fresh Tandoori Garlic Butter Naans",
      "Fragrant Basmati Jeera Rice",
      "Roasted Masala Papad",
      "Sliced Onion Rings with Chat Masala",
      "1 Sweet Gulab Jamun",
    ],
    popular: false,
  },
  {
    id: "mumbai-chowpatty-street-combo",
    name: "Mumbai Chowpatty Street Combo",
    category: "Street Combos",
    tagline: "Best of Mumbai street food in one sharing box",
    badge: "Street Special",
    discount: "32% OFF",
    originalPrice: 21.99,
    price: 14.99,
    serves: "2 Persons",
    prepTime: "15 mins",
    rating: "4.86",
    reviews: "640",
    image: "/img/category/pav-bhaji.jpg",
    description:
      "Iconic butter-loaded mashed vegetable bhaji, toasted soft pavs, crisp sev puris, and chilled masala chaas.",
    items: [
      "Butter Masala Pav Bhaji (with 2 Toasted Pavs)",
      "Mumbai Style Sev Puri (6 Crispy Pcs)",
      "Grilled Bombay Cheese Masala Sandwich",
      "2 Glasses Chilled Spiced Masala Chaas",
      "Extra Lemon Wedges & Chopped Onions",
    ],
    popular: false,
  },
];

const comboCategories = [
  { id: "All Combos", label: "All Feasts", icon: "✨" },
  { id: "Thalis", label: "Royal Thalis", icon: "👑" },
  { id: "North Combos", label: "North Indian", icon: "🍛" },
  { id: "Biryani Combos", label: "Dum Biryani", icon: "🍚" },
  { id: "South Specials", label: "South Feasts", icon: "🥞" },
  { id: "Street Combos", label: "Street Food", icon: "🫓" },
];

export function Combos() {
  const [selectedCategory, setSelectedCategory] = useState("All Combos");
  const [quantities, setQuantities] = useState({});
  const [selectedComboModal, setSelectedComboModal] = useState(null);
  const [addedToast, setAddedToast] = useState(null);

  const catPrevRef = useRef(null);
  const catNextRef = useRef(null);

  const filteredCombos =
    selectedCategory === "All Combos"
      ? comboData
      : comboData.filter((combo) => combo.category === selectedCategory);

  const handleInitialAdd = (e, combo) => {
    e.stopPropagation();
    setQuantities((prev) => ({ ...prev, [combo.id]: 1 }));
    setAddedToast({
      name: combo.name,
      qty: 1,
      total: combo.price.toFixed(2),
    });

    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  const handleQuantityChange = (e, combo, delta) => {
    e.stopPropagation();
    setQuantities((prev) => {
      const current = prev[combo.id] || 0;
      const next = Math.max(0, current + delta);
      if (next > 0) {
        setAddedToast({
          name: combo.name,
          qty: next,
          total: (combo.price * next).toFixed(2),
        });
        setTimeout(() => setAddedToast(null), 3000);
      } else if (next === 0 && current > 0) {
        setAddedToast({
          name: combo.name,
          qty: 0,
          total: "0.00",
        });
        setTimeout(() => setAddedToast(null), 2500);
      }
      return { ...prev, [combo.id]: next };
    });
  };

  const handleModalAdd = (combo) => {
    const current = quantities[combo.id] || 0;
    const next = current + 1;
    setQuantities((prev) => ({ ...prev, [combo.id]: next }));
    setAddedToast({
      name: combo.name,
      qty: next,
      total: (combo.price * next).toFixed(2),
    });
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <section id="combos" className="py-12 sm:py-16 bg-gradient-to-b from-zinc-50 via-white to-rose-50/30 relative overflow-hidden">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Cart Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Cart Updated!</div>
            <div className="text-[11px] text-zinc-300">
              {addedToast.qty}x {addedToast.name} (${addedToast.total})
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            SECTION HEADER WITH METRICS
        ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Value Feast &amp; Super Saver Combos</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Curated{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Food Combos &amp; Thalis
            </span>
          </h2>

          <p className="text-zinc-600 text-xs sm:text-sm mt-2.5 leading-relaxed max-w-2xl mx-auto">
            Authentic pure vegetarian pairings crafted by master chefs at Tastora. Enjoy multi-dish feasts with generous portions, traditional sides, and up to <strong className="text-rose-600 font-bold">35% savings</strong> on every combo!
          </p>
        </div>

        {/* =========================================================================
            SMOOTH SWIPER CATEGORY SLIDER FOR COMBOS
        ========================================================================= */}
        <div className="relative mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Desktop Prev Button */}
            <button
              ref={catPrevRef}
              className="hidden sm:flex w-9 h-9 rounded-2xl bg-white hover:bg-rose-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-rose-600 shadow-2xs hover:shadow-md items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-20 cursor-pointer shrink-0 z-20"
              aria-label="Previous combo categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Swiper Filter Strip */}
            <div className="flex-1 overflow-hidden px-1 py-1">
              <Swiper
                modules={[FreeMode, Navigation]}
                freeMode={{
                  enabled: true,
                  momentum: true,
                  momentumRatio: 0.8,
                }}
                slidesPerView={"auto"}
                spaceBetween={8}
                breakpoints={{
                  640: {
                    spaceBetween: 12,
                  },
                }}
                navigation={{
                  prevEl: catPrevRef.current,
                  nextEl: catNextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = catPrevRef.current;
                  swiper.params.navigation.nextEl = catNextRef.current;
                }}
                className="!overflow-visible py-1.5"
              >
                {comboCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count =
                    cat.id === "All Combos"
                      ? comboData.length
                      : comboData.filter((c) => c.category === cat.id).length;

                  return (
                    <SwiperSlide key={cat.id} className="!w-auto">
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`group relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                          isSelected
                            ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-rose-600/30 scale-[1.03] -translate-y-0.5"
                            : "bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200/90 hover:border-rose-300 shadow-2xs"
                        }`}
                      >
                        <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">
                          {cat.icon}
                        </span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-white/25 text-white backdrop-blur-xs"
                              : "bg-zinc-100 group-hover:bg-rose-100 text-zinc-500 group-hover:text-rose-700"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            {/* Desktop Next Button */}
            <button
              ref={catNextRef}
              className="hidden sm:flex w-9 h-9 rounded-2xl bg-white hover:bg-rose-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-rose-600 shadow-2xs hover:shadow-md items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-20 cursor-pointer shrink-0 z-20"
              aria-label="Next combo categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            COMBOS SHOWCASE GRID (Interactive Cards)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCombos.map((combo) => {
            const currentQty = quantities[combo.id] || 0;
            const savings = (combo.originalPrice - combo.price).toFixed(2);

            return (
              <div
                key={combo.id}
                onClick={() => setSelectedComboModal(combo)}
                className="bg-white rounded-3xl border border-zinc-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer select-none"
              >
                {/* Image Header with Badges */}
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Left: Authentic Green Veg Indicator */}
                  <div className="absolute top-3.5 left-3.5 w-6 h-6 rounded-md bg-white border border-emerald-600 flex items-center justify-center shadow-md p-0.5 z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  </div>

                  {/* Top Right: Discount Pill */}
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[11px] font-black tracking-wide shadow-md uppercase">
                    {combo.discount}
                  </div>

                  {/* Bottom: Tagline on Image */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                      {combo.badge}
                    </span>
                    <span className="text-amber-300 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{combo.rating} ({combo.reviews})</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta tags: Serves & Prep time */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 mb-2">
                      <span className="flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <Users className="w-3.5 h-3.5 text-rose-600" />
                        {combo.serves}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        {combo.prepTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug">
                      {combo.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Items Included Bullet Pills */}
                    <div className="mt-4 pt-3 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-[11px] font-black text-zinc-700 uppercase tracking-wider mb-2">
                        <span>Items in this Feast ({combo.items.length}):</span>
                        <span className="text-rose-600 font-bold lowercase flex items-center gap-0.5 group-hover:underline">
                          <span>view all</span>
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-zinc-700">
                        {combo.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                        {combo.items.length > 3 && (
                          <li className="text-[11px] text-rose-600 font-bold pl-5">
                            + {combo.items.length - 3} more delicious sides &amp; treats
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Stepper */}
                  <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight">
                          ${combo.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-400 line-through leading-tight">
                          ${combo.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-600">
                        Save ${savings} ({combo.discount})
                      </div>
                    </div>

                    {/* ADD Button or Quantity Stepper */}
                    {currentQty === 0 ? (
                      <button
                        onClick={(e) => handleInitialAdd(e, combo)}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-zinc-900 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-500 text-white text-xs font-black shadow-xs hover:shadow-md hover:shadow-rose-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center bg-zinc-900 text-white rounded-full p-1 border border-zinc-700 shadow-xs animate-in zoom-in-90 duration-150 shrink-0"
                      >
                        <button
                          onClick={(e) => handleQuantityChange(e, combo, -1)}
                          className="w-6 h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-amber-400 font-mono">
                          {currentQty}
                        </span>
                        <button
                          onClick={(e) => handleQuantityChange(e, combo, 1)}
                          className="w-6 h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            CATERING & PARTY BULK COMBOS BANNER
        ========================================================================= */}
        <div className="mt-14 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>Party &amp; Family Catering</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">
              Planning a Gathering or Festive Celebration?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Get customized 100% Pure Vegetarian Thali Boxes and live catering counters for birthdays, office lunches, and family get-togethers at exclusive bulk discounts from Tastora.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <a
              href="#contact-section"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-rose-600/40 hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Enquire Bulk Combos</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DETAILED COMBO ITEMS MODAL
      ========================================================================= */}
      {selectedComboModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 relative animate-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="relative h-52 w-full bg-zinc-100">
              <img
                src={selectedComboModal.image}
                alt={selectedComboModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedComboModal(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3.5 left-5 right-5 text-white">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-black uppercase mb-1">
                  {selectedComboModal.discount}
                </div>
                <h4 className="text-2xl font-black">{selectedComboModal.name}</h4>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                {selectedComboModal.description}
              </p>

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-600" />
                  <span>Complete Items Included in This Feast:</span>
                </h5>
                <ul className="space-y-2">
                  {selectedComboModal.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-800"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Feast Special:</span>
                <div className="text-xl font-black text-zinc-900">
                  ${selectedComboModal.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => {
                  handleModalAdd(selectedComboModal);
                  setSelectedComboModal(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Combo to Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Combos;
