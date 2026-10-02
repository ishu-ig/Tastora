"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import useCartWishlist from "@/hooks/useCartWishlist";
import { Addtocart } from "@/Component/AddToCart";
import { getCombo } from "@/Redux/ActionCreators/ComboActionCreators";
import { getThali } from "@/Redux/ActionCreators/ThaliActionCreators";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Plus,
  Minus,
  Heart,
  Flame,
  Clock,
  ShoppingBag,
  Sparkles,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  RotateCcw,
  ShieldCheck,
  ArrowUpRight,
  Utensils,
  Award,
  CheckCircle2,
  Settings2,
  Eye,
} from "lucide-react";

// ==========================================
// 1. STATIC FALLBACK CATALOG (used only when the store has no data yet)
// ==========================================
export const combosCatalog = [
  {
    id: "combo-1",
    title: "Royal Maharaja Grand Thali",
    category: "royal-thalis",
    categoryLabel: "Royal Maharaja Thalis",
    servingSize: "solo", // solo, couple, family
    servingLabel: "Serves 1-2 Persons",
    itemCount: 8,
    price: 19.99,
    oldPrice: 24.99,
    discountPercent: 20,
    rating: 4.95,
    reviews: 340,
    prepTime: "20 min",
    calories: 920,
    spiceLevel: 2,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/royal-thali.jpg",
    shortDesc: "Imperial 8-dish brass feast: Shahi Paneer, Dal Makhani, Dum Biryani, 2 Naans, Raita & Gulab Jamun.",
    fullDesc:
      "Our flagship royal dining experience presented in authentic brassware. Includes Shahi Paneer Royale, 12-hour Dal Makhani, Seasonal Mix Veg, fragrant Saffron Dum Biryani, 2 Butter Naans, Boondi Raita, Roasted Papad, Pickles, and 2 Hot Gulab Jamuns.",
    itemsIncluded: [
      "Shahi Paneer Royale (180g)",
      "Dal Makhani Slow Simmered (180g)",
      "Seasonal Subz Kadhai (150g)",
      "Saffron Dum Biryani (200g)",
      "2× Fresh Butter Tandoori Naan",
      "Creamy Boondi Raita",
      "2× Warm Gulab Jamun with Pistachio",
      "Crisp Amritsari Papad & Chutney",
    ],
    customizable: true,
    customOptions: {
      breads: ["Butter Naan", "Garlic Naan", "Lachha Paratha", "Tandoori Roti"],
      beverages: ["Sweet Lassi", "Mango Lassi (+ $1.50)", "Masala Chaas", "None"],
      desserts: ["Gulab Jamun (2 pcs)", "Rasmalai (1 pc)", "Moong Dal Halwa"],
    },
    tags: ["Royal Heritage", "8 Dishes Included", "Top Bestseller"],
  },
  {
    id: "combo-2",
    title: "Executive Express Lunch Box",
    category: "lunch-box",
    categoryLabel: "Express Lunch Combos",
    servingSize: "solo",
    servingLabel: "Serves 1 Person",
    itemCount: 5,
    price: 13.99,
    oldPrice: 17.49,
    discountPercent: 20,
    rating: 4.85,
    reviews: 195,
    prepTime: "12 min",
    calories: 640,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/royal-thali.jpg",
    shortDesc: "Paneer Butter Masala, Yellow Dal Tadka, Jeera Rice, 2 Phulkas & Sweet.",
    fullDesc:
      "A wholesome, leak-proof compartment meal box crafted for office lunches and quick dining: Paneer Butter Masala, aromatic Yellow Dal Tadka, fluffy Jeera Basmati Rice, 2 Soft Desi Ghee Phulkas, fresh Kachumber salad, and a sweet Gulab Jamun.",
    itemsIncluded: [
      "Paneer Butter Masala (160g)",
      "Dhabe Wali Dal Tadka (160g)",
      "Steamed Jeera Basmati Rice (180g)",
      "2× Soft Whole Wheat Phulkas",
      "1× Warm Gulab Jamun",
      "Crisp Salad & Mint Chutney",
    ],
    customizable: true,
    customOptions: {
      breads: ["2 Soft Phulkas", "2 Butter Rotis", "1 Plain Naan"],
      beverages: ["Masala Chaas (+ $1.00)", "Sweet Lassi (+ $1.50)", "None"],
      desserts: ["Gulab Jamun (1 pc)", "Kheer (1 cup)"],
    },
    tags: ["Workplace Lunch", "Quick 12-Min Prep", "High Value"],
  },
  {
    id: "combo-3",
    title: "South Indian Tiffin Feast Platter",
    category: "regional-platters",
    categoryLabel: "Regional Specialties",
    servingSize: "couple",
    servingLabel: "Serves 1-2 Persons",
    itemCount: 6,
    price: 16.99,
    oldPrice: 21.99,
    discountPercent: 23,
    rating: 4.9,
    reviews: 160,
    prepTime: "15 min",
    calories: 580,
    spiceLevel: 2,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/masala-dosa.jpg",
    shortDesc: "Golden Mysore Masala Dosa, 2 Steamed Idlis, Medu Vada, Sambar & 3 Chutneys with Filter Coffee.",
    fullDesc:
      "A complete authentic South Indian banquet: 1 Crispy Mysore Butter Masala Dosa, 2 fluffy Steamed Idlis, 1 Golden Crispy Medu Vada, piping hot Drumstick Sambar, 3 fresh chutneys (Coconut, Tomato-Red Chili, Mint-Coriander), and traditional Madras Filter Coffee.",
    itemsIncluded: [
      "1× Mysore Masala Dosa (Ghee Roasted)",
      "2× Steamed Rice & Lentil Idlis",
      "1× Crunchy Medu Vada",
      "Hot Vegetable Drumstick Sambar (250ml)",
      "Trio of Chutneys (Coconut, Tomato, Mint)",
      "1× Authentic Madras Filter Coffee",
    ],
    customizable: true,
    customOptions: {
      breads: ["Mysore Masala Dosa", "Plain Paper Roast", "Onion Rava Dosa (+ $1.50)"],
      beverages: ["Hot Filter Coffee", "Masala Buttermilk", "Mango Lassi (+ $1.00)"],
      desserts: ["Rava Kesari (Halwa)", "Gulab Jamun (1 pc)"],
    },
    tags: ["South Indian Classic", "Includes Filter Coffee", "Crispy & Fresh"],
  },
  {
    id: "combo-4",
    title: "Indo-Chinese Dragon Platter",
    category: "regional-platters",
    categoryLabel: "Regional Specialties",
    servingSize: "couple",
    servingLabel: "Serves 2 Persons",
    itemCount: 4,
    price: 18.49,
    oldPrice: 23.99,
    discountPercent: 23,
    rating: 4.88,
    reviews: 215,
    prepTime: "18 min",
    calories: 780,
    spiceLevel: 3,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/chinese-noodles.jpg",
    shortDesc: "Wok Hakka Noodles, Fiery Chilli Paneer Gravy, 4 Crispy Spring Rolls & Schezwan Dip.",
    fullDesc:
      "A sizzling Indo-Chinese feast: Smoky Veg Hakka Noodles tossed in high flame, saucy Chilli Paneer with bell peppers, 4 Crispy Golden Vegetable Spring Rolls, house Schezwan sauce, and crisp fried noodles with sweet chili dip.",
    itemsIncluded: [
      "Wok-Tossed Veg Hakka Noodles (300g)",
      "Chilli Paneer Semi-Gravy (250g)",
      "4× Crispy Vegetable Spring Rolls",
      "House Schezwan Sauce & Sweet Chili Dip",
    ],
    customizable: true,
    customOptions: {
      breads: ["Veg Hakka Noodles", "Schezwan Fried Rice", "Burnt Garlic Noodles"],
      beverages: ["Iced Lemon Mint Tea", "Mango Shake (+ $1.50)", "None"],
      desserts: ["Fried Ice Cream (+ $2.00)", "Chocolate Lava Cake (+ $2.50)"],
    },
    tags: ["Spicy Wok", "4 Items Included", "Party Favorite"],
  },
  {
    id: "combo-5",
    title: "Mumbai Street Food Carnival Combo",
    category: "street-food-combos",
    categoryLabel: "Street Food Combos",
    servingSize: "couple",
    servingLabel: "Serves 2 Persons",
    itemCount: 4,
    price: 15.99,
    oldPrice: 19.99,
    discountPercent: 20,
    rating: 4.92,
    reviews: 180,
    prepTime: "15 min",
    calories: 720,
    spiceLevel: 3,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/pav-bhaji.jpg",
    shortDesc: "Butter Pav Bhaji (4 Pavs), 2 Chole Bhature, Crisp Papad & 2 Chilled Masala Chaas.",
    fullDesc:
      "The ultimate street craving: Rich buttery Mumbai Pav Bhaji served with 4 Amul butter toasted pavs, authentic dark Amritsari Chole with 2 balloon bhatures, pickled onions, fried green chilies, and 2 refreshing earthen-cup Masala Chaas.",
    itemsIncluded: [
      "Mumbai Butter Pav Bhaji (300g)",
      "4× Butter Toasted Pavs",
      "Amritsari Pindi Chole (250g)",
      "2× Golden Balloon Bhature",
      "2× Spiced Masala Chaas (200ml each)",
      "Pickled Onions & Fried Green Chilies",
    ],
    customizable: true,
    customOptions: {
      breads: ["4 Butter Pavs + 2 Bhature", "6 Extra Butter Pavs", "4 Bhatures"],
      beverages: ["2 Masala Chaas", "2 Sweet Lassis (+ $2.00)", "2 Rose Milks (+ $2.00)"],
      desserts: ["Gulab Jamun (2 pcs)", "Kesar Kulfi (+ $1.50)"],
    },
    tags: ["Street Food Duo", "Includes Chaas", "Full Meal for 2"],
  },
  {
    id: "combo-6",
    title: "Grand Family Mega Feast Box",
    category: "family-feasts",
    categoryLabel: "Family Feasts (Serves 4)",
    servingSize: "family",
    servingLabel: "Serves 3-4 Persons",
    itemCount: 12,
    price: 44.99,
    oldPrice: 59.99,
    discountPercent: 25,
    rating: 5.0,
    reviews: 410,
    prepTime: "25 min",
    calories: 1450,
    spiceLevel: 2,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/royal-thali.jpg",
    shortDesc: "Full family banquet: Paneer Tikka, Shahi Paneer, Dal Makhani, Subz Kadhai, Dum Biryani, 6 Naans, Raita & 4 Gulab Jamuns.",
    fullDesc:
      "Designed for grand weekend gatherings: Paneer Tikka charcoal skewers appetizer (8 pcs), Shahi Paneer Royale (Large), 12-hour Dal Makhani (Large), Kadhai Subz, Saffron Veg Dum Biryani (Family Handi), 6 Assorted Tandoori Breads (Garlic Naan, Butter Naan, Lachha Paratha), Cucumber-Mint Raita, 4 Hot Gulab Jamuns, and Papad with mint chutney.",
    itemsIncluded: [
      "Paneer Tikka Charcoal Starter (8 pcs)",
      "Large Shahi Paneer Royale (450g)",
      "Large 12-Hour Dal Makhani (450g)",
      "Large Seasonal Subz Kadhai (350g)",
      "Royal Dum Biryani Handi (600g)",
      "6× Assorted Tandoori Naans & Parathas",
      "Large Cucumber & Boondi Raita",
      "4× Warm Shahi Gulab Jamuns",
      "Basket of Papads, Chutneys & Onions",
    ],
    customizable: true,
    customOptions: {
      breads: ["Mix (2 Garlic Naan, 2 Butter Naan, 2 Lachha Paratha)", "6 Garlic Naans", "6 Butter Naans", "6 Tandoori Rotis"],
      beverages: ["4 Masala Chaas", "4 Mango Lassis (+ $4.00)", "4 Sweet Lassis (+ $3.00)"],
      desserts: ["4 Gulab Jamuns", "4 Rasmalais (+ $3.00)", "Mix (2 Gulab Jamun, 2 Rasmalai)"],
    },
    tags: ["Family Feast (4 Servings)", "Huge 25% Savings", "Complete 12-Item Feast"],
  },
  {
    id: "combo-7",
    title: "100% Pure Jain Heritage Thali",
    category: "royal-thalis",
    categoryLabel: "Royal Maharaja Thalis",
    servingSize: "solo",
    servingLabel: "Serves 1 Person",
    itemCount: 7,
    price: 17.99,
    oldPrice: 22.49,
    discountPercent: 20,
    rating: 4.94,
    reviews: 125,
    prepTime: "18 min",
    calories: 760,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: false,
    image: "/img/category/royal-thali.jpg",
    shortDesc: "Strictly No Onion, No Garlic, No Root Veg: Jain Paneer Butter Masala, Jain Yellow Dal, Jeera Rice, Rotis & Kheer.",
    fullDesc:
      "Carefully cooked following sacred Jain culinary rules: Rich cashew-tomato Jain Paneer, Yellow Moong Dal, Steamed Basmati Rice, 3 Whole Wheat Phulkas with pure ghee, Crisp Papad, Raw Banana Fry, and delicate Saffron Kheer.",
    itemsIncluded: [
      "Jain Paneer Butter Masala (No Onion/Garlic) 180g",
      "Jain Moong Dal Tadka (180g)",
      "Crispy Raw Banana Sukhi Bhaji (120g)",
      "Steamed Basmati Rice (180g)",
      "3× Pure Ghee Phulkas",
      "1× Cup Saffron Rice Kheer",
      "Jain Cucumber Salad & Roasted Papad",
    ],
    customizable: true,
    customOptions: {
      breads: ["3 Soft Ghee Phulkas", "2 Jain Butter Naans", "2 Plain Rotis"],
      beverages: ["Jain Sweet Lassi", "Jain Masala Buttermilk", "None"],
      desserts: ["Saffron Rice Kheer", "Jain Gulab Jamun (2 pcs)"],
    },
    tags: ["100% Jain Certified", "No Onion No Garlic", "Pure Ghee Prep"],
  },
  {
    id: "combo-8",
    title: "Punjabi Dhaba Tandoori Combo",
    category: "lunch-box",
    categoryLabel: "Express Lunch Combos",
    servingSize: "solo",
    servingLabel: "Serves 1 Person",
    itemCount: 5,
    price: 15.49,
    oldPrice: 19.49,
    discountPercent: 21,
    rating: 4.87,
    reviews: 150,
    prepTime: "15 min",
    calories: 810,
    spiceLevel: 3,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/paneer-tikka.jpg",
    shortDesc: "Paneer Tikka Masala, Dal Makhani, 2 Butter Garlic Naans, Jeera Rice & Chaas.",
    fullDesc:
      "A hearty rustic feast: Clay-oven charred Paneer Tikka simmered in thick spicy masala gravy, 12-hour Dal Makhani, 2 freshly rolled Butter Garlic Naans, Basmati Jeera Rice, and a glass of refreshing Spiced Chaas.",
    itemsIncluded: [
      "Paneer Tikka Masala Gravy (200g)",
      "Slow-Cooked Dal Makhani (180g)",
      "2× Fresh Garlic Butter Naans",
      "Basmati Jeera Rice (180g)",
      "1× Chilled Masala Chaas",
      "Dhaba Onion & Green Chutney",
    ],
    customizable: true,
    customOptions: {
      breads: ["2 Garlic Butter Naans", "2 Laccha Parathas", "2 Plain Naans"],
      beverages: ["Masala Chaas", "Sweet Lassi (+ $1.50)", "Mango Lassi (+ $1.50)"],
      desserts: ["Gulab Jamun (1 pc)", "Gajar Halwa (+ $1.50)"],
    },
    tags: ["Clay Tandoor", "Garlic Naan Special", "Hearty & Filling"],
  },
];

