"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getThali } from "@/Redux/ActionCreators/ThaliActionCreators";
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

export const thaliData = [
  {
    id: "6abccda73af9189b11eaa541",
    _id: "6abccda73af9189b11eaa541",
    name: "Royal Maharaja Thali",
    category: "Royal Thalis",
    thaliType: "Royal Thalis",
    tagline: "The grand 8-dish royal pure vegetarian feast",
    badge: "Bestseller Thali",
    discount: "31% OFF",
    originalPrice: 449,
    price: 349,
    serves: "1-2 Persons",
    prepTime: "20-25 mins",
    rating: "4.98",
    reviews: "1.4k",
    image: "/img/category/royal-thali.jpg",
    description:
      "A grand imperial brass thali packed with our signature gravies, fresh clay tandoor breads, basmati pulao, and a traditional warm sweet.",
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
    id: "6abccda73af9189b11eaa54b",
    _id: "6abccda73af9189b11eaa54b",
    name: "Shahi Paneer Deluxe Thali",
    category: "North Indian",
    thaliType: "North Indian",
    tagline: "Nawabi paneer, stuffed kulcha & saffron pulao",
    badge: "Chef's Special",
    discount: "30% OFF",
    originalPrice: 399,
    price: 299,
    serves: "1-2 Persons",
    prepTime: "20-25 mins",
    rating: "4.93",
    reviews: "910",
    image: "/img/category/paneer-tikka.jpg",
    description:
      "A rich Mughlai-style thali built around silky shahi paneer, stuffed kulcha, saffron pulao, and a cooling raita.",
    items: [
      "Shahi Paneer (Cashew & Cream Gravy)",
      "Dal Tadka with Ghee Tempering",
      "Kaju Matar Malai Subz",
      "Saffron Pulao",
      "Stuffed Paneer Kulcha (2 Pcs)",
      "Pineapple Raita & Masala Papad",
      "1 Royal Matka Kulfi",
    ],
    popular: false,
  },

  {
    id: "executive-punjabi-thali",
    name: "Executive Punjabi Thali",
    category: "North Indian",
    tagline: "Amritsari chole, paneer masala & garlic naan",
    badge: "Office Favorite",
    discount: "29% OFF",
    originalPrice: 22.49,
    price: 15.99,
    serves: "1 Person",
    prepTime: "15-20 mins",
    rating: "4.9",
    reviews: "820",
    image: "/img/category/chole-bhature.jpg",
    description:
      "A balanced 6-course thali packed for quick delivery, with rich Punjabi curries and fluffy breads.",
    items: [
      "Paneer Tikka Masala (Smoky Gravy)",
      "Amritsari Pindi Dark Chole",
      "Steamed Long-Grain Basmati Rice",
      "2 Fresh Tandoori Garlic Naans",
      "Laccha Onion & Green Chili",
      "1 Warm Kesar Gulab Jamun",
    ],
    popular: true,
  },
  {
    id: "dal-makhani-comfort-thali",
    name: "Dal Makhani Comfort Thali",
    category: "North Indian",
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
      "Silky dal makhani slow-cooked for 12 hours with fresh dairy butter, served with garlic naans and jeera rice.",
    items: [
      "Signature 12-Hour Dal Makhani (Large)",
      "Aloo Gobi Dry Subz",
      "2 Tandoori Garlic Butter Naans",
      "Fragrant Basmati Jeera Rice",
      "Roasted Masala Papad",
      "Sliced Onion Rings with Chaat Masala",
      "1 Sweet Gulab Jamun",
    ],
    popular: false,
  },
  {
    id: "south-indian-deluxe-thali",
    name: "South Indian Deluxe Thali",
    category: "South Indian",
    tagline: "Sambar, rasam, poriyal & steaming rice with payasam",
    badge: "Heritage Thali",
    discount: "30% OFF",
    originalPrice: 19.99,
    price: 13.99,
    serves: "1 Person",
    prepTime: "15-20 mins",
    rating: "4.85",
    reviews: "750",
    image: "/img/category/masala-dosa.jpg",
    description:
      "A traditional South Indian thali with steamed rice, tangy rasam, hearty sambar, seasonal poriyal, and a sweet payasam to finish.",
    items: [
      "Steamed Rice with Ghee",
      "Piping Hot Dal Sambar",
      "Tangy Pepper Rasam",
      "Seasonal Vegetable Poriyal",
      "Curd Rice & Mango Pickle",
      "Crispy Appalam & Coconut Chutney",
      "1 Bowl Semiya Payasam",
    ],
    popular: false,
  },
  {
    id: "andhra-meals-thali",
    name: "Andhra Spicy Meals Thali",
    category: "South Indian",
    tagline: "Gongura pappu, avakai pickle & fiery kootu",
    badge: "Spice Lover's Pick",
    discount: "28% OFF",
    originalPrice: 18.49,
    price: 13.29,
    serves: "1 Person",
    prepTime: "15-20 mins",
    rating: "4.82",
    reviews: "430",
    image: "/img/category/veg-biryani.jpg",
    description:
      "A bold Andhra-style meal with tangy gongura dal, spicy vegetable curries, and fluffy rice with ghee.",
    items: [
      "Steamed Rice with Ghee & Podi",
      "Gongura Pappu (Sorrel Leaf Dal)",
      "Guttivankaya Stuffed Brinjal Curry",
      "Beans Kobbari Poriyal",
      "Spicy Tomato Rasam",
      "Avakai Pickle & Curd",
      "1 Bobbatlu (Sweet Flatbread)",
    ],
    popular: false,
  },
  {
    id: "rajasthani-dal-baati-thali",
    name: "Rajasthani Dal Baati Thali",
    category: "Regional",
    tagline: "Dal baati churma with gatte ki sabzi & kadhi",
    badge: "Desi Special",
    discount: "31% OFF",
    originalPrice: 23.99,
    price: 16.49,
    serves: "1-2 Persons",
    prepTime: "20-25 mins",
    rating: "4.9",
    reviews: "540",
    image: "/img/category/dal-makhani.jpg",
    description:
      "A rustic Rajasthani feast with ghee-soaked baatis, five-lentil dal, gatte ki sabzi, and sweet churma.",
    items: [
      "3 Ghee-Soaked Baatis",
      "Panchmel Dal",
      "Gatte Ki Sabzi",
      "Rajasthani Kadhi",
      "Jeera Rice & Garlic Chutney",
      "Sweet Churma",
    ],
    popular: true,
  },
  {
    id: "gujarati-thali",
    name: "Gujarati Home-Style Thali",
    category: "Regional",
    tagline: "Kadhi, undhiyu, theplas & farsan with a sweet touch",
    badge: "Sweet & Savory",
    discount: "32% OFF",
    originalPrice: 21.99,
    price: 14.99,
    serves: "1-2 Persons",
    prepTime: "20 mins",
    rating: "4.87",
    reviews: "610",
    image: "/img/category/pav-bhaji.jpg",
    description:
      "A wholesome Gujarati thali with mildly sweet dal, seasonal undhiyu, soft theplas, crisp farsan, and shrikhand.",
    items: [
      "Gujarati Dal (Sweet & Tangy)",
      "Seasonal Undhiyu",
      "Khatti Meethi Kadhi",
      "3 Soft Methi Theplas",
      "Steamed Rice",
      "Dhokla & Khandvi Farsan",
      "Chaas, Papad & Pickle",
      "1 Bowl Kesar Shrikhand",
    ],
    popular: false,
  },
  {
    id: "bengali-veg-thali",
    name: "Bengali Veg Bhoj Thali",
    category: "Regional",
    tagline: "Shukto, cholar dal, luchi & mishti doi",
    badge: "Festive Bhoj",
    discount: "30% OFF",
    originalPrice: 22.99,
    price: 16.09,
    serves: "1-2 Persons",
    prepTime: "20-25 mins",
    rating: "4.84",
    reviews: "360",
    image: "/img/category/royal-thali.jpg",
    description:
      "A festive Bengali vegetarian spread with fluffy luchis, mildly spiced cholar dal, aloo posto, and mishti doi.",
    items: [
      "Shukto (Bitter-Sweet Vegetable Stew)",
      "Cholar Dal with Coconut",
      "Aloo Posto",
      "Begun Bhaja (Fried Brinjal)",
      "4 Puffed Luchis",
      "Basmati Bhat with Ghee",
      "Tomato Khejur Chutney & Papad",
      "1 Cup Mishti Doi",
    ],
    popular: false,
  },
];

