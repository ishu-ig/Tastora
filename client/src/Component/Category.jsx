"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  Flame,
  Star,
  Clock,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pizza,
  Sandwich,
  Coffee,
  Soup,
  Box,
  CakeSlice,
  CupSoda,
  UtensilsCrossed,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export const categoryData = [
  {
    id: "fast-food",
    name: "Fast Food",
    tagline: "Gourmet Burgers, Sourdough Pizzas & Crispy Momos",
    iconType: "burger",
    iconEmoji: "🍔",
    pillBadge: "🔥 Hot",
    theme: {
      accentColor: "from-rose-600 via-red-500 to-amber-500",
      activeBorder: "border-rose-500 ring-4 ring-rose-500/20",
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
    },
    subcategories: [
      {
        id: "all-momos",
        name: "All Momos",
        iconType: "momo",
        iconEmoji: "🥟",
        count: "6 Items",
        items: [
          {
            id: "momo-1",
            title: "Darjeeling Steamed Momos",
            image: "/img/category/paneer-tikka.jpg",
            price: 11.99,
            oldPrice: 14.99,
            rating: 4.9,
            reviews: 184,
            prepTime: "12 min",
            calories: 290,
            desc: "Delicate thin-skinned dumplings stuffed with seasoned garden vegetables & cottage cheese.",
            badge: "Bestseller",
            tags: ["Steamed", "Spicy Dip", "100% Pure Veg"],
          },
          {
            id: "momo-2",
            title: "Crispy Fried Kurkure Momos",
            image: "/img/category/paneer-tikka.jpg",
            price: 13.49,
            oldPrice: 16.99,
            rating: 4.8,
            reviews: 142,
            prepTime: "14 min",
            calories: 380,
            desc: "Crunchy crumb-coated dumplings tossed with spicy peri-peri dust and garlic herb dip.",
            badge: "Crispy",
            tags: ["Crunchy", "Peri Peri"],
          },
          {
            id: "momo-3",
            title: "Tandoori Afghani Momos",
            image: "/img/category/paneer-tikka.jpg",
            price: 14.99,
            oldPrice: 18.99,
            rating: 4.95,
            reviews: 210,
            prepTime: "15 min",
            calories: 410,
            desc: "Clay tandoor charred momos drenched in rich cashew nut cream & white butter.",
            badge: "Chef's Special",
            tags: ["Clay Tandoor", "Creamy Gravy"],
          },
        ],
      },
      {
        id: "classic-burgers",
        name: "Classic Burgers",
        iconType: "burger",
        iconEmoji: "🍔",
        count: "4 Items",
        items: [
          {
            id: "bg-1",
            title: "Double Paneer Smash Burger",
            image: "/img/category/fast-food-burger.jpg",
            price: 14.99,
            oldPrice: 18.99,
            rating: 4.9,
            reviews: 310,
            prepTime: "12 min",
            calories: 520,
            desc: "Double spiced cottage cheese patties on toasted brioche with aged cheddar & house relish.",
            badge: "Chef's Pick",
            tags: ["Brioche Bun", "Smash Style"],
          },
          {
            id: "bg-2",
            title: "Crispy Herb Aloo Tikki Burger",
            image: "/img/category/fast-food-burger.jpg",
            price: 9.99,
            oldPrice: 12.99,
            rating: 4.7,
            reviews: 195,
            prepTime: "10 min",
            calories: 420,
            desc: "Golden crunchy potato patty layered with sweet tamarind glaze & garden fresh onions.",
            badge: "Popular",
            tags: ["Desi Style", "Crispy"],
          },
        ],
      },
      {
        id: "fries-sides",
        name: "Fries & Sides",
        iconType: "fries",
        iconEmoji: "🍟",
        count: "4 Items",
        items: [
          {
            id: "fr-1",
            title: "Peri Peri Loaded Cheese Fries",
            image: "/img/category/fast-food-burger.jpg",
            price: 8.99,
            oldPrice: 11.99,
            rating: 4.8,
            reviews: 160,
            prepTime: "8 min",
            calories: 340,
            desc: "Golden cut skin-on fries dusted with African peri-peri seasoning and hot molten cheese sauce.",
            badge: "Cheesy",
            tags: ["Spicy", "Molten Cheese"],
          },
        ],
      },
      {
        id: "wraps-rolls",
        name: "Wraps & Rolls",
        iconType: "wrap",
        iconEmoji: "🌯",
        count: "3 Items",
        items: [
          {
            id: "wr-1",
            title: "Smoky Paneer Tikka Kathi Roll",
            image: "/img/category/paneer-tikka.jpg",
            price: 12.99,
            oldPrice: 15.99,
            rating: 4.85,
            reviews: 175,
            prepTime: "12 min",
            calories: 460,
            desc: "Flaky whole wheat paratha rolled with charcoal roasted paneer tikka, mint chutney & pickled onions.",
            badge: "Best Seller",
            tags: ["Clay Tandoor", "Kathi Roll"],
          },
        ],
      },
      {
        id: "pizzas",
        name: "Pizzas",
        iconType: "pizza",
        iconEmoji: "🍕",
        count: "5 Items",
        items: [
          {
            id: "pz-1",
            title: "Artisan Margherita Sourdough",
            image: "/img/category/masala-dosa.jpg",
            price: 18.99,
            oldPrice: 22.99,
            rating: 4.9,
            reviews: 240,
            prepTime: "16 min",
            calories: 580,
            desc: "48-hour slow fermented sourdough, San Marzano tomato sauce, fresh buffalo mozzarella & basil.",
            badge: "Wood Fired",
            tags: ["Sourdough", "Buffalo Mozzarella"],
          },
          {
            id: "pz-2",
            title: "Spicy Paneer Makhani Fusion",
            image: "/img/category/masala-dosa.jpg",
            price: 20.99,
            oldPrice: 25.99,
            rating: 4.95,
            reviews: 198,
            prepTime: "18 min",
            calories: 640,
            desc: "Rich buttery makhani sauce base, charred spiced paneer, roasted red paprika & mozzarella.",
            badge: "Fusion Hit",
            tags: ["Makhani Gravy", "Loaded"],
          },
        ],
      },
    ],
  },
  {
    id: "north-indian",
    name: "North Indian",
    tagline: "Royal Cashew Gravies, Dal Makhani & Tandoori",
    iconType: "curry",
    iconEmoji: "🍛",
    pillBadge: "👑 Royal",
    theme: {
      accentColor: "from-amber-500 via-orange-500 to-yellow-500",
      activeBorder: "border-amber-500 ring-4 ring-amber-500/20",
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
    },
    subcategories: [
      {
        id: "paneer-specials",
        name: "Paneer Gravies",
        iconType: "curry",
        iconEmoji: "🧀",
        count: "5 Items",
        items: [
          {
            id: "ni-1",
            title: "Shahi Paneer Royale",
            image: "/img/category/paneer-tikka.jpg",
            price: 15.99,
            oldPrice: 19.99,
            rating: 4.95,
            reviews: 290,
            prepTime: "16 min",
            calories: 480,
            desc: "Velvety cashew nut and saffron cream gravy with melt-in-mouth cottage cheese batons.",
            badge: "Chef's Signature",
            tags: ["Royal Saffron", "Cashew Gravy"],
          },
          {
            id: "ni-2",
            title: "Kadhai Paneer Angara",
            image: "/img/category/paneer-tikka.jpg",
            price: 14.49,
            oldPrice: 17.99,
            rating: 4.8,
            reviews: 180,
            prepTime: "15 min",
            calories: 440,
            desc: "Tossed in iron kadhai with freshly pounded coriander seeds, bell peppers & tomato reduction.",
            badge: "Spicy",
            tags: ["Clay Pot", "Spicy"],
          },
        ],
      },
      {
        id: "dal-lentils",
        name: "Dal & Lentils",
        iconType: "soup",
        iconEmoji: "🍲",
        count: "4 Items",
        items: [
          {
            id: "ni-3",
            title: "12-Hour Slow Simmered Dal Makhani",
            image: "/img/category/dal-makhani.jpg",
            price: 13.99,
            oldPrice: 16.99,
            rating: 5.0,
            reviews: 420,
            prepTime: "12 min",
            calories: 390,
            desc: "Overnight slow-cooked black lentils churned with white butter, cream & delicate fenugreek.",
            badge: "Signature",
            tags: ["12h Simmered", "White Butter"],
          },
        ],
      },
      {
        id: "tandoor-breads",
        name: "Tandoori Breads",
        iconType: "bread",
        iconEmoji: "🫓",
        count: "4 Items",
        items: [
          {
            id: "ni-4",
            title: "Garlic Butter Naan",
            image: "/img/category/dal-makhani.jpg",
            price: 3.99,
            oldPrice: 4.99,
            rating: 4.9,
            reviews: 510,
            prepTime: "6 min",
            calories: 220,
            desc: "Clay oven baked leavened bread brushed with roasted minced garlic and pure butter.",
            badge: "Fresh Clay Oven",
            tags: ["Clay Tandoor", "Butter"],
          },
        ],
      },
    ],
  },
  {
    id: "south-indian",
    name: "South Indian",
    tagline: "Crispy Golden Dosas & Steamed Fluffy Idlis",
    iconType: "dosa",
    iconEmoji: "🥞",
    pillBadge: "✨ Fresh",
    theme: {
      accentColor: "from-emerald-500 via-teal-500 to-green-600",
      activeBorder: "border-emerald-500 ring-4 ring-emerald-500/20",
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
    },
    subcategories: [
      {
        id: "crispy-dosas",
        name: "Crispy Dosas",
        iconType: "dosa",
        iconEmoji: "🥞",
        count: "5 Items",
        items: [
          {
            id: "si-1",
            title: "Golden Desi Ghee Masala Dosa",
            image: "/img/category/masala-dosa.jpg",
            price: 12.99,
            oldPrice: 15.99,
            rating: 4.95,
            reviews: 380,
            prepTime: "10 min",
            calories: 360,
            desc: "Crispy golden crepe roasted in pure ghee, stuffed with spiced potato mash, sambar & 3 chutneys.",
            badge: "Pure Desi Ghee",
            tags: ["Crispy", "Sambar & Chutneys"],
          },
        ],
      },
      {
        id: "idli-vada",
        name: "Idli & Vada",
        iconType: "idli",
        iconEmoji: "🥟",
        count: "4 Items",
        items: [
          {
            id: "si-2",
            title: "Steamed Button Idlis with Sambar",
            image: "/img/category/masala-dosa.jpg",
            price: 8.99,
            oldPrice: 10.99,
            rating: 4.8,
            reviews: 190,
            prepTime: "8 min",
            calories: 220,
            desc: "Cloud-soft fermented steamed rice cakes served with piping hot vegetable drumstick sambar.",
            badge: "Steamed Fresh",
            tags: ["Healthy", "Steamed"],
          },
        ],
      },
    ],
  },
  {
    id: "chinese",
    name: "Indo-Chinese",
    tagline: "Fiery Wok Hakka Noodles & Crispy Manchurian",
    iconType: "chinese",
    iconEmoji: "🥢",
    pillBadge: "🍜 Wok",
    theme: {
      accentColor: "from-purple-600 via-fuchsia-500 to-pink-500",
      activeBorder: "border-purple-500 ring-4 ring-purple-500/20",
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
    },
    subcategories: [
      {
        id: "wok-noodles",
        name: "Wok Noodles",
        iconType: "chinese",
        iconEmoji: "🍜",
        count: "4 Items",
        items: [
          {
            id: "ch-1",
            title: "Veg Hakka Noodles Wok Tossed",
            image: "/img/category/chinese-noodles.jpg",
            price: 12.49,
            oldPrice: 15.99,
            rating: 4.85,
            reviews: 230,
            prepTime: "12 min",
            calories: 410,
            desc: "Al dente eggless noodles tossed with julienned vegetables, roast garlic & light soy sauce.",
            badge: "High Flame",
            tags: ["High Flame", "Wok Tossed"],
          },
        ],
      },
      {
        id: "manchurian",
        name: "Manchurian",
        iconType: "chinese",
        iconEmoji: "🥢",
        count: "3 Items",
        items: [
          {
            id: "ch-2",
            title: "Crispy Veg Manchurian Dry",
            image: "/img/category/paneer-tikka.jpg",
            price: 13.99,
            oldPrice: 16.99,
            rating: 4.8,
            reviews: 175,
            prepTime: "14 min",
            calories: 360,
            desc: "Crisp vegetable balls tossed in ginger garlic chili sauce with scallions and sesame.",
            badge: "Crunchy",
            tags: ["Spicy", "Crispy"],
          },
        ],
      },
    ],
  },
  {
    id: "street-food",
    name: "Street Food",
    tagline: "Amul Butter Pav Bhaji & Delhi Chaats",
    iconType: "street",
    iconEmoji: "🫓",
    pillBadge: "🌶️ Zesty",
    theme: {
      accentColor: "from-orange-500 via-amber-500 to-red-500",
      activeBorder: "border-orange-500 ring-4 ring-orange-500/20",
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
    },
    subcategories: [
      {
        id: "pav-bhaji",
        name: "Pav & Chole",
        iconType: "street",
        iconEmoji: "🫓",
        count: "3 Items",
        items: [
          {
            id: "st-1",
            title: "Mumbai Amul Butter Pav Bhaji",
            image: "/img/category/pav-bhaji.jpg",
            price: 11.49,
            oldPrice: 13.99,
            rating: 4.95,
            reviews: 410,
            prepTime: "10 min",
            calories: 490,
            desc: "Mashed spiced vegetable curry simmered on iron tawa with copious butter, served with 2 buttery pavs.",
            badge: "Amul Butter",
            tags: ["Mumbai Style", "Pure Butter"],
          },
        ],
      },
      {
        id: "chaats",
        name: "Delhi Chaat",
        iconType: "street",
        iconEmoji: "🥣",
        count: "4 Items",
        items: [
          {
            id: "st-2",
            title: "Delhi Papdi & Samosa Chaat",
            image: "/img/category/chole-bhature.jpg",
            price: 9.99,
            oldPrice: 11.99,
            rating: 4.85,
            reviews: 260,
            prepTime: "6 min",
            calories: 320,
            desc: "Crispy samosas and papdis crushed with sweet yogurt, mint chutney, tamarind and sev.",
            badge: "Tangy & Sweet",
            tags: ["Sweet Curd", "Tangy"],
          },
        ],
      },
    ],
  },
  {
    id: "combos",
    name: "Combos",
    tagline: "Grand Imperial Thalis & Multi-Course Feasts",
    iconType: "combo",
    iconEmoji: "🍱",
    pillBadge: "🍱 Feast",
    theme: {
      accentColor: "from-indigo-600 via-blue-600 to-cyan-500",
      activeBorder: "border-indigo-500 ring-4 ring-indigo-500/20",
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
    },
    subcategories: [
      {
        id: "grand-thalis",
        name: "Grand Thalis",
        iconType: "combo",
        iconEmoji: "🍱",
        count: "3 Items",
        items: [
          {
            id: "thali-1",
            title: "Royal Maharaja Thali (8 Items)",
            image: "/img/category/royal-thali.jpg",
            price: 19.99,
            oldPrice: 24.99,
            rating: 5.0,
            reviews: 580,
            prepTime: "18 min",
            calories: 890,
            desc: "Complete 8-course banquet: Shahi Paneer, 12-hr Dal Makhani, Saffron Dum Biryani, 2 Naans, Raita & Gulab Jamun.",
            badge: "👑 Royal Feast",
            tags: ["8 Course Feast", "Pure Ghee", "Complete Meal"],
          },
          {
            id: "thali-2",
            title: "Executive Lunch Thali Box",
            image: "/img/category/royal-thali.jpg",
            price: 13.99,
            oldPrice: 17.49,
            rating: 4.85,
            reviews: 310,
            prepTime: "12 min",
            calories: 640,
            desc: "Paneer Butter Masala, Yellow Dal Tadka, Jeera Basmati, 2 Soft Phulkas, Salad & Dessert.",
            badge: "Daily Value",
            tags: ["Quick Delivery", "Balanced Meal"],
          },
        ],
      },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    tagline: "Iced Frappes, Thick Malai Lassi & Coolers",
    iconType: "beverage",
    iconEmoji: "🥤",
    pillBadge: "🧊 Chill",
    theme: {
      accentColor: "from-sky-500 via-cyan-500 to-blue-600",
      activeBorder: "border-sky-500 ring-4 ring-sky-500/20",
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
    },
    subcategories: [
      {
        id: "traditional-lassi",
        name: "Lassi & Chaas",
        iconType: "beverage",
        iconEmoji: "🥛",
        count: "4 Items",
        items: [
          {
            id: "bev-1",
            title: "Royal Amritsari Malai Lassi",
            image: "/img/category/beverage-lassi.jpg",
            price: 6.99,
            oldPrice: 8.99,
            rating: 4.95,
            reviews: 320,
            prepTime: "5 min",
            calories: 260,
            desc: "Thick hand-churned yogurt beverage crowned with pure thick clotted malai and roasted pistachios.",
            badge: "Pure Malai",
            tags: ["Traditional", "Probiotic"],
          },
          {
            id: "bev-2",
            title: "Alphonso Mango Silk Lassi",
            image: "/img/category/beverage-lassi.jpg",
            price: 7.99,
            oldPrice: 9.99,
            rating: 4.9,
            reviews: 215,
            prepTime: "5 min",
            calories: 280,
            desc: "Blended with 100% Ratnagiri Alphonso mango pulp, fresh curd, and a touch of saffron.",
            badge: "Alphonso Mango",
            tags: ["Seasonal", "Sweet"],
          },
        ],
      },
      {
        id: "shakes-frappes",
        name: "Shakes & Frappes",
        iconType: "beverage",
        iconEmoji: "🥤",
        count: "3 Items",
        items: [
          {
            id: "bev-3",
            title: "Belgian Dark Chocolate Shake",
            image: "/img/category/beverage-lassi.jpg",
            price: 9.49,
            oldPrice: 11.99,
            rating: 4.85,
            reviews: 154,
            prepTime: "6 min",
            calories: 390,
            desc: "Thick shake crafted from pure Belgian cocoa, vanilla bean cream & dark chocolate chips.",
            badge: "Decadent",
            tags: ["Belgian Cocoa", "Ice Cream"],
          },
        ],
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    tagline: "Warm Saffron Sweets & Kesar Falooda",
    iconType: "cupcake",
    iconEmoji: "🍯",
    pillBadge: "🍯 Sweet",
    theme: {
      accentColor: "from-pink-500 via-rose-500 to-purple-600",
      activeBorder: "border-pink-500 ring-4 ring-purple-500/20",
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
    },
    subcategories: [
      {
        id: "royal-mithai",
        name: "Royal Mithai",
        iconType: "cupcake",
        iconEmoji: "🍯",
        count: "4 Items",
        items: [
          {
            id: "des-1",
            title: "Hot Desi Ghee Gulab Jamun (2 Pcs)",
            image: "/img/category/gulab-jamun.jpg",
            price: 6.49,
            oldPrice: 7.99,
            rating: 4.95,
            reviews: 420,
            prepTime: "5 min",
            calories: 310,
            desc: "Soft melt-in-mouth khoya dumplings soaked in fragrant green cardamom & saffron rose syrup.",
            badge: "Warm & Fresh",
            tags: ["Desi Ghee", "Khoya"],
          },
          {
            id: "des-2",
            title: "Kesar Saffron Rasmalai",
            image: "/img/category/gulab-jamun.jpg",
            price: 7.99,
            oldPrice: 9.99,
            rating: 4.9,
            reviews: 260,
            prepTime: "5 min",
            calories: 240,
            desc: "Spongy cottage cheese patties poached in condensed saffron cardamom milk with slivered nuts.",
            badge: "Chilled",
            tags: ["Kashmiri Saffron", "Pistachio"],
          },
        ],
      },
    ],
  },
];

export function Category() {
  const [activeMainId, setActiveMainId] = useState("fast-food");
  const [activeSubId, setActiveSubId] = useState("all-momos");
  const [quantities, setQuantities] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const mainPrevRef = useRef(null);
  const mainNextRef = useRef(null);
  const subPrevRef = useRef(null);
  const subNextRef = useRef(null);

  const activeMain =
    categoryData.find((c) => c.id === activeMainId) || categoryData[0];

  const activeSub =
    activeMain.subcategories.find((s) => s.id === activeSubId) ||
    activeMain.subcategories[0];

  const handleMainSelect = (mainId) => {
    setActiveMainId(mainId);
    const targetMain = categoryData.find((c) => c.id === mainId);
    if (targetMain && targetMain.subcategories.length > 0) {
      setActiveSubId(targetMain.subcategories[0].id);
    }
  };

  const handleAddDish = (dish) => {
    setQuantities((prev) => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + 1,
    }));
    setToastMessage(`Added ${dish.title} ($${dish.price.toFixed(2)}) to your cart!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateQty = (dish, delta) => {
    setQuantities((prev) => {
      const current = prev[dish.id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [dish.id]: next };
    });
  };

  return (
    <section
      id="category"
      className="py-12 sm:py-16 relative overflow-hidden text-zinc-900 transition-colors duration-700 bg-gradient-to-b from-white via-zinc-50/40 to-white"
    >
      {/* Dynamic Ambient Atmospheric Glows - Shifts Color Dynamically with Active Cuisine */}
      <div
        className={`absolute top-1/4 left-1/6 w-[650px] h-[400px] rounded-full blur-[130px] pointer-events-none -z-10 transition-all duration-700 opacity-30 bg-gradient-to-tr ${activeMain.theme.ambientGlow}`}
      />
      <div
        className={`absolute bottom-10 right-1/6 w-[550px] h-[380px] rounded-full blur-[130px] pointer-events-none -z-10 transition-all duration-700 opacity-25 bg-gradient-to-bl ${activeMain.theme.ambientGlow}`}
      />
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-amber-200/15 blur-[90px] pointer-events-none -z-10" />

      {/* Cart Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Cart Updated</div>
            <div className="text-[11px] text-zinc-300">{toastMessage}</div>
          </div>
        </div>
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
              <span className={`bg-gradient-to-r ${activeMain.theme.accentColor} bg-clip-text text-transparent transition-all duration-500`}>
                Cuisine &amp; Delicacies
              </span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-medium max-w-xl">
              Choose from our signature colorful gourmet categories below to discover authentic chef creations.
            </p>
          </div>

          {/* Desktop Navigation Arrows for Main Categories */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              ref={mainPrevRef}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-zinc-900 text-zinc-700 hover:text-white border border-zinc-200 shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-25 cursor-pointer"
              aria-label="Previous main categories"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              ref={mainNextRef}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-zinc-900 text-zinc-700 hover:text-white border border-zinc-200 shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-25 cursor-pointer"
              aria-label="Next main categories"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            TIER 1: MAIN CATEGORIES (Vibrant 3D Glossy Spherical Bubbles with Floating Badges)
        ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Main Categories
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border transition-all duration-300 ${activeMain.theme.badgeBg}`}>
                {activeMain.name} Active
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 hidden sm:inline">
              8 Signature Flavor Worlds
            </span>
          </div>

          {/* Desktop Full-Width 8-Column Grid (Colorful 3D Bubbles) */}
          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5 lg:gap-6 w-full py-3">
            {categoryData.map((mainCat) => {
              const isSelected = activeMainId === mainCat.id;

              return (
                <button
                  key={mainCat.id}
                  onClick={() => handleMainSelect(mainCat.id)}
                  className="group relative flex flex-col items-center select-none cursor-pointer focus:outline-none transition-all duration-300 -translate-y-0 hover:-translate-y-2.5 active:scale-95 text-center"
                >
                  {/* Outer Frame with Ambient Halos & Badges */}
                  <div className="relative p-1">
                    {/* Floating Mini Pill Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border shadow-xs transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1 ${
                          isSelected
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
                        isSelected
                          ? "opacity-95 scale-115"
                          : "opacity-0 group-hover:opacity-85 group-hover:scale-110"
                      }`}
                    />

                    {/* Glowing Active Ring */}
                    {isSelected && (
                      <div
                        className={`absolute -inset-1.5 rounded-full border-2 ${mainCat.theme.activeRing} animate-pulse pointer-events-none`}
                      />
                    )}

                    {/* 3D Circular Spherical Bubble Body */}
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
                        isSelected
                          ? `${mainCat.theme.iconActiveBg} shadow-2xl scale-105`
                          : `${mainCat.theme.iconInactiveBg} border shadow-xs`
                      }`}
                    >
                      {/* Glossy Upper Specular Arc Highlight */}
                      <div className="absolute top-1 inset-x-2.5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-white/75 via-white/25 to-transparent pointer-events-none" />

                      {/* Subtle Ambient Radial Shading */}
                      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none" />

                      {/* Icon Display with physics tilt */}
                      <div className="relative z-10 text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-120 group-hover:-rotate-6">
                        <span className={isSelected ? "drop-shadow-md" : "drop-shadow-xs"}>
                          {mainCat.iconEmoji}
                        </span>
                      </div>

                      {/* Active Center Spark */}
                      {isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none" />
                      )}
                    </div>
                  </div>

                  {/* Label Below & Active Indicator */}
                  <div className="mt-2.5 flex flex-col items-center">
                    <span
                      className={`text-xs sm:text-sm font-black tracking-tight leading-tight transition-colors duration-200 text-center max-w-[95px] truncate ${
                        isSelected
                          ? `${mainCat.theme.textColor} font-black`
                          : `text-zinc-700 ${mainCat.theme.hoverTextColor} font-bold`
                      }`}
                    >
                      {mainCat.name}
                    </span>

                    {/* Active Gradient Indicator Capsule */}
                    <div
                      className={`h-1 rounded-full mt-1.5 transition-all duration-300 ${
                        isSelected
                          ? `w-6 bg-gradient-to-r ${mainCat.theme.accentColor} shadow-xs`
                          : "w-0 bg-transparent"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile / Tablet Horizontal Swiper Track (Colorful 3D Bubbles) */}
          <div className="md:hidden py-3">
            <Swiper
              modules={[FreeMode, Navigation]}
              freeMode={{ enabled: true, momentum: true, momentumRatio: 0.8 }}
              slidesPerView={"auto"}
              spaceBetween={16}
              navigation={{
                prevEl: mainPrevRef.current,
                nextEl: mainNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = mainPrevRef.current;
                swiper.params.navigation.nextEl = mainNextRef.current;
              }}
              className="!overflow-visible py-2 w-full"
            >
              {categoryData.map((mainCat) => {
                const isSelected = activeMainId === mainCat.id;

                return (
                  <SwiperSlide key={mainCat.id} className="!w-auto">
                    <button
                      onClick={() => handleMainSelect(mainCat.id)}
                      className="group relative flex flex-col items-center select-none cursor-pointer focus:outline-none transition-all duration-300 active:scale-95 text-center px-1"
                    >
                      {/* Outer Frame with Ambient Halos & Badges */}
                      <div className="relative p-1">
                        {/* Floating Mini Pill Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1 ${
                              isSelected
                                ? mainCat.theme.badgeActive
                                : mainCat.theme.badgeInactive
                            }`}
                          >
                            {mainCat.pillBadge}
                          </span>
                        </div>

                        {/* Ambient Glow Aura */}
                        <div
                          className={`absolute -inset-2 rounded-full blur-lg transition-all duration-300 pointer-events-none bg-gradient-to-tr ${
                            mainCat.theme.ambientGlow
                          } ${
                            isSelected
                              ? "opacity-90 scale-110"
                              : "opacity-0 group-hover:opacity-75"
                          }`}
                        />

                        {/* Glowing Active Ring */}
                        {isSelected && (
                          <div
                            className={`absolute -inset-1.5 rounded-full border-2 ${mainCat.theme.activeRing} animate-pulse pointer-events-none`}
                          />
                        )}

                        {/* Circular Bubble Body */}
                        <div
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                            isSelected
                              ? `${mainCat.theme.iconActiveBg} shadow-lg scale-105`
                              : `${mainCat.theme.iconInactiveBg} border shadow-xs`
                          }`}
                        >
                          {/* Glossy Upper Specular Highlight */}
                          <div className="absolute top-1 inset-x-2.5 h-4 rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />

                          {/* Subtle Ambient Radial Shading */}
                          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none" />

                          {/* Icon Display */}
                          <div className="relative z-10 text-3xl">
                            <span className={isSelected ? "drop-shadow-md" : "drop-shadow-xs"}>
                              {mainCat.iconEmoji}
                            </span>
                          </div>

                          {/* Active Center Spark */}
                          {isSelected && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none" />
                          )}
                        </div>
                      </div>

                      {/* Label Below & Active Indicator */}
                      <div className="mt-2 flex flex-col items-center">
                        <span
                          className={`text-xs font-black tracking-tight transition-colors duration-200 text-center ${
                            isSelected
                              ? `${mainCat.theme.textColor} font-black`
                              : `text-zinc-700 ${mainCat.theme.hoverTextColor} font-bold`
                          }`}
                        >
                          {mainCat.name}
                        </span>

                        <div
                          className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${
                            isSelected
                              ? `w-4 bg-gradient-to-r ${mainCat.theme.accentColor}`
                              : "w-0 bg-transparent"
                          }`}
                        />
                      </div>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        {/* =========================================================================
            FEATURED CUISINE SPOTLIGHT SHOWCASE BANNER
        ========================================================================= */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-500 bg-gradient-to-r from-white via-white/90 to-white/70 shadow-xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-zinc-200/90`}>
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm ${activeMain.theme.iconActiveBg} transition-all duration-500`}>
              {activeMain.iconEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                  {activeMain.name} Specialties
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${activeMain.theme.badgeBg}`}>
                  {activeMain.subcategories.length} Subcategories
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>4.9+ Rated Gourmet</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5 max-w-xl">
                {activeMain.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-bold text-zinc-400 hidden lg:inline">
              ⚡ Prepared Fresh to Order
            </span>
          </div>
        </div>

        {/* =========================================================================
            TIER 2: SUBCATEGORIES (Circular Bubble Buttons - Dynamic Theme Matched)
        ========================================================================= */}
        <div className="space-y-4 pt-4 border-t border-zinc-100/90">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Subcategories
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${activeMain.theme.badgeBg}`}
              >
                {activeMain.name} Selection
              </span>
            </div>

            {/* Subcategory mini arrows */}
            <div className="flex items-center gap-1.5">
              <button
                ref={subPrevRef}
                className="w-7 h-7 rounded-xl bg-white hover:bg-rose-600 text-zinc-600 hover:text-white border border-zinc-200 hover:border-rose-600 shadow-2xs flex items-center justify-center transition-all active:scale-95 disabled:opacity-20 cursor-pointer"
                aria-label="Previous subcategories"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                ref={subNextRef}
                className="w-7 h-7 rounded-xl bg-white hover:bg-rose-600 text-zinc-600 hover:text-white border border-zinc-200 hover:border-rose-600 shadow-2xs flex items-center justify-center transition-all active:scale-95 disabled:opacity-20 cursor-pointer"
                aria-label="Next subcategories"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subcategory Circular Bubbles Track (Pure Floating Bubbles, No Box) */}
          <div className="py-2">
            <Swiper
              modules={[FreeMode, Navigation]}
              freeMode={{ enabled: true, momentum: true, momentumRatio: 0.8 }}
              slidesPerView={"auto"}
              spaceBetween={14}
              breakpoints={{
                640: { spaceBetween: 18 },
                1024: { spaceBetween: 20 },
              }}
              navigation={{
                prevEl: subPrevRef.current,
                nextEl: subNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = subPrevRef.current;
                swiper.params.navigation.nextEl = subNextRef.current;
              }}
              className="!overflow-visible py-1 w-full"
            >
              {activeMain.subcategories.map((sub) => {
                const isSubSelected = activeSub.id === sub.id;

                return (
                  <SwiperSlide key={sub.id} className="!w-auto">
                    <button
                      onClick={() => setActiveSubId(sub.id)}
                      className="group flex flex-col items-center select-none cursor-pointer focus:outline-none transition-transform active:scale-95 px-1"
                    >
                      {/* Circular Bubble Frame */}
                      <div className="relative p-0.5">
                        {/* Glowing Active Ring */}
                        {isSubSelected && (
                          <div className={`absolute -inset-1 rounded-full border-2 ${activeMain.theme.activeRing} animate-pulse transition-all`} />
                        )}

                        <div
                          className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                            isSubSelected
                              ? `${activeMain.theme.iconActiveBg} shadow-md`
                              : "bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 shadow-2xs"
                          }`}
                        >
                          {/* Inner Icon */}
                          <div className="text-lg sm:text-xl">
                            {sub.iconEmoji}
                          </div>
                        </div>
                      </div>

                      {/* Subcategory Label */}
                      <span
                        className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-tight transition-colors line-clamp-1 max-w-[85px] text-center ${
                          isSubSelected
                            ? `${activeMain.theme.textColor} font-black`
                            : `text-zinc-600 ${activeMain.theme.hoverTextColor}`
                        }`}
                      >
                        {sub.name}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        {/* =========================================================================
            MENU CARDS SHOWCASE (Commented out for now as requested)
        ========================================================================= */}
        {/*
        <div className="space-y-6 pt-2">
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 rounded-3xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-orange-200 flex items-center justify-center text-2xl shrink-0">
                {activeSub.iconEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900">
                    {activeSub.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold uppercase">
                    {activeSub.count}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">
                  Handcrafted specialties for {activeMain.name} &gt; {activeSub.name}
                </p>
              </div>
            </div>

            <Link
              href="#menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All {activeMain.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {activeSub.items.map((dish) => {
              const currentQty = quantities[dish.id] || 0;

              return (
                <div
                  key={dish.id}
                  className="group bg-white rounded-3xl border border-zinc-200/90 hover:border-orange-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden p-4 select-none relative"
                >
                  <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden bg-zinc-100 mb-3.5">
                    <img
                      src={dish.image}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                      <span>{dish.badge}</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                        🔥 {dish.calories} cal
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dish.prepTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{dish.rating}</span>
                          <span className="text-zinc-400 text-[10px]">
                            ({dish.reviews})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>100% Pure Veg</span>
                        </div>
                      </div>

                      <h4 className="text-base font-black text-zinc-900 group-hover:text-orange-600 transition-colors">
                        {dish.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                        {dish.desc}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {dish.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60 text-[10px] text-zinc-600 font-semibold"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                          Price
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-zinc-900">
                            ${dish.price.toFixed(2)}
                          </span>
                          {dish.oldPrice && (
                            <span className="text-xs text-zinc-400 line-through">
                              ${dish.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {currentQty === 0 ? (
                        <button
                          onClick={() => handleAddDish(dish)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold shadow-xs hover:shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center bg-zinc-900 text-white rounded-full p-1 border border-zinc-700 shadow-xs animate-in zoom-in-90 duration-150">
                          <button
                            onClick={() => handleUpdateQty(dish, -1)}
                            className="w-6 h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-orange-400 font-mono">
                            {currentQty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(dish, 1)}
                            className="w-6 h-6 rounded-full hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

export default Category;