// Combo Categories (names & icons for known categories; new ones get a default icon)
export const comboCategories = [
  { id: "all", name: "All Combos", icon: "✨" },
  { id: "royal-thalis", name: "Royal Maharaja Thalis", icon: "👑" },
  { id: "lunch-box", name: "Express Lunch Combos", icon: "🍱" },
  { id: "family-feasts", name: "Family Feasts (3-4 Servings)", icon: "👨‍👩‍👧‍👦" },
  { id: "regional-platters", name: "Regional Specialties", icon: "🍛" },
  { id: "street-food-combos", name: "Street Food Combos", icon: "🫓" },
];

export const servingFilters = [
  { id: "all", label: "All Servings" },
  { id: "solo", label: "Solo (1 Person)" },
  { id: "couple", label: "Couple (2 Persons)" },
  { id: "family", label: "Family (3-4 Persons)" },
];

export const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: 999 },
  { id: "under-15", label: "Under $15", min: 0, max: 15 },
  { id: "15-25", label: "$15 – $25", min: 15, max: 25 },
  { id: "above-25", label: "Above $25 (Mega Feasts)", min: 25, max: 999 },
];

const typeTabs = [
  { id: "all", label: "All" },
  { id: "combo", label: "Combos" },
  { id: "thali", label: "Thalis" },
];