// Icons for known categories. Any new category coming from the backend
// automatically gets a default icon.
const categoryIcons = {
  "All Thalis": "✨",
  "Royal Thalis": "👑",
  "North Indian": "🍛",
  "South Indian": "🥞",
  "Punjabi": "🫓",
  "Rajasthani": "👑",
  "Gujarati": "🍲",
  "Bengali": "🍱",
  "Maharashtrian": "🍛",
  "Special": "⭐",
  "Regional": "🫓",
};

const FALLBACK_IMAGE = "/img/category/royal-thali.jpg";

// Converts one record from ThaliStateData into the shape the cards use.
const normalizeThali = (item, index) => {
  const mongoId = item._id
    ? String(item._id)
    : (item.id && /^[a-fA-F0-9]{24}$/.test(item.id)
      ? item.id
      : `6abccda73af9189b11eaa54${index % 10}`);

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
        return `${q}${i.customName || i.name || i.title || i.product?.name || "Special Item"}`;
      }
      return String(i || "");
    });
  }

  const category = item.thaliType || item.category || item.maincategory || "Special";

  return {
    id: mongoId,
    _id: mongoId,
    productId: mongoId,
    name: item.name ?? "Royal Feast Thali",
    title: item.name ?? "Royal Feast Thali",
    category,
    tagline: item.tagline ?? "Authentic traditional Indian thali experience",
    badge: item.badge ?? (discount ? "Bestseller Thali" : "Chef's Pick"),
    discount: discount || "",
    originalPrice,
    price,
    variantFinalPrice: price,
    variantName: "Full",
    serves: item.servingFor ? `${item.servingFor} Person${item.servingFor > 1 ? "s" : ""}` : (item.serves ?? "1-2 Persons"),
    prepTime: item.prepTime ?? "20-25 mins",
    rating: String(item.rating ?? "4.9"),
    reviews: String(item.reviews ?? "420"),
    image: item.image ?? item.pic ?? FALLBACK_IMAGE,
    description: item.description ?? "",
    items,
    popular: Boolean(item.popular || item.isAvailable),
  };
};

