"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Zap,
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
  Tag,
  DollarSign,
  Users,
  Award,
  Share2,
  CheckCircle2,
  Settings2,
} from "lucide-react";

// ==========================================
// 1. COMPREHENSIVE COMBOS & THALIS DATABASE
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

// Combo Categories for Filtering
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

export default function CombosPage() {
  // ------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServing, setSelectedServing] = useState("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState("all");
  const [maxPriceSlider, setMaxPriceSlider] = useState(60);
  const [sortBy, setSortBy] = useState("featured"); // featured, price-asc, price-desc, rating, discount
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Dietary Filters
  const [filterJainOnly, setFilterJainOnly] = useState(false);
  const [filterChefSpecialOnly, setFilterChefSpecialOnly] = useState(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState(false);

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Cart & Wishlist
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  // Customizer Modal State
  const [activeCustomCombo, setActiveCustomCombo] = useState(null);
  const [customBread, setCustomBread] = useState("");
  const [customBeverage, setCustomBeverage] = useState("");
  const [customDessert, setCustomDessert] = useState("");
  const [customSpice, setCustomSpice] = useState(2);
  const [customSpecialInstructions, setCustomSpecialInstructions] = useState("");

  // Search & Trending Autocomplete State
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const trendingKeywords = [
    "Maharaja Thali",
    "Lunch Box",
    "Dosa Platter",
    "Family Feast",
    "Jain Special",
    "Street Food",
    "Paneer Tikka",
  ];

  // Click outside to close search dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Quick Notification Toast
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // ------------------------------------------
  // FILTERING & SORTING ENGINE
  // ------------------------------------------
  const filteredCombos = useMemo(() => {
    return combosCatalog
      .filter((combo) => {
        // 1. Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = combo.title.toLowerCase().includes(q);
          const matchDesc = combo.shortDesc.toLowerCase().includes(q);
          const matchTags = combo.tags.some((t) => t.toLowerCase().includes(q));
          const matchItems = combo.itemsIncluded.some((item) => item.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags && !matchItems) return false;
        }

        // 2. Category filter
        if (selectedCategory !== "all" && combo.category !== selectedCategory) {
          return false;
        }

        // 3. Serving size filter
        if (selectedServing !== "all" && combo.servingSize !== selectedServing) {
          return false;
        }

        // 4. Price tier filter
        if (selectedPriceTier !== "all") {
          const tier = priceRanges.find((p) => p.id === selectedPriceTier);
          if (tier && (combo.price < tier.min || combo.price > tier.max)) {
            return false;
          }
        }

        // 5. Price slider
        if (combo.price > maxPriceSlider) {
          return false;
        }

        // 6. Dietary toggles
        if (filterJainOnly && !combo.isJain) return false;
        if (filterChefSpecialOnly && !combo.isChefSpecial) return false;
        if (filterBestsellerOnly && !combo.isBestseller) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "discount") return (b.discountPercent || 0) - (a.discountPercent || 0);
        return 0; // Default: featured order
      });
  }, [
    searchQuery,
    selectedCategory,
    selectedServing,
    selectedPriceTier,
    maxPriceSlider,
    filterJainOnly,
    filterChefSpecialOnly,
    filterBestsellerOnly,
    sortBy,
  ]);

  // Active filters count
  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedServing !== "all" ? 1 : 0) +
    (selectedPriceTier !== "all" ? 1 : 0) +
    (maxPriceSlider < 60 ? 1 : 0) +
    (filterJainOnly ? 1 : 0) +
    (filterChefSpecialOnly ? 1 : 0) +
    (filterBestsellerOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedServing("all");
    setSelectedPriceTier("all");
    setMaxPriceSlider(60);
    setFilterJainOnly(false);
    setFilterChefSpecialOnly(false);
    setFilterBestsellerOnly(false);
    setSortBy("featured");
  };

  // Add To Cart Handlers
  const handleAddToCart = (combo) => {
    setCartItems((prev) => ({
      ...prev,
      [combo.id]: (prev[combo.id] || 0) + 1,
    }));
    showToast(`Added "${combo.title}" to your order cart!`);
  };

  const handleUpdateQty = (comboId, delta) => {
    setCartItems((prev) => {
      const current = prev[comboId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[comboId];
        return copy;
      }
      return { ...prev, [comboId]: next };
    });
  };

  // Open Customizer Modal
  const handleOpenCustomizer = (combo) => {
    setActiveCustomCombo(combo);
    setCustomBread(combo.customOptions?.breads?.[0] || "");
    setCustomBeverage(combo.customOptions?.beverages?.[0] || "");
    setCustomDessert(combo.customOptions?.desserts?.[0] || "");
    setCustomSpice(combo.spiceLevel || 2);
    setCustomSpecialInstructions("");
  };

  const handleSaveCustomCombo = () => {
    if (!activeCustomCombo) return;
    setCartItems((prev) => ({
      ...prev,
      [activeCustomCombo.id]: (prev[activeCustomCombo.id] || 0) + 1,
    }));
    showToast(`Customized "${activeCustomCombo.title}" added to order!`);
    setActiveCustomCombo(null);
  };

  const totalCartCount = Object.values(cartItems).reduce((sum, q) => sum + q, 0);

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 pt-56 sm:pt-52 md:pt-44 lg:pt-40 pb-20 overflow-x-hidden">
      {/* ------------------------------------------
          TOAST NOTIFICATION BANNER
      ------------------------------------------ */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-zinc-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ------------------------------------------
          HEADER & HERO SECTION
      ------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 mt-1 sm:mt-2">
        {/* Breadcrumb & Top Bar */}
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
                Save up to 25%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              Curated multi-course vegetarian feasts, executive lunch boxes, and mega family platters at Tastora.
            </p>
          </div>

          {/* Quick Cart / Links */}
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

        {/* ------------------------------------------
            SEARCH & TOOLBAR BAR (Enhanced With Autocomplete & Quick Tags)
        ------------------------------------------ */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-zinc-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Bar with Live Suggestions Dropdown */}
            <div className="relative w-full md:max-w-md" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <Search
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                    searchFocused ? "text-rose-600" : "text-zinc-400"
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchFocused(false);
                      searchInputRef.current?.blur();
                    }
                  }}
                  placeholder="Search thalis, combos, dishes, ingredients..."
                  className={`w-full pl-9 pr-16 py-2.5 rounded-xl text-xs font-medium bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 placeholder-zinc-400 border transition-all ${
                    searchFocused
                      ? "border-rose-500 ring-2 ring-rose-500/20 shadow-sm"
                      : "border-zinc-200"
                  }`}
                />

                {/* Right controls inside input */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {searchQuery && (
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/70">
                      {filteredCombos.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-zinc-200 shadow-xl p-3 z-30 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {searchQuery.trim() ? (
                    /* Search Matches Preview */
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 text-[11px] font-bold text-zinc-500">
                        <span>Matching Combos ({filteredCombos.length})</span>
                        <span className="text-[10px] text-zinc-400">Press Esc to close</span>
                      </div>

                      {filteredCombos.length > 0 ? (
                        <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pt-1">
                          {filteredCombos.slice(0, 4).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSearchQuery(item.title);
                                setSearchFocused(false);
                              }}
                              className="w-full text-left p-1.5 rounded-xl hover:bg-rose-50/70 transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-zinc-900 group-hover:text-rose-600 truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 truncate">{item.servingLabel}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-rose-600">${item.price}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-zinc-500">
                          <p className="font-bold text-zinc-700">No combos found for &quot;{searchQuery}&quot;</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Try searching for Thali, Lunch, or Dosa</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Trending Queries */
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        <span>Trending Feasts &amp; Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {trendingKeywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => {
                              setSearchQuery(kw);
                              setSearchFocused(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Action Tools (Sort, Serving, View Mode, Mobile Filter Button) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
            {/* Mobile Filter Drawer Trigger */}
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

            {/* Sort Selector */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer shadow-2xs"
              >
                <option value="featured">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="discount">🎉 Biggest Discount</option>
                <option value="price-asc">💵 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-zinc-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-rose-600 shadow-2xs" : "text-zinc-400 hover:text-zinc-700"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-rose-600 shadow-2xs" : "text-zinc-400 hover:text-zinc-700"
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Popular Keywords Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-2 border-t border-zinc-100">
            <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Quick:
            </span>
            {["Maharaja Thali", "Lunch Box", "Dosa Platter", "Family Feast", "Jain", "Pav Bhaji", "Tandoori"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  searchQuery === tag
                    ? "bg-rose-600 border-rose-600 text-white shadow-2xs"
                    : "bg-zinc-50 hover:bg-rose-50 border-zinc-200/80 text-zinc-600 hover:border-rose-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------
            MAIN CONTENT (SIDEBAR FILTERS + COMBO GRID)
        ------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ------------------------------------------
              DESKTOP LEFT SIDEBAR FILTERS (3 Cols)
          ------------------------------------------ */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-2xs space-y-5">
              {/* Filter Header & Reset */}
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

              {/* 1. Combo Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Combo Categories
                </label>
                <div className="space-y-1.5">
                  {comboCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count =
                      cat.id === "all"
                        ? combosCatalog.length
                        : combosCatalog.filter((c) => c.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer border ${
                          isSelected
                            ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold border-transparent shadow-md shadow-rose-600/25 scale-[1.01]"
                            : "bg-zinc-50/80 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border-zinc-200/70 hover:border-rose-200 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isSelected
                                ? "bg-white/20 text-white backdrop-blur-xs"
                                : "bg-rose-100/60 text-zinc-800"
                            }`}
                          >
                            {cat.icon}
                          </span>
                          <span className="truncate font-bold">{cat.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black transition-colors ${
                            isSelected
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

              {/* 2. Serving Size Filter */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Serving Size
                </label>
                <div className="space-y-1">
                  {servingFilters.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServing(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selectedServing === s.id
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

              {/* 2. Dietary & Badges */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Dietary &amp; Badges
                </label>
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

              {/* 3. Price Tiers */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Price Budget
                </label>
                <div className="space-y-1">
                  {priceRanges.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriceTier(p.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selectedPriceTier === p.id
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

              {/* 4. Max Price Slider */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-rose-600">${maxPriceSlider}</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="2"
                  value={maxPriceSlider}
                  onChange={(e) => setMaxPriceSlider(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>$12</span>
                  <span>$60</span>
                </div>
              </div>

              {/* Value Assurance Card */}
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

          {/* ------------------------------------------
              RIGHT RESULTS GRID (9 Cols)
          ------------------------------------------ */}
          <main className="lg:col-span-9 space-y-4">
            {/* Results Header Count & Active Filter Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-zinc-900">
                  {filteredCombos.length} Combos Available
                </span>
                {selectedCategory !== "all" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    {comboCategories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-zinc-500 hover:text-rose-600 font-bold underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* ZERO RESULTS STATE */}
            {filteredCombos.length === 0 && (
              <div className="bg-white rounded-3xl p-10 border border-zinc-200/80 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <Utensils className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-zinc-900">No Combos Match Your Filters</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Try adjusting the serving size, price range slider, or search term to discover our other royal platters.
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

            {/* COMBO CARDS (GRID OR LIST) */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "grid grid-cols-1 gap-4"
              }
            >
              {filteredCombos.map((combo) => {
                const qty = cartItems[combo.id] || 0;
                const isFav = wishlist[combo.id] || false;

                return (
                  <div
                    key={combo.id}
                    className="group bg-white rounded-2xl border border-zinc-200/90 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image Banner */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-100">
                        <Image
                          src={combo.image}
                          alt={combo.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {combo.discountPercent && (
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
                            onClick={() =>
                              setWishlist((prev) => ({ ...prev, [combo.id]: !prev[combo.id] }))
                            }
                            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                              isFav
                                ? "bg-rose-600 text-white shadow-md"
                                : "bg-black/40 text-white hover:bg-black/60"
                            }`}
                            aria-label="Wishlist"
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

                      {/* Card Body Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug">
                              {combo.title}
                            </h3>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1 font-medium">
                            {combo.shortDesc}
                          </p>
                        </div>

                        {/* Items Included Chips */}
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
                              <li
                                key={i}
                                className="text-[11px] text-zinc-700 flex items-start gap-1 font-medium truncate"
                              >
                                <span className="text-rose-500 font-bold">•</span>
                                <span className="truncate">{item}</span>
                              </li>
                            ))}
                            {combo.itemsIncluded.length > 4 && (
                              <li className="text-[10px] text-rose-600 font-bold pt-0.5">
                                + {combo.itemsIncluded.length - 4} more items &amp; accompaniments
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 pt-0 border-t border-zinc-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                          Total Combo Price
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-zinc-900">${combo.price}</span>
                          {combo.oldPrice && (
                            <span className="text-xs text-zinc-400 line-through font-semibold">
                              ${combo.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Customizer Button */}
                        {combo.customizable && (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomizer(combo)}
                            className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 transition-colors cursor-pointer"
                            title="Customize Bread, Beverage & Desserts"
                            aria-label="Customize combo"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Add to Cart Stepper / Button */}
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(combo)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add Combo</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-rose-600 text-white rounded-xl px-2 py-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(combo.id, -1)}
                              className="w-6 h-6 rounded-lg bg-rose-700 hover:bg-rose-800 flex items-center justify-center cursor-pointer font-black"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black min-w-[14px] text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(combo.id, 1)}
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
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* ------------------------------------------
          MOBILE FILTER DRAWER MODAL
      ------------------------------------------ */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div className="w-[85vw] max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-black text-zinc-900">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Combo Category Filter in mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400">Combo Categories</label>
                <div className="space-y-1">
                  {comboCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                          isSelected
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

              {/* 2. Serving size in mobile */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase text-zinc-400">Serving Size</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {servingFilters.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServing(s.id)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        selectedServing === s.id
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
                <label className="text-xs font-bold uppercase text-zinc-400">Preferences</label>
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

              {/* Price Tier */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase text-zinc-400">Price Budget</label>
                <div className="space-y-1">
                  {priceRanges.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriceTier(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        selectedPriceTier === p.id
                          ? "bg-rose-50 border border-rose-200 text-rose-900 font-bold"
                          : "bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <span>{p.label}</span>
                      {selectedPriceTier === p.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center gap-2">
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
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------
          COMBO CUSTOMIZER MODAL
      ------------------------------------------ */}
      {activeCustomCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-zinc-100 space-y-4 max-h-[90vh] overflow-y-auto">
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

            {/* Custom Bread Option */}
            {activeCustomCombo.customOptions?.breads && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Select Indian Bread / Roti Choice *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeCustomCombo.customOptions.breads.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setCustomBread(b)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        customBread === b
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-2xs"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Beverage Option */}
            {activeCustomCombo.customOptions?.beverages && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Select Beverage / Lassi Pairing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeCustomCombo.customOptions.beverages.map((bev) => (
                    <button
                      key={bev}
                      type="button"
                      onClick={() => setCustomBeverage(bev)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        customBeverage === bev
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-2xs"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                      }`}
                    >
                      {bev}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Dessert Option */}
            {activeCustomCombo.customOptions?.desserts && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Sweet / Dessert Choice
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeCustomCombo.customOptions.desserts.map((dessert) => (
                    <button
                      key={dessert}
                      type="button"
                      onClick={() => setCustomDessert(dessert)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        customDessert === dessert
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-2xs"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                      }`}
                    >
                      {dessert}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spice Level Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Spice Level Preference
              </label>
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
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      customSpice === s.level
                        ? "bg-rose-600 border-rose-600 text-white shadow-2xs"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-rose-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Kitchen Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Kitchen Notes (Optional)
              </label>
              <input
                type="text"
                value={customSpecialInstructions}
                onChange={(e) => setCustomSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra crisp papad, less oil in dal..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total</span>
                <span className="text-lg font-black text-zinc-900">${activeCustomCombo.price}</span>
              </div>
              <button
                type="button"
                onClick={handleSaveCustomCombo}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                Add Customized Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