const sortOptions = [
  { id: "featured", label: "🔥 Most Popular" },
  { id: "rating", label: "⭐ Highest Rated" },
  { id: "discount", label: "🎉 Biggest Discount" },
  { id: "price-asc", label: "💵 Price: Low to High" },
  { id: "price-desc", label: "💎 Price: High to Low" },
];


const FALLBACK_IMAGE = "/img/category/royal-thali.jpg";
const PRICE_SLIDER_MIN = 10;
const WISHLIST_KEY = "tastora-combo-wishlist";

// ==========================================
// 2. HELPERS
// ==========================================
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// "1.4k" -> 1400, 340 -> 340
const toCount = (v) => {
  if (typeof v === "string" && /k$/i.test(v.trim())) return Math.round(parseFloat(v) * 1000) || 0;
  return toNumber(v);
};

const toList = (v) => {
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const qty = item.quantity && Number(item.quantity) > 1 ? `${item.quantity}x ` : "";
          const name = item.customName || item.name || item.title || item.product?.name || "Special Item";
          return `${qty}${name}`;
        }
        return String(item || "").trim();
      })
      .filter(Boolean);
  }
  if (typeof v === "string") return v.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  return [];
};

const slugify = (v) =>
  String(v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// "1-2 Persons" -> solo, "2 Persons" -> couple, "3-4 Persons" -> family
const deriveServingSize = (text) => {
  const nums = String(text || "").match(/\d+/g);
  if (!nums) return "solo";
  const min = Math.min(...nums.map(Number));
  if (min <= 1) return "solo";
  if (min === 2) return "couple";
  return "family";
};

// "Mango Lassi (+ $1.50)" -> 1.5
const extraFromLabel = (label) => {
  const m = /\+\s*\$?\s*(\d+(?:\.\d+)?)/.exec(label || "");
  return m ? Number(m[1]) : 0;
};

const money = (v) => `$${toNumber(v).toFixed(2)}`;
const isRemote = (src) => /^https?:\/\//.test(src || "");

// Converts a record from the store (or the static list) into the shape the page uses
const normalizeItem = (raw, index, type) => {
  const price = toNumber(raw.price ?? raw.finalPrice);
  const oldPrice = toNumber(raw.oldPrice ?? raw.originalPrice ?? raw.basePrice) || null;

  let discountPercent = toNumber(raw.discountPercent ?? parseInt(raw.discount, 10));
  if (!discountPercent && oldPrice && oldPrice > price) {
    discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  const itemsIncluded = toList(raw.itemsIncluded ?? raw.items);
  const rawCategory = raw.categoryLabel ?? raw.category ?? raw.maincategory ?? (type === "thali" ? "Thalis" : "Combos");
  const servingLabel = raw.servingLabel ?? (raw.serves ? `Serves ${raw.serves}` : "Serves 1 Person");
  const customOptions = raw.customOptions ?? null;

  return {
    id: `${type}:${raw.id ?? raw._id ?? index}`,
    type,
    title: raw.title ?? raw.name ?? "Untitled",
    category: raw.category && slugify(raw.category) === raw.category ? raw.category : slugify(rawCategory),
    categoryLabel: rawCategory,
    servingSize: raw.servingSize ?? deriveServingSize(servingLabel),
    servingLabel,
    itemCount: toNumber(raw.itemCount) || itemsIncluded.length,
    price,
    oldPrice,
    discountPercent,
    rating: toNumber(raw.rating) || 4.8,
    reviews: raw.reviews ?? 0,
    reviewCount: toCount(raw.reviews),
    prepTime: raw.prepTime ?? "15-20 min",
    calories: raw.calories ?? null,
    spiceLevel: toNumber(raw.spiceLevel) || 2,
    isJain: Boolean(raw.isJain),
    isGlutenFree: Boolean(raw.isGlutenFree),
    isChefSpecial: Boolean(raw.isChefSpecial),
    isBestseller: Boolean(raw.isBestseller ?? raw.popular),
    image: raw.image ?? raw.pic ?? FALLBACK_IMAGE,
    shortDesc: raw.shortDesc ?? raw.description ?? raw.tagline ?? "",
    fullDesc: raw.fullDesc ?? raw.description ?? raw.shortDesc ?? "",
    itemsIncluded,
    customizable: Boolean(raw.customizable ?? customOptions),
    customOptions,
    tags: toList(raw.tags),
  };
};

const staticCatalog = [];

const SpiceMeter = ({ level }) => (
  <span className="inline-flex items-center gap-0.5" title={`Spice level ${level} of 3`}>
    {[1, 2, 3].map((n) => (
      <Flame
        key={n}
        className={`w-3 h-3 ${n <= level ? "text-rose-500 fill-rose-500" : "text-zinc-300"}`}
      />
    ))}
  </span>
);

// ==========================================
// 3. COMBO CARD (grid + list layouts)
// ==========================================
function ComboCard({ combo, qty, isFav, isList, onToggleFav, onAdd, onChangeQty, onCustomize, onQuickView }) {
  return (
    <div
      className={`group bg-white rounded-2xl border border-zinc-200/90 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${isList ? "sm:flex-row" : ""
        }`}
    >
      {/* Card Image Banner */}
      <div
        className={`relative w-full overflow-hidden bg-zinc-100 shrink-0 ${isList ? "h-48 sm:h-auto sm:w-64 sm:min-h-[15rem]" : "h-48 sm:h-52"
          }`}
      >
        <Image
          src={combo.image}
          alt={combo.title}
          fill
          unoptimized={isRemote(combo.image)}
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {combo.discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs">
                {combo.discountPercent}% OFF
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
              {combo.servingLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFav(combo.id)}
            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${isFav ? "bg-rose-600 text-white shadow-md" : "bg-black/40 text-white hover:bg-black/60"
              }`}
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isFav}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Bottom Image Details (Rating & Prep time) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{combo.rating}</span>
            <span className="text-zinc-300">({combo.reviews})</span>
          </div>

          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[11px] font-medium">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{combo.prepTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onQuickView(combo)}
                className="text-left text-base font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug cursor-pointer"
              >
                {combo.title}
              </button>
              <SpiceMeter level={combo.spiceLevel} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                {combo.type === "thali" ? "Thali" : "Combo"}
              </span>
              {combo.isChefSpecial && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                  👑 Chef Special
                </span>
              )}
              {combo.isBestseller && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                  ⭐ Bestseller
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 font-medium">{combo.shortDesc}</p>
          </div>

          {/* Items Included */}
          <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-rose-800">
              <span>Includes {combo.itemCount} Items</span>
              {combo.isJain && (
                <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Jain Friendly
                </span>
              )}
            </div>
            <ul className="space-y-0.5">
              {combo.itemsIncluded.slice(0, 4).map((item, i) => (
                <li key={i} className="text-[11px] text-zinc-700 flex items-start gap-1 font-medium truncate">
                  <span className="text-rose-500 font-bold">•</span>
                  <span className="truncate">{typeof item === "string" ? item : (item?.customName || item?.name || "Special Item")}</span>
                </li>
              ))}
              {combo.itemsIncluded.length > 4 && (
                <li className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => onQuickView(combo)}
                    className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    + {combo.itemsIncluded.length - 4} more items &amp; accompaniments
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="px-4 pb-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] uppercase font-bold text-zinc-400 block">Total Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-zinc-900">{money(combo.price)}</span>
              {combo.oldPrice && (
                <span className="text-xs text-zinc-400 line-through font-semibold">{money(combo.oldPrice)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuickView(combo)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 transition-colors cursor-pointer"
              title="Quick view"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>

            {combo.customizable && (
              <button
                type="button"
                onClick={() => onCustomize(combo)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 transition-colors cursor-pointer"
                title="Customize bread, beverage & dessert"
                aria-label="Customize"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            {qty === 0 ? (
              <button
                type="button"
                onClick={() => onAdd(combo)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add {combo.type === "thali" ? "Thali" : "Combo"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-600 text-white rounded-xl px-2 py-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => onChangeQty(combo, -1)}
                  className="w-6 h-6 rounded-lg bg-rose-700 hover:bg-rose-800 flex items-center justify-center cursor-pointer font-black"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-black min-w-[14px] text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => onChangeQty(combo, 1)}
                  className="w-6 h-6 rounded-lg bg-rose-700 hover:bg-rose-800 flex items-center justify-center cursor-pointer font-black"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. PAGE
// ==========================================
export default function CombosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const urlTypeFilter = searchParams.get("type");
  const dispatch = useDispatch();
  const ComboStateData = useSelector((state) => state.ComboStateData);
  const ThaliStateData = useSelector((state) => state.ThaliStateData);
  const { cartCount, cartTotal, clearCart } = useCartWishlist();

  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const searchQuery = urlSearchQuery;
  const typeFilter = ["combo", "thali"].includes(urlTypeFilter) ? urlTypeFilter : "all";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServing, setSelectedServing] = useState("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState("all");
  const [priceCap, setPriceCap] = useState(null); // null = no limit
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  // Dietary filters
  const [filterJainOnly, setFilterJainOnly] = useState(false);
  const [filterChefSpecialOnly, setFilterChefSpecialOnly] = useState(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState(false);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Cart lines: key -> { comboId, qty, unitPrice, custom }
  const [cartLines, setCartLines] = useState({});
  const [wishlist, setWishlist] = useState({});
  const wishlistLoaded = useRef(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  // Modals
  const [quickViewCombo, setQuickViewCombo] = useState(null);
  const [activeCustomCombo, setActiveCustomCombo] = useState(null);
  const [customBread, setCustomBread] = useState("");
  const [customBeverage, setCustomBeverage] = useState("");
  const [customDessert, setCustomDessert] = useState("");
  const [customSpice, setCustomSpice] = useState(2);
  const [customSpecialInstructions, setCustomSpecialInstructions] = useState("");

  // ------------------------------------------
  // DATA: load from the store, fall back to the static list
  // ------------------------------------------
  useEffect(() => {
    dispatch(getCombo());
    dispatch(getThali());
  }, [dispatch]);

  const catalog = useMemo(() => {
    const combos = Array.isArray(ComboStateData) ? ComboStateData : [];
    const thalis = Array.isArray(ThaliStateData) ? ThaliStateData : [];
    if (combos.length === 0 && thalis.length === 0) return [];
    return [
      ...combos.map((c, i) => normalizeItem(c, i, "combo")),
      ...thalis.map((t, i) => normalizeItem(t, i, "thali")),
    ];
  }, [ComboStateData, ThaliStateData]);

  const catalogById = useMemo(() => {
    const map = {};
    catalog.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [catalog]);

  const priceCeiling = useMemo(() => {
    const max = Math.max(0, ...catalog.map((c) => c.price));
    return Math.max(60, Math.ceil(max / 10) * 10);
  }, [catalog]);
  const effectiveCap = priceCap ?? priceCeiling;

  // Items that match the selected type (drives category tabs and counts)
  const typeScoped = useMemo(
    () => (typeFilter === "all" ? catalog : catalog.filter((c) => c.type === typeFilter)),
    [catalog, typeFilter]
  );

  const categories = useMemo(() => {
    const seen = new Map();
    typeScoped.forEach((c) => {
      if (!seen.has(c.category)) {
        const known = comboCategories.find((k) => k.id === c.category);
        seen.set(c.category, {
          id: c.category,
          name: known?.name ?? c.categoryLabel,
          icon: known?.icon ?? "🍽️",
        });
      }
    });
    return [{ id: "all", name: "All Combos & Thalis", icon: "✨" }, ...seen.values()];
  }, [typeScoped]);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;

  // ------------------------------------------
  // SIDE EFFECTS
  // ------------------------------------------
  // Escape closes modals + lock page scroll while one is open
  const anyModalOpen = mobileFilterOpen || Boolean(activeCustomCombo) || Boolean(quickViewCombo);
  useEffect(() => {
    if (!anyModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileFilterOpen(false);
        setActiveCustomCombo(null);
        setQuickViewCombo(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [anyModalOpen]);

  // Wishlist persists across visits
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      /* ignore storage errors */
    }
    wishlistLoaded.current = true;
  }, []);
  useEffect(() => {
    if (!wishlistLoaded.current) return;
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      /* ignore storage errors */
    }
  }, [wishlist]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3000);
  };

  // ------------------------------------------
  // FILTERING & SORTING
  // ------------------------------------------
  const filteredCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return typeScoped
      .filter((combo) => {
        if (q) {
          const hit =
            combo.title.toLowerCase().includes(q) ||
            combo.shortDesc.toLowerCase().includes(q) ||
            combo.tags.some((t) => t.toLowerCase().includes(q)) ||
            combo.itemsIncluded.some((item) =>
              (typeof item === "string" ? item : (item?.customName || item?.name || "")).toLowerCase().includes(q)
            );
          if (!hit) return false;
        }
        if (selectedCategory !== "all" && combo.category !== selectedCategory) return false;
        if (selectedServing !== "all" && combo.servingSize !== selectedServing) return false;
        if (selectedPriceTier !== "all") {
          const tier = priceRanges.find((p) => p.id === selectedPriceTier);
          if (tier && (combo.price < tier.min || combo.price > tier.max)) return false;
        }
        if (combo.price > effectiveCap) return false;
        if (filterJainOnly && !combo.isJain) return false;
        if (filterChefSpecialOnly && !combo.isChefSpecial) return false;
        if (filterBestsellerOnly && !combo.isBestseller) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "discount") return b.discountPercent - a.discountPercent;
        // featured: bestsellers first, then most reviewed
        return Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount;
      });
  }, [
    typeScoped,
    searchQuery,
    selectedCategory,
    selectedServing,
    selectedPriceTier,
    effectiveCap,
    filterJainOnly,
    filterChefSpecialOnly,
    filterBestsellerOnly,
    sortBy,
  ]);

  // Active filter chips (each can be removed on its own)
  const activeChips = [
    typeFilter !== "all" && {
      key: "type",
      label: typeTabs.find((t) => t.id === typeFilter)?.label,
      clear: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        const query = params.toString();
        router.replace(query ? `/combos?${query}` : "/combos", { scroll: false });
        setSelectedCategory("all");
      },
    },
    selectedCategory !== "all" && { key: "cat", label: categoryName(selectedCategory), clear: () => setSelectedCategory("all") },
    selectedServing !== "all" && {
      key: "serving",
      label: servingFilters.find((s) => s.id === selectedServing)?.label,
      clear: () => setSelectedServing("all"),
    },
    selectedPriceTier !== "all" && {
      key: "tier",
      label: priceRanges.find((p) => p.id === selectedPriceTier)?.label,
      clear: () => setSelectedPriceTier("all"),
    },
    priceCap !== null && { key: "cap", label: `Up to $${priceCap}`, clear: () => setPriceCap(null) },
    filterJainOnly && { key: "jain", label: "Jain Friendly", clear: () => setFilterJainOnly(false) },
    filterChefSpecialOnly && { key: "chef", label: "Chef Specials", clear: () => setFilterChefSpecialOnly(false) },
    filterBestsellerOnly && { key: "best", label: "Bestsellers", clear: () => setFilterBestsellerOnly(false) },
    searchQuery.trim() && { key: "search", label: `"${searchQuery.trim()}"`, clear: () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      const query = params.toString();
      router.replace(query ? `/combos?${query}` : "/combos", { scroll: false });
    } },
  ].filter(Boolean);
  const activeFiltersCount = activeChips.length;

  const resetAllFilters = () => {
    router.replace("/combos", { scroll: false });
    setSelectedCategory("all");
    setSelectedServing("all");
    setSelectedPriceTier("all");
    setPriceCap(null);
    setFilterJainOnly(false);
    setFilterChefSpecialOnly(false);
    setFilterBestsellerOnly(false);
    setSortBy("featured");
  };

  const handleTypeChange = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("type");
    else params.set("type", id);
    const query = params.toString();
    router.replace(query ? `/combos?${query}` : "/combos", { scroll: false });
    setSelectedCategory("all");
  };

  // ------------------------------------------
  // CART
  // ------------------------------------------
  const addLine = (combo, custom = null, extra = 0, quantity = 1) => {
    const key = custom ? `${combo.id}::${JSON.stringify(custom)}` : `${combo.id}::plain`;
    setCartLines((prev) => {
      const line = prev[key];
      return {
        ...prev,
        [key]: {
          comboId: combo.id,
          qty: (line?.qty || 0) + quantity,
          unitPrice: combo.price + extra,
          custom,
        },
      };
    });
  };

  const handleAddToCart = (combo) => {
    addLine(combo);
    showToast(`Added "${combo.title}" to your order!`);
  };

  // + adds a plain item; - removes from the plain line first, then any customized line
  const handleChangeQty = (combo, delta) => {
    if (delta > 0) {
      addLine(combo);
      return;
    }
    setCartLines((prev) => {
      const plainKey = `${combo.id}::plain`;
      const key = prev[plainKey] ? plainKey : Object.keys(prev).find((k) => prev[k].comboId === combo.id);
      if (!key) return prev;
      const next = { ...prev };
      if (next[key].qty <= 1) delete next[key];
      else next[key] = { ...next[key], qty: next[key].qty - 1 };
      return next;
    });
  };

  const qtyByCombo = useMemo(() => {
    const totals = {};
    Object.values(cartLines).forEach((l) => {
      totals[l.comboId] = (totals[l.comboId] || 0) + l.qty;
    });
    return totals;
  }, [cartLines]);

  const handleClearCart = () => {
    clearCart();
    setCartLines({});
  };

  const comboCartCount = Object.values(cartLines).reduce((sum, l) => sum + l.qty, 0);
  const comboCartTotal = Object.values(cartLines).reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const totalCartCount = cartCount + comboCartCount;
  const totalCartAmount = cartTotal + comboCartTotal;

  // ------------------------------------------
  // CUSTOMIZER
  // ------------------------------------------
  const handleOpenCustomizer = (combo) => {
    setQuickViewCombo(null);
    setActiveCustomCombo(combo);
    setCustomBread(combo.customOptions?.breads?.[0] || "");
    setCustomBeverage(combo.customOptions?.beverages?.[0] || "");
    setCustomDessert(combo.customOptions?.desserts?.[0] || "");
    setCustomSpice(combo.spiceLevel || 2);
    setCustomSpecialInstructions("");
  };

  const customExtra =
    extraFromLabel(customBread) + extraFromLabel(customBeverage) + extraFromLabel(customDessert);

  const handleSaveCustomCombo = () => {
    if (!activeCustomCombo) return;
    addLine(
      activeCustomCombo,
      {
        bread: customBread,
        beverage: customBeverage,
        dessert: customDessert,
        spice: customSpice,
        notes: customSpecialInstructions.trim(),
      },
      customExtra
    );
    showToast(`Customized "${activeCustomCombo.title}" added to order!`);
    setActiveCustomCombo(null);
  };

  const toggleFav = (id) => setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 pt-56 sm:pt-52 md:pt-44 lg:pt-40 pb-20 overflow-x-hidden">
      {/* TOAST */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-zinc-700 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 mt-1 sm:mt-2">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1.5">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/menu" className="hover:text-rose-600 transition-colors">
                Menu
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-rose-600 font-bold">Royal Combos &amp; Thalis</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <span>Royal Combos</span>
                <span className="text-rose-600">&amp; Grand Thalis</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Save up to {Math.max(25, ...catalog.map((c) => c.discountPercent))}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              Curated multi-course vegetarian feasts, executive lunch boxes, and mega family platters at Tastora.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <Link
              href="/menu"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:border-rose-300 text-zinc-700 text-xs font-bold shadow-2xs transition-all"
            >
              <Utensils className="w-3.5 h-3.5 text-rose-600" />
              <span>Full A La Carte Menu</span>
            </Link>

            <Link
              href="/reserve"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>Reserve a Table</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SEARCH & TOOLBAR */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-zinc-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Sort, view mode, mobile filters */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold cursor-pointer shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer shadow-2xs"
                >
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center bg-zinc-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-rose-600 shadow-2xs" : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "list" ? "bg-white text-rose-600 shadow-2xs" : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* MAIN: SIDEBAR + RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 lg:self-start lg:sticky lg:top-36">
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-2xs space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
                    Filters &amp; Preferences
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Categories</span>
                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count =
                      cat.id === "all" ? typeScoped.length : typeScoped.filter((c) => c.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer border ${isSelected
                          ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold border-transparent shadow-md shadow-rose-600/25 scale-[1.01]"
                          : "bg-zinc-50/80 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border-zinc-200/70 hover:border-rose-200 shadow-2xs"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform duration-200 group-hover:scale-110 ${isSelected ? "bg-white/20 text-white backdrop-blur-xs" : "bg-rose-100/60 text-zinc-800"
                              }`}
                          >
                            {cat.icon}
                          </span>
                          <span className="truncate font-bold">{cat.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black transition-colors ${isSelected
                            ? "bg-white/25 text-white"
                            : "bg-zinc-200/70 group-hover:bg-rose-200/60 text-zinc-600 group-hover:text-rose-800"
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Serving size */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Serving Size</span>
                <div className="space-y-1">
                  {servingFilters.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServing(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${selectedServing === s.id
                        ? "bg-rose-50 border border-rose-200 text-rose-900 font-bold"
                        : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                    >
                      <span>{s.label}</span>
                      {selectedServing === s.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Dietary &amp; Badges
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterJainOnly}
                      onChange={(e) => setFilterJainOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300"
                    />
                    <span>100% Jain Friendly (No Onion/Garlic)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterChefSpecialOnly}
                      onChange={(e) => setFilterChefSpecialOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300"
                    />
                    <span>👑 Chef Specials Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterBestsellerOnly}
                      onChange={(e) => setFilterBestsellerOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300"
                    />
                    <span>⭐ Top Bestsellers</span>
                  </label>
                </div>
              </div>

              {/* Price tiers */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Price Budget</span>
                <div className="space-y-1">
                  {priceRanges.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriceTier(p.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${selectedPriceTier === p.id
                        ? "bg-rose-50 border border-rose-200 text-rose-900 font-bold"
                        : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                    >
                      <span>{p.label}</span>
                      {selectedPriceTier === p.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max price slider */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <label htmlFor="max-price" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-rose-600">${effectiveCap}</span>
                </div>
                <input
                  id="max-price"
                  type="range"
                  min={PRICE_SLIDER_MIN}
                  max={priceCeiling}
                  step="2"
                  value={effectiveCap}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPriceCap(v >= priceCeiling ? null : v);
                  }}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>${PRICE_SLIDER_MIN}</span>
                  <span>${priceCeiling}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-rose-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span>Grand Feast Value Guarantee</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Every combo is freshly prepared upon order with premium dairy paneer, pure desi ghee, and royal spices.
                </p>
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <main className="lg:col-span-9 space-y-4">
            {/* Type tabs + count */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center bg-zinc-100 p-1 rounded-xl" role="tablist" aria-label="Item type">
                {typeTabs.map((t) => {
                  const count = t.id === "all" ? catalog.length : catalog.filter((c) => c.type === t.id).length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={typeFilter === t.id}
                      onClick={() => handleTypeChange(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${typeFilter === t.id ? "bg-white text-rose-600 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"
                        }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] font-black text-zinc-400">{count}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-sm font-black text-zinc-900" aria-live="polite">
                {filteredCombos.length} {filteredCombos.length === 1 ? "Item" : "Items"} Available
              </span>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-zinc-500 hover:text-rose-600 font-bold underline cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Zero results */}
            {filteredCombos.length === 0 && (
              <div className="bg-white rounded-3xl p-10 border border-zinc-200/80 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <Utensils className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-zinc-900">No Items Match Your Filters</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Try adjusting the serving size, price range, or search term to discover our other royal platters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Cards */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
              {filteredCombos.map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  qty={qtyByCombo[combo.id] || 0}
                  isFav={Boolean(wishlist[combo.id])}
                  isList={viewMode === "list"}
                  onToggleFav={toggleFav}
                  onAdd={handleAddToCart}
                  onChangeQty={handleChangeQty}
                  onCustomize={handleOpenCustomizer}
                  onQuickView={setQuickViewCombo}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes comboSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes comboSheetFade { from { opacity: 0; } to { opacity: 1; } }
            .combo-sheet-panel { animation: comboSheetUp 320ms cubic-bezier(0.32, 0.72, 0, 1) both; }
            .combo-sheet-backdrop { animation: comboSheetFade 200ms ease-out both; }
          `,
        }}
      />
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xs lg:hidden combo-sheet-backdrop"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full max-h-[88vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden combo-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <span className="w-10 h-1 rounded-full bg-zinc-300" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-2 space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-black text-zinc-900">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-zinc-400">Type</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {typeTabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${typeFilter === t.id
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase text-zinc-400">Categories</span>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${isSelected
                          ? "bg-rose-600 border-rose-600 text-white shadow-2xs"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Serving */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase text-zinc-400">Serving Size</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {servingFilters.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServing(s.id)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${selectedServing === s.id
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase text-zinc-400">Preferences</span>
                <div className="space-y-2 text-xs font-semibold">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterJainOnly}
                      onChange={(e) => setFilterJainOnly(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>100% Jain Friendly</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterChefSpecialOnly}
                      onChange={(e) => setFilterChefSpecialOnly(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Chef Specials Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterBestsellerOnly}
                      onChange={(e) => setFilterBestsellerOnly(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Top Bestsellers</span>
                  </label>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase text-zinc-400">Price Budget</span>
                <div className="space-y-1">
                  {priceRanges.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriceTier(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${selectedPriceTier === p.id
                        ? "bg-rose-50 border border-rose-200 text-rose-900 font-bold"
                        : "bg-zinc-50 text-zinc-700"
                        }`}
                    >
                      <span>{p.label}</span>
                      {selectedPriceTier === p.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label htmlFor="max-price-mobile" className="text-xs font-bold uppercase text-zinc-400">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-rose-600">${effectiveCap}</span>
                </div>
                <input
                  id="max-price-mobile"
                  type="range"
                  min={PRICE_SLIDER_MIN}
                  max={priceCeiling}
                  step="2"
                  value={effectiveCap}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPriceCap(v >= priceCeiling ? null : v);
                  }}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="shrink-0 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-zinc-100 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Show {filteredCombos.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewCombo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setQuickViewCombo(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={quickViewCombo.title}
          >
            <div className="relative h-52 w-full bg-zinc-100">
              <Image
                src={quickViewCombo.image}
                alt={quickViewCombo.title}
                fill
                sizes="512px"
                unoptimized={isRemote(quickViewCombo.image)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setQuickViewCombo(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3.5 left-5 right-5 text-white">
                {quickViewCombo.discountPercent > 0 && (
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-black uppercase mb-1">
                    {quickViewCombo.discountPercent}% OFF
                  </div>
                )}
                <h4 className="text-2xl font-black">{quickViewCombo.title}</h4>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[45vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-zinc-600">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {quickViewCombo.rating} ({quickViewCombo.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  {quickViewCombo.prepTime}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <SpiceMeter level={quickViewCombo.spiceLevel} />
                </span>
                {quickViewCombo.calories && <span>{quickViewCombo.calories} kcal</span>}
                <span>{quickViewCombo.servingLabel}</span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-medium">{quickViewCombo.fullDesc}</p>

              {quickViewCombo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {quickViewCombo.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2">
                  What&apos;s Included ({quickViewCombo.itemsIncluded.length})
                </h5>
                <ul className="space-y-1.5">
                  {quickViewCombo.itemsIncluded.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-800"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span className="font-semibold">{typeof item === "string" ? item : (item?.customName || item?.name || "Special Item")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Special Price</span>
                <div className="text-xl font-black text-zinc-900">{money(quickViewCombo.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                {quickViewCombo.customizable && (
                  <button
                    type="button"
                    onClick={() => handleOpenCustomizer(quickViewCombo)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-rose-300 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(quickViewCombo);
                    setQuickViewCombo(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZER MODAL */}
      {activeCustomCombo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveCustomCombo(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-zinc-100 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Customize ${activeCustomCombo.title}`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">{activeCustomCombo.title}</h3>
                  <p className="text-xs text-rose-600 font-bold">Customize Your Feast Pairing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomCombo(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer"
                aria-label="Close customizer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {[
              { label: "Select Indian Bread / Roti Choice *", list: activeCustomCombo.customOptions?.breads, value: customBread, set: setCustomBread },
              { label: "Select Beverage / Lassi Pairing", list: activeCustomCombo.customOptions?.beverages, value: customBeverage, set: setCustomBeverage },
              { label: "Sweet / Dessert Choice", list: activeCustomCombo.customOptions?.desserts, value: customDessert, set: setCustomDessert },
            ].map(
              (group) =>
                group.list && (
                  <div key={group.label} className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                      {group.label}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {group.list.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => group.set(opt)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${group.value === opt
                            ? "bg-rose-50 border-rose-500 text-rose-900 shadow-2xs"
                            : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Spice Level Preference
              </span>
              <div className="flex items-center gap-2">
                {[
                  { level: 1, label: "Mild" },
                  { level: 2, label: "Medium Spicy" },
                  { level: 3, label: "Fiery Hot" },
                ].map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setCustomSpice(s.level)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${customSpice === s.level
                      ? "bg-rose-600 border-rose-600 text-white shadow-2xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="kitchen-notes" className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Kitchen Notes (Optional)
              </label>
              <input
                id="kitchen-notes"
                type="text"
                value={customSpecialInstructions}
                onChange={(e) => setCustomSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra crisp papad, less oil in dal..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total</span>
                <span className="text-lg font-black text-zinc-900">{money(activeCustomCombo.price + customExtra)}</span>
                {customExtra > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Includes +{money(customExtra)} for upgrades
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveCustomCombo}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                Add Customized Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Addtocart
        totalCartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        onClearCart={handleClearCart}
      />
    </div>
  );
}