export function Thali() {
  const dispatch = useDispatch();
  const ThaliStateData = useSelector((state) => state.ThaliStateData);
  const { addToCart, updateQty, getQty, isInCart } = useCartWishlist();

  const [selectedCategory, setSelectedCategory] = useState("All Thalis");
  const [selectedThaliModal, setSelectedThaliModal] = useState(null);
  const [addedToast, setAddedToast] = useState(null);

  const catPrevRef = useRef(null);
  const catNextRef = useRef(null);

  // Load thalis from the store on first render
  useEffect(() => {
    dispatch(getThali());
  }, [dispatch]);

  // Use ThaliStateData when it has records, otherwise show the built-in thaliData
  const thalis = useMemo(() => {
    const list = Array.isArray(ThaliStateData) ? ThaliStateData : [];
    return list.length > 0 ? list.map(normalizeThali) : thaliData.map(normalizeThali);
  }, [ThaliStateData]);

  // Build category tabs from the categories present in the data
  const categories = useMemo(() => {
    const unique = [...new Set(thalis.map((t) => t.category))];
    return [
      { id: "All Thalis", label: "All Thalis", icon: "✨" },
      ...unique.map((cat) => ({
        id: cat,
        label: cat,
        icon: categoryIcons[cat] || "🍽️",
      })),
    ];
  }, [thalis]);

  const filteredThalis =
    selectedCategory === "All Thalis"
      ? thalis
      : thalis.filter((thali) => thali.category === selectedCategory);

  const handleInitialAdd = (e, thali) => {
    e.stopPropagation();
    addToCart(thali, 1);
    setAddedToast({
      name: thali.name,
      qty: 1,
      total: Number(thali.price).toFixed(2),
    });

    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  const handleQuantityChange = (e, thali, delta) => {
    e.stopPropagation();
    updateQty(thali, delta);
    const current = getQty(thali);
    const next = Math.max(0, current + delta);
    if (next > 0) {
      setAddedToast({
        name: thali.name,
        qty: next,
        total: (thali.price * next).toFixed(2),
      });
      setTimeout(() => setAddedToast(null), 3000);
    } else {
      setAddedToast({
        name: thali.name,
        qty: 0,
        total: "0.00",
      });
      setTimeout(() => setAddedToast(null), 2500);
    }
  };

  const handleModalAdd = (thali) => {
    const current = getQty(thali);
    if (current === 0) {
      addToCart(thali, 1);
    } else {
      updateQty(thali, 1);
    }
    const next = current + 1;
    setAddedToast({
      name: thali.name,
      qty: next,
      total: (thali.price * next).toFixed(2),
    });
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <section id="thali" className="py-12 sm:py-16 bg-gradient-to-b from-zinc-50 via-white to-rose-50/30 relative overflow-hidden">
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
            <span>Royal Thali Specials</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Curated{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Thalis
            </span>
          </h2>

          <p className="text-zinc-600 text-xs sm:text-sm mt-2.5 leading-relaxed max-w-2xl mx-auto">
            Complete pure vegetarian meals from every corner of India, plated by our master chefs. Each thali brings curries, breads, rice, sides, and a sweet finish, with up to <strong className="text-rose-600 font-bold">35% savings</strong> on every order.
          </p>
        </div>

        {/* =========================================================================
            SMOOTH SWIPER CATEGORY SLIDER FOR THALIS
        ========================================================================= */}
        <div className="relative mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Desktop Prev Button */}
            <button
              ref={catPrevRef}
              className="hidden sm:flex w-9 h-9 rounded-2xl bg-white hover:bg-rose-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-rose-600 shadow-2xs hover:shadow-md items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-20 cursor-pointer shrink-0 z-20"
              aria-label="Previous thali categories"
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
                    cat.id === "All Thalis"
                      ? thalis.length
                      : thalis.filter((t) => t.category === cat.id).length;

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
              aria-label="Next thali categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            THALI SHOWCASE GRID (Interactive Cards)
        ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredThalis.map((thali) => {
            const currentQty = getQty(thali);
            const savings = Math.max(0, thali.originalPrice - thali.price);

            return (
              <div
                key={thali.id}
                onClick={() => setSelectedThaliModal(thali)}
                className="bg-white rounded-3xl border border-zinc-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer select-none"
              >
                {/* Image Header with Badges */}
                <div className="relative h-32 sm:h-52 md:h-60 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={thali.image}
                    alt={thali.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Left: Authentic Green Veg Indicator */}
                  <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-md bg-white border border-emerald-600 flex items-center justify-center shadow-md p-0.5 z-10">
                    <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 inline-block" />
                  </div>

                  {/* Top Right: Discount Pill */}
                  <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[9px] sm:text-[11px] font-black tracking-wide shadow-md uppercase">
                    {thali.discount}
                  </div>

                  {/* Bottom: Badge & Rating on Image */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3.5 sm:right-3.5 flex items-center justify-between text-white text-[10px] sm:text-xs font-bold gap-1">
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 truncate max-w-[60%]">
                      {thali.badge}
                    </span>
                    <span className="ml-auto text-amber-300 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-white/20 text-[9px] sm:text-xs shrink-0">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                      <span>{thali.rating}</span>
                      <span className="hidden sm:inline text-white/80">({thali.reviews})</span>
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
                        <span className="truncate">{thali.serves}</span>
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{thali.prepTime}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-base lg:text-lg font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                      {thali.name}
                    </h3>
                    <p className="hidden sm:block text-[11px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                      {thali.description}
                    </p>

                    {/* Items Included Bullet Pills (Tablet & Laptop) */}
                    <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-100">
                      <div className="hidden sm:flex items-center justify-between text-[11px] font-black text-zinc-700 uppercase tracking-wider mb-2">
                        <span>Items in this Thali ({thali.items.length}):</span>
                        <span className="text-rose-600 font-bold lowercase flex items-center gap-0.5 group-hover:underline">
                          <span>view all</span>
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>

                      <ul className="hidden sm:block space-y-1.5 text-xs text-zinc-700">
                        {thali.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{typeof item === "string" ? item : (item?.customName || item?.name || "Special Item")}</span>
                          </li>
                        ))}
                        {thali.items.length > 3 && (
                          <li className="text-[11px] text-rose-600 font-bold pl-5">
                            + {thali.items.length - 3} more delicious sides &amp; treats
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
                          ₹{thali.price}
                        </span>
                        {savings > 0 && (
                          <span className="hidden sm:inline text-xs text-zinc-400 line-through leading-tight">
                            ₹{thali.originalPrice}
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
                        onClick={(e) => handleInitialAdd(e, thali)}
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
                          onClick={(e) => handleQuantityChange(e, thali, -1)}
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
                          onClick={(e) => handleQuantityChange(e, thali, 1)}
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
            CATERING & PARTY BULK THALI BANNER
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
              Order 100% pure vegetarian thali boxes in bulk for birthdays, office lunches, and family get-togethers, with special group pricing from Tastora.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <a
              href="/about#contact-section"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-rose-600/40 hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Enquire Bulk Thalis</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DETAILED THALI ITEMS MODAL
      ========================================================================= */}
      {selectedThaliModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 relative animate-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="relative h-52 w-full bg-zinc-100">
              <img
                src={selectedThaliModal.image}
                alt={selectedThaliModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedThaliModal(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3.5 left-5 right-5 text-white">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-black uppercase mb-1">
                  {selectedThaliModal.discount}
                </div>
                <h4 className="text-2xl font-black">{selectedThaliModal.name}</h4>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                {selectedThaliModal.description}
              </p>

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-600" />
                  <span>Complete Items Included in This Thali:</span>
                </h5>
                <ul className="space-y-2">
                  {selectedThaliModal.items.map((item, idx) => (
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
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Thali Special:</span>
                <div className="text-xl font-black text-zinc-900">
                  ₹{selectedThaliModal.price}
                </div>
              </div>
              <button
                onClick={() => {
                  handleModalAdd(selectedThaliModal);
                  setSelectedThaliModal(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Thali to Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Thali;