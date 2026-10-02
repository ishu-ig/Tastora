"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCombo } from "@/Redux/ActionCreators/ComboActionCreators";
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Users,
  Check,
  Plus,
  Minus,
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
import useCartWishlist from "@/hooks/useCartWishlist";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export const comboData = [
  {
    id: "6ab96155f6c07e05691a55c4",
    _id: "6ab96155f6c07e05691a55c4",
    name: "Tandoori Tikka & Dum Biryani Duo",
    category: "Biryani Combos",
    tagline: "Smoky starter paired with royal handi dum rice",
    badge: "Chef's Special",
    discount: "32% OFF",
    originalPrice: 449,
    price: 349,
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
    id: "6ab96155f6c07e05691a55c3",
    _id: "6ab96155f6c07e05691a55c3",
    name: "Hyderabadi Dum Biryani Combo",
    category: "Biryani Combos",
    tagline: "Layered saffron basmati with Mirchi Ka Salan",
    badge: "Royal Dum Style",
    discount: "30% OFF",
    originalPrice: 399,
    price: 299,
    serves: "1-2 Persons",
    prepTime: "18-22 mins",
    rating: "4.88",
    reviews: "670",
    image: "/img/category/veg-biryani.jpg",
    description:
      "Fragrant basmati rice layered with garden vegetables, served with authentic Hyderabadi peanut sesame gravy and a sweet finish.",
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
    id: "punjabi-chole-bhature-combo",
    name: "Punjabi Chole Bhature Combo",
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
      "Two ultra-fluffy, golden-fried bhature served with rich Amritsari dark chole and a sweet refreshing lassi.",
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
    id: "dal-makhani-naan-combo",
    name: "Dal Makhani & Naan Combo",
    category: "North Combos",
    tagline: "Overnight-cooked black lentils with garlic butter naan",
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
      "Silky dal makhani slow-cooked for 12 hours with fresh dairy butter, paired with garlic naans and jeera rice.",
    items: [
      "Signature 12-Hour Dal Makhani (Large)",
      "2 Fresh Tandoori Garlic Butter Naans",
      "Fragrant Basmati Jeera Rice",
      "Roasted Masala Papad",
      "Sliced Onion Rings with Chaat Masala",
      "1 Sweet Gulab Jamun",
    ],
    popular: false,
  },
  {
    id: "rajma-chawal-combo",
    name: "Rajma Chawal Comfort Combo",
    category: "North Combos",
    tagline: "Slow-simmered rajma with steamed rice & boondi raita",
    badge: "Home-Style Pick",
    discount: "28% OFF",
    originalPrice: 15.99,
    price: 11.49,
    serves: "1 Person",
    prepTime: "15 mins",
    rating: "4.83",
    reviews: "520",
    image: "/img/category/dal-makhani.jpg",
    description:
      "Creamy Kashmiri-style rajma masala over steamed basmati rice, with cooling raita and crunchy sides.",
    items: [
      "Creamy Rajma Masala (Large Bowl)",
      "Steamed Basmati Rice",
      "Boondi Raita",
      "Roasted Masala Papad",
      "Onion Salad & Lemon",
    ],
    popular: false,
  },
  {
    id: "south-indian-breakfast-combo",
    name: "South Indian Deluxe Combo",
    category: "South Combos",
    tagline: "Crisp dosa, fluffy idlis & Madras filter coffee",
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
    id: "uttapam-vada-combo",
    name: "Uttapam & Vada Sambar Combo",
    category: "South Combos",
    tagline: "Onion-tomato uttapam with crispy medu vada",
    badge: "Light & Tasty",
    discount: "27% OFF",
    originalPrice: 14.99,
    price: 10.99,
    serves: "1 Person",
    prepTime: "15 mins",
    rating: "4.8",
    reviews: "390",
    image: "/img/category/masala-dosa.jpg",
    description:
      "Thick, soft uttapam topped with onion and tomato, served with crispy vadas, hot sambar, and fresh chutneys.",
    items: [
      "1 Onion Tomato Uttapam",
      "2 Crispy Medu Vadas",
      "Hot Dal Sambar",
      "Coconut & Tomato Chutney",
      "1 Hot Madras Filter Coffee",
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
  {
    id: "indo-chinese-street-combo",
    name: "Indo-Chinese Street Combo",
    category: "Street Combos",
    tagline: "Veg momos, hakka noodles & crispy manchurian",
    badge: "Party Pick",
    discount: "29% OFF",
    originalPrice: 22.49,
    price: 15.99,
    serves: "2 Persons",
    prepTime: "20 mins",
    rating: "4.81",
    reviews: "470",
    image: "/img/category/pav-bhaji.jpg",
    description:
      "A hot and spicy Indo-Chinese sharing box with steamed momos, wok-tossed noodles, and crunchy manchurian in tangy gravy.",
    items: [
      "Steamed Veg Momos (8 Pcs)",
      "Veg Hakka Noodles",
      "Crispy Veg Manchurian with Gravy",
      "Schezwan Chutney & Spicy Mayo",
      "2 Chilled Lemon Iced Teas",
    ],
    popular: false,
  },
];

// Icons for known categories. Any new category coming from the backend
// automatically gets a default icon.
const categoryIcons = {
  "Biryani Combos": "🍚",
  "North Combos": "🍛",
  "South Combos": "🥞",
  "Street Combos": "🫓",
  "Chinese Combos": "🥢",
  "Italian Combos": "🍕",
  "Snacks & Drinks": "🍟",
  "Special Combos": "✨",
};

const FALLBACK_IMAGE = "/img/category/royal-thali.jpg";

// Converts one record from ComboStateData into the shape the cards use.
const normalizeCombo = (item, index) => {
  const mongoId = item._id
    ? String(item._id)
    : (item.id && /^[a-fA-F0-9]{24}$/.test(item.id)
      ? item.id
      : `6ab96155f6c07e05691a55b${index % 10}`);

  const price = Number(item.price ?? item.finalPrice ?? 0);
  const originalPrice = Number(item.originalPrice ?? item.basePrice ?? (price > 0 ? Math.round(price * 1.3) : 0));

  let discount = item.discount;
  if (typeof discount === "number") discount = `${discount}% OFF`;
  if (!discount && originalPrice > price) {
    discount = `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;
  }

  let items = item.items ?? [];
  if (typeof items === "string") {
    items = items.split(/\n|,/).map((i) => i.trim()).filter(Boolean);
  } else if (Array.isArray(items)) {
    items = items.map((i) => {
      if (typeof i === "string") return i;
      if (i && typeof i === "object") {
        const q = i.quantity && Number(i.quantity) > 1 ? `${i.quantity}x ` : "";
        return `${q}${i.customName || i.name || i.title || i.product?.name || "Special Combo Pairing"}`;
      }
      return String(i || "");
    });
  }

  const category = item.category || "Special Combos";

  return {
    id: mongoId,
    _id: mongoId,
    productId: mongoId,
    name: item.name ?? "Special Pairing Combo",
    title: item.name ?? "Special Pairing Combo",
    category,
    tagline: item.tagline ?? "Specially curated multi-course food combination",
    badge: item.badge ?? (discount ? "Combo Deal" : "Chef's Special"),
    discount: discount || "",
    originalPrice,
    price,
    variantFinalPrice: price,
    variantName: "Full",
    serves: item.serves ?? "1-2 Persons",
    prepTime: item.prepTime ?? "15-20 mins",
    rating: String(item.rating ?? "4.9"),
    reviews: String(item.reviews ?? "380"),
    image: item.image ?? item.pic ?? FALLBACK_IMAGE,
    description: item.description ?? "",
    items,
    popular: Boolean(item.popular !== false),
  };
};

export function Combos() {
  const dispatch = useDispatch();
  const ComboStateData = useSelector((state) => state.ComboStateData);
  const { addToCart, updateQty, getQty, isInCart } = useCartWishlist();

  const [selectedCategory, setSelectedCategory] = useState("All Combos");
  const [selectedComboModal, setSelectedComboModal] = useState(null);
  const [addedToast, setAddedToast] = useState(null);

  const catPrevRef = useRef(null);
  const catNextRef = useRef(null);

  // Load combos from the store on first render
  useEffect(() => {
    dispatch(getCombo());
  }, [dispatch]);

  // Use ComboStateData when it has records, otherwise show the built-in comboData
  const combos = useMemo(() => {
    const list = Array.isArray(ComboStateData) ? ComboStateData : [];
    return list.length > 0 ? list.map(normalizeCombo) : comboData.map(normalizeCombo);
  }, [ComboStateData]);

  // Build category tabs from the categories present in the data
  const categories = useMemo(() => {
    const unique = [...new Set(combos.map((c) => c.category))];
    return [
      { id: "All Combos", label: "All Combos", icon: "✨" },
      ...unique.map((cat) => ({
        id: cat,
        label: cat,
        icon: categoryIcons[cat] || "🍽️",
      })),
    ];
  }, [combos]);

  const filteredCombos =
    selectedCategory === "All Combos"
      ? combos
      : combos.filter((combo) => combo.category === selectedCategory);

  const handleInitialAdd = (e, combo) => {
    e.stopPropagation();
    addToCart(combo, 1);
    setAddedToast({
      name: combo.name,
      qty: 1,
      total: Number(combo.price).toFixed(2),
    });

    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  const handleQuantityChange = (e, combo, delta) => {
    e.stopPropagation();
    updateQty(combo, delta);
    const current = getQty(combo);
    const next = Math.max(0, current + delta);
    if (next > 0) {
      setAddedToast({
        name: combo.name,
        qty: next,
        total: (combo.price * next).toFixed(2),
      });
      setTimeout(() => setAddedToast(null), 3000);
    } else {
      setAddedToast({
        name: combo.name,
        qty: 0,
        total: "0.00",
      });
      setTimeout(() => setAddedToast(null), 2500);
    }
  };

  const handleModalAdd = (combo) => {
    const current = getQty(combo);
    if (current === 0) {
      addToCart(combo, 1);
    } else {
      updateQty(combo, 1);
    }
    const next = current + 1;
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
              {addedToast.qty}x {addedToast.name} (₹{addedToast.total})
            </div>
          </div>
        </div>
      )}


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Value Combos &amp; Super Saver Meals</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Curated{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Food Combos
            </span>
          </h2>

          <p className="text-zinc-600 text-xs sm:text-sm mt-2.5 leading-relaxed max-w-2xl mx-auto">
            Pure vegetarian meal pairings put together by our chefs at Tastora. Pick a biryani, North Indian, South Indian, or street food combo with a main, sides, and a drink or sweet, and save up to <strong className="text-rose-600 font-bold">35%</strong> on every combo.
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
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count =
                    cat.id === "All Combos"
                      ? combos.length
                      : combos.filter((c) => c.category === cat.id).length;

                  return (
                    <SwiperSlide key={cat.id} className="!w-auto">
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`group relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-95 ${isSelected
                          ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-rose-600/30 scale-[1.03] -translate-y-0.5"
                          : "bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200/90 hover:border-rose-300 shadow-2xs"
                          }`}
                      >
                        <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">
                          {cat.icon}
                        </span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${isSelected
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredCombos.map((combo) => {
            const currentQty = getQty(combo);
            const savings = Math.max(0, combo.originalPrice - combo.price);

            return (
              <div
                key={combo.id}
                onClick={() => setSelectedComboModal(combo)}
                className="bg-white rounded-3xl border border-zinc-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer select-none"
              >
                {/* Image Header with Badges */}
                <div className="relative h-32 sm:h-52 md:h-60 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Left: Authentic Green Veg Indicator */}
                  <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-md bg-white border border-emerald-600 flex items-center justify-center shadow-md p-0.5 z-10">
                    <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 inline-block" />
                  </div>

                  {/* Top Right: Discount Pill */}
                  <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[9px] sm:text-[11px] font-black tracking-wide shadow-md uppercase">
                    {combo.discount}
                  </div>

                  {/* Bottom: Badge & Rating on Image */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3.5 sm:right-3.5 flex items-center justify-between text-white text-[10px] sm:text-xs font-bold gap-1">
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 truncate max-w-[60%]">
                      {combo.badge}
                    </span>
                    <span className="ml-auto text-amber-300 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-white/20 text-[9px] sm:text-xs shrink-0">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                      <span>{combo.rating}</span>
                      <span className="hidden sm:inline text-white/80">({combo.reviews})</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-2.5 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta tags: Serves & Prep time */}
                    <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-semibold text-zinc-500 mb-1.5 sm:mb-2 flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-700 bg-zinc-100 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-full">
                        <Users className="w-3 h-3 text-rose-600 shrink-0" />
                        <span className="truncate">{combo.serves}</span>
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{combo.prepTime}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-base lg:text-lg font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                      {combo.name}
                    </h3>
                    <p className="hidden sm:block text-[11px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Items Included Bullet Pills (Tablet & Laptop) */}
                    <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-100">
                      <div className="hidden sm:flex items-center justify-between text-[11px] font-black text-zinc-700 uppercase tracking-wider mb-2">
                        <span>Items in this Combo ({combo.items.length}):</span>
                        <span className="text-rose-600 font-bold lowercase flex items-center gap-0.5 group-hover:underline">
                          <span>view all</span>
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>

                      <ul className="hidden sm:block space-y-1.5 text-xs text-zinc-700">
                        {combo.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{typeof item === "string" ? item : (item?.customName || item?.name || "Special Item")}</span>
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
                  <div className="mt-2 sm:mt-5 pt-2 sm:pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-1 sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-xs sm:text-lg lg:text-xl font-black text-zinc-900 leading-tight">
                          ₹{combo.price}
                        </span>
                        {savings > 0 && (
                          <span className="hidden sm:inline text-xs text-zinc-400 line-through leading-tight">
                            ₹{combo.originalPrice}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="text-[9px] sm:text-[10px] font-black text-emerald-600 truncate">
                          Save ₹{savings}
                        </div>
                      )}
                    </div>

                    {/* ADD Button or Quantity Stepper */}
                    {currentQty === 0 ? (
                      <button
                        onClick={(e) => handleInitialAdd(e, combo)}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full bg-zinc-900 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-500 text-white text-[10px] sm:text-xs font-black shadow-xs hover:shadow-md hover:shadow-rose-600/25 transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center bg-zinc-900 text-white rounded-full p-0.5 sm:p-1 border border-zinc-700 shadow-xs shrink-0"
                      >
                        <button
                          onClick={(e) => handleQuantityChange(e, combo, -1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-black text-amber-400 font-mono">
                          {currentQty}
                        </span>
                        <button
                          onClick={(e) => handleQuantityChange(e, combo, 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
              Order 100% pure vegetarian combo boxes in bulk for birthdays, office lunches, and family get-togethers, with special group pricing from Tastora.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <a
              href="/about#contact-section"
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
                  <span>Complete Items Included in This Combo:</span>
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
                      <span className="font-semibold">{typeof item === "string" ? item : (item?.customName || item?.name || "Special Item")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Combo Special:</span>
                <div className="text-xl font-black text-zinc-900">
                  ₹{selectedComboModal.price}
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