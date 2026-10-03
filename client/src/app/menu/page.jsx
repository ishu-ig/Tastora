"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { getMaincategory } from "@/Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "@/Redux/ActionCreators/SubcategoryActionCreators";
import { getProduct } from "@/Redux/ActionCreators/ProductActionCreators";
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
  Loader2,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { Menucard } from "@/Component/MenuCard";
import { Addtocart } from "@/Component/AddToCart";
import QtyStepper from "@/Component/QtyStepper";
import { CartAddedPopup } from "@/Component/Cartaddedpoup";
import useCartWishlist from "@/hooks/useCartWishlist";
import { useCart } from "../../context/CartContext";
import { mapProductToDish, rupee } from "@/lib/MenuDish";

// ==========================================
// 1. STATIC PREVIEW CATALOG
// This is NOT live data. It exists purely so the page has something
// sensible to render before the backend has been seeded, or if the
// Redux fetch genuinely comes back empty. It is never merged with real
// product data from the store — see `allDishes` below.
// ==========================================
const rawMenuCatalog = [
  // --- NORTH INDIAN: PANEER SPECIALS ---
  {
    id: "ni-1",
    title: "Paneer Tikka Charcoal Skewers",
    mainCategory: "north-indian",
    subCategory: "paneer",
    price: 14.99,
    oldPrice: 18.99,
    rating: 4.9,
    reviews: 142,
    prepTime: "15 min",
    calories: 420,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/paneer-tikka.jpg",
    shortDesc: "Tender cottage cheese charred in tandoor with bell peppers & mint dip.",
    fullDesc:
      "Succulent cubes of fresh cottage cheese marinated in hung curd, Kashmiri red chili, mustard oil, and hand-ground garam masala, roasted to smoky perfection in our clay tandoor.",
    ingredients: ["Fresh Cottage Cheese", "Hung Curd", "Kashmiri Chili", "Bell Peppers", "Mint Dip", "Chaat Masala"],
    tags: ["Tandoori", "Gluten Free", "Chef's Special"],
  },
  {
    id: "ni-2",
    title: "Shahi Paneer Royale",
    mainCategory: "north-indian",
    subCategory: "paneer",
    price: 15.99,
    oldPrice: 19.99,
    rating: 4.8,
    reviews: 98,
    prepTime: "20 min",
    calories: 480,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: false,
    image: "/img/category/paneer-tikka.jpg",
    shortDesc: "Silky cashew nut & saffron cream sauce with melt-in-mouth paneer.",
    fullDesc:
      "An imperial North Indian curry crafted with slow-simmered whole cashews, saffron threads, green cardamom, and aromatic rose water, enveloping delicate cottage cheese batons.",
    ingredients: ["Fresh Paneer", "Cashew Paste", "Saffron", "Fresh Cream", "Green Cardamom", "Ghee"],
    tags: ["Royal", "Jain Friendly", "Mild"],
  },
  {
    id: "ni-3",
    title: "Kadhai Paneer Angara",
    mainCategory: "north-indian",
    subCategory: "paneer",
    price: 14.49,
    oldPrice: null,
    rating: 4.7,
    reviews: 86,
    prepTime: "18 min",
    calories: 440,
    spiceLevel: 3,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/paneer-tikka.jpg",
    shortDesc: "Crushed coriander seeds, roasted bell peppers & fiery tomato reduction.",
    fullDesc:
      "Cottage cheese cubes tossed in a traditional iron kadhai with freshly pounded coriander seeds, dried red chilies, crunchy green bell peppers, and caramelized onion gravy.",
    ingredients: ["Paneer", "Bell Peppers", "Coriander Seeds", "Red Chillies", "Tomatoes", "Ginger"],
    tags: ["Spicy", "Clay Pot", "North Indian"],
  },

  // --- NORTH INDIAN: DAL & LENTILS ---
  {
    id: "ni-4",
    title: "Dal Makhani 12-Hour Slow Simmered",
    mainCategory: "north-indian",
    subCategory: "dal",
    price: 13.99,
    oldPrice: 16.99,
    rating: 5.0,
    reviews: 230,
    prepTime: "12 min",
    calories: 390,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/dal-makhani.jpg",
    shortDesc: "Overnight slow-cooked black lentils, churned with white butter & cream.",
    fullDesc:
      "Traditional Urad dal and red kidney beans slow-simmered over charcoal embers for over 12 hours, enriched with organic farm butter, fresh dairy cream, and delicate fenugreek.",
    ingredients: ["Black Urad Lentils", "Rajma", "Desi Makhan", "Fresh Dairy Cream", "Kashmiri Degi Mirch", "Kasuri Methi"],
    tags: ["Signature", "Overnight Cooked", "Comfort Food"],
  },
  {
    id: "ni-5",
    title: "Dhabe Wali Dal Tadka",
    mainCategory: "north-indian",
    subCategory: "dal",
    price: 11.99,
    oldPrice: null,
    rating: 4.6,
    reviews: 78,
    prepTime: "15 min",
    calories: 310,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/category/dal-makhani.jpg",
    shortDesc: "Yellow Arhar lentils tempered with desi ghee, cumin, garlic & whole chillies.",
    fullDesc:
      "Golden pigeon pea lentils cooked with turmeric and salt, finished with double desi ghee tadka of cumin seeds, chopped garlic, fresh ginger juliennes, and dried whole red chilies.",
    ingredients: ["Yellow Toor Dal", "Pure Desi Ghee", "Cumin", "Burnt Garlic", "Fresh Cilantro"],
    tags: ["Desi Ghee", "High Protein", "Homestyle"],
  },

  // --- NORTH INDIAN: RICE & BIRYANI ---
  {
    id: "ni-6",
    title: "Shahi Veg Dum Biryani",
    mainCategory: "north-indian",
    subCategory: "rice-biryani",
    price: 13.99,
    oldPrice: 17.99,
    rating: 4.9,
    reviews: 185,
    prepTime: "25 min",
    calories: 520,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/veg-biryani.jpg",
    shortDesc: "Aged Basmati handi rice with royal saffron, garden veggies & mint raita.",
    fullDesc:
      "Extra long-grain aged Basmati rice layered with seasonal vegetables, golden fried shallots, fresh mint leaves, saffron milk, and sealed with whole wheat dough for traditional dum cooking.",
    ingredients: ["Aged Basmati Rice", "Baby Carrots", "Green Beans", "Saffron Milk", "Fried Onions", "Fresh Mint"],
    tags: ["Dum Handi", "Aromatic", "Bestseller"],
  },
  {
    id: "ni-7",
    title: "Jeera Basmati Rice with Ghee",
    mainCategory: "north-indian",
    subCategory: "rice-biryani",
    price: 7.99,
    oldPrice: null,
    rating: 4.5,
    reviews: 52,
    prepTime: "10 min",
    calories: 280,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/category/veg-biryani.jpg",
    shortDesc: "Fluffy steamed basmati tempered with toasted cumin seeds and ghee.",
    fullDesc:
      "Fragrant long grain rice cooked with whole green cardamom and cloves, tempered in hot desi ghee with roasted cumin seeds and fresh coriander.",
    ingredients: ["Basmati Rice", "Roasted Cumin", "Desi Ghee", "Green Cardamom", "Coriander"],
    tags: ["Light", "Gluten Free", "Jain Friendly"],
  },

  // --- NORTH INDIAN: TANDOORI BREADS ---
  {
    id: "ni-8",
    title: "Butter Garlic Naan",
    mainCategory: "north-indian",
    subCategory: "tandoori-breads",
    price: 4.49,
    oldPrice: null,
    rating: 4.9,
    reviews: 160,
    prepTime: "8 min",
    calories: 240,
    spiceLevel: 1,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/dal-makhani.jpg",
    shortDesc: "Crisp clay-oven flatbread brushed with garlic butter and fresh herbs.",
    fullDesc:
      "Leavened dough hand-stretched and slapped on the inner walls of our scorching tandoor, topped with minced garlic and basted with melted butter.",
    ingredients: ["Refined Flour", "Fresh Garlic", "Butter Glaze", "Nigella Seeds", "Fresh Cilantro"],
    tags: ["Tandoor", "Must Try", "Hot & Fresh"],
  },
  {
    id: "ni-9",
    title: "Amritsari Chur Chur Naan",
    mainCategory: "north-indian",
    subCategory: "tandoori-breads",
    price: 5.99,
    oldPrice: 7.49,
    rating: 4.8,
    reviews: 92,
    prepTime: "10 min",
    calories: 320,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: false,
    image: "/img/category/dal-makhani.jpg",
    shortDesc: "Flaky crushed stuffed naan with spiced paneer, potatoes & butter.",
    fullDesc:
      "Multi-layered crisp naan stuffed with seasoned mashed potato and grated paneer, crushed hot with generous desi ghee and chaat masala.",
    ingredients: ["Layered Dough", "Spiced Potato Mash", "Paneer", "Desi Ghee", "Pomegranate Seeds"],
    tags: ["Crispy", "Punjabi Special", "Stuffed"],
  },

  // --- SOUTH INDIAN: DOSAS & TIFFIN ---
  {
    id: "si-1",
    title: "Mysore Masala Dosa",
    mainCategory: "south-indian",
    subCategory: "dosa",
    price: 11.99,
    oldPrice: 14.99,
    rating: 4.9,
    reviews: 175,
    prepTime: "15 min",
    calories: 430,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/masala-dosa.jpg",
    shortDesc: "Golden crispy crepe lined with spicy red chili chutney & potato masala.",
    fullDesc:
      "Naturally fermented rice and lentil batter spread paper thin on cast iron, smeared with fiery Mysore red garlic-chili paste, filled with spiced potato mash, served with piping hot sambar & 3 fresh chutneys.",
    ingredients: ["Fermented Batter", "Mysore Red Chutney", "Potato Masala", "Sambar", "Coconut Chutney", "Tomato Dip"],
    tags: ["Crispy", "Authentic", "Bestseller"],
  },
  {
    id: "si-2",
    title: "Cheese Burst Rava Dosa",
    mainCategory: "south-indian",
    subCategory: "dosa",
    price: 12.99,
    oldPrice: 15.99,
    rating: 4.7,
    reviews: 88,
    prepTime: "18 min",
    calories: 490,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/category/masala-dosa.jpg",
    shortDesc: "Lacy semolina crisp crepe loaded with melted mozzarella and green herbs.",
    fullDesc:
      "Super crisp lacy semolina crepe poured on a hot tawa with crushed peppercorns, cumin, and finely chopped herbs, smothered with molten mozzarella.",
    ingredients: ["Semolina Rava", "Mozzarella Cheese", "Black Pepper", "Cumin", "Ghee", "Curry Leaves"],
    tags: ["Cheesy", "Ultra Crisp", "Kids Favorite"],
  },
  {
    id: "si-3",
    title: "Ghee Podi Steamed Idli (3 Pcs)",
    mainCategory: "south-indian",
    subCategory: "idli-vada",
    price: 8.99,
    oldPrice: null,
    rating: 4.8,
    reviews: 95,
    prepTime: "10 min",
    calories: 290,
    spiceLevel: 2,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/masala-dosa.jpg",
    shortDesc: "Cloud-soft rice cakes tossed in fiery spicy gun powder & organic desi ghee.",
    fullDesc:
      "Ultra fluffy steamed idlis drenched in hot bubbling desi ghee and coated evenly with artisanal roasted lentil gun powder (karam podi).",
    ingredients: ["Steamed Rice Cakes", "Pure Desi Ghee", "Gun Powder Podi", "Sambar", "Coconut Chutney"],
    tags: ["Healthy", "Gluten Free", "Pure Desi Ghee"],
  },
  {
    id: "si-4",
    title: "Medu Vada Platter with Sambar",
    mainCategory: "south-indian",
    subCategory: "idli-vada",
    price: 9.49,
    oldPrice: 11.99,
    rating: 4.6,
    reviews: 64,
    prepTime: "12 min",
    calories: 360,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/category/masala-dosa.jpg",
    shortDesc: "Crisp golden fried lentil donuts with fluffy centers & drumstick sambar.",
    fullDesc:
      "Ground black gram batter whipped light with crushed black pepper and curry leaves, fried until exterior is crackling crisp and center is soft.",
    ingredients: ["Black Gram Batter", "Curry Leaves", "Cracked Pepper", "Drumstick Sambar", "Coconut Dip"],
    tags: ["Crunchy", "High Protein", "Traditional"],
  },

  // --- FAST FOOD: BURGERS & PIZZAS ---
  {
    id: "ff-1",
    title: "Double Truffle Smash Burger",
    mainCategory: "fast-food",
    subCategory: "burgers",
    price: 14.99,
    oldPrice: 18.99,
    rating: 4.9,
    reviews: 210,
    prepTime: "12 min",
    calories: 620,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/menu/1.jpg",
    shortDesc: "Double crispy-edge patty, melted cheddar, caramelized onions & secret sauce.",
    fullDesc:
      "Two hand-smashed spiced vegetable & bean patties with crispy caramelized edges, double mature cheddar, balsamic caramelized onions, dill pickles, and house secret sauce on a toasted brioche bun.",
    ingredients: ["Double Veg Patty", "Aged Cheddar", "Caramelized Onions", "Pickles", "Brioche Bun", "Secret Sauce"],
    tags: ["Bestseller", "Gourmet", "Juicy"],
  },
  {
    id: "ff-2",
    title: "Crispy Paneer Supreme Burger",
    mainCategory: "fast-food",
    subCategory: "burgers",
    price: 13.49,
    oldPrice: 16.49,
    rating: 4.8,
    reviews: 134,
    prepTime: "12 min",
    calories: 580,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/fast-food-burger.jpg",
    shortDesc: "Panko breaded fried cottage cheese block with chipotle mayo & fresh slaw.",
    fullDesc:
      "Thick slab of seasoned cottage cheese dipped in spiced batter, coated with crispy Japanese panko crumbs, fried golden and layered with crunchy cabbage slaw and chipotle dressing.",
    ingredients: ["Panko Crusted Paneer", "Chipotle Mayo", "Crunchy Slaw", "Jalapenos", "Toasted Bun"],
    tags: ["Crispy", "Extra Cheesy", "Must Try"],
  },
  {
    id: "ff-3",
    title: "Margherita Royale Sourdough Pizza",
    mainCategory: "fast-food",
    subCategory: "pizza",
    price: 19.99,
    oldPrice: 24.99,
    rating: 4.9,
    reviews: 145,
    prepTime: "18 min",
    calories: 680,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/menu/2.jpg",
    shortDesc: "San Marzano sauce, fresh buffalo mozzarella, basil & black truffle oil.",
    fullDesc:
      "48-hour slow fermented sourdough crust baked in a 800-degree oven, topped with crushed San Marzano tomato pulp, fresh torn buffalo mozzarella, basil leaves, and finished with fragrant black truffle oil.",
    ingredients: ["48-hr Sourdough Crust", "San Marzano Sauce", "Buffalo Mozzarella", "Fresh Basil", "Black Truffle Oil"],
    tags: ["Artisanal", "Wood Fired", "Italian"],
  },
  {
    id: "ff-4",
    title: "Spicy Peri-Peri Paneer Pizza",
    mainCategory: "fast-food",
    subCategory: "pizza",
    price: 21.99,
    oldPrice: 26.99,
    rating: 4.8,
    reviews: 110,
    prepTime: "18 min",
    calories: 740,
    spiceLevel: 3,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/menu/2.jpg",
    shortDesc: "Fiery African bird's eye chili spiced paneer, roasted peppers & red paprika.",
    fullDesc:
      "Stone-baked crust loaded with peri-peri seasoned paneer cubes, roasted red and yellow bell peppers, spicy jalapenos, red paprika, and gooey blended mozzarella.",
    ingredients: ["Stone Baked Crust", "Peri Peri Paneer", "Mozzarella", "Roasted Peppers", "Jalapenos", "Red Paprika"],
    tags: ["Spicy", "Loaded Cheese", "Party Fav"],
  },
  {
    id: "ff-5",
    title: "Truffle Wild Mushroom Tagliatelle",
    mainCategory: "fast-food",
    subCategory: "pasta",
    price: 16.99,
    oldPrice: 20.99,
    rating: 4.7,
    reviews: 72,
    prepTime: "16 min",
    calories: 540,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: false,
    image: "/img/menu/6.jpg",
    shortDesc: "Artisanal pasta ribbons in velvety parmesan cream & shaved black truffle.",
    fullDesc:
      "Handmade ribbon pasta tossed with sautéed cremini and porcini mushrooms in a delicate white wine reduction, aged parmesan cream, and aromatic truffle butter.",
    ingredients: ["Fresh Tagliatelle", "Porcini Mushrooms", "Parmesan Cream", "Truffle Butter", "Fresh Thyme"],
    tags: ["Gourmet", "Creamy", "Chef Special"],
  },

  // --- INDO-CHINESE ---
  {
    id: "ch-1",
    title: "Wok Tossed Hakka Noodles",
    mainCategory: "chinese",
    subCategory: "noodles",
    price: 11.99,
    oldPrice: 14.99,
    rating: 4.8,
    reviews: 130,
    prepTime: "12 min",
    calories: 410,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/chinese-noodles.jpg",
    shortDesc: "Smoky wok-charred wheat noodles with shredded crunchy vegetables & scallions.",
    fullDesc:
      "High flame wok-tossed noodles with shredded cabbage, bell peppers, carrots, spring onions, light soy sauce, and aromatic garlic chili oil with authentic wok hei char.",
    ingredients: ["Eggless Wheat Noodles", "Bell Peppers", "Shredded Cabbage", "Garlic Chili Oil", "Spring Onions"],
    tags: ["Wok Hei", "Street Style", "Bestseller"],
  },
  {
    id: "ch-2",
    title: "Crispy Chilli Paneer Dry",
    mainCategory: "chinese",
    subCategory: "manchurian",
    price: 13.99,
    oldPrice: 16.99,
    rating: 4.9,
    reviews: 162,
    prepTime: "15 min",
    calories: 460,
    spiceLevel: 3,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/paneer-tikka.jpg",
    shortDesc: "Battered crisp cottage cheese tossed in dark soya, spicy green chilies & garlic.",
    fullDesc:
      "Golden fried paneer cubes glazed in a dark soya and red chili reduction with diced onions, crunchy bell peppers, slit bird's eye chilies, and scallions.",
    ingredients: ["Crisp Paneer", "Dark Soy Reduction", "Green Chillies", "Garlic", "Bell Peppers", "Scallions"],
    tags: ["Fiery", "Appetizer", "Chef's Pick"],
  },
  {
    id: "ch-3",
    title: "Veg Manchurian in Gravy",
    mainCategory: "chinese",
    subCategory: "manchurian",
    price: 12.49,
    oldPrice: null,
    rating: 4.6,
    reviews: 84,
    prepTime: "15 min",
    calories: 380,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: false,
    image: "/img/category/chinese-noodles.jpg",
    shortDesc: "Fried minced vegetable dumplings simmered in savory garlic soy sauce.",
    fullDesc:
      "Minced cabbage and carrot spheres flash-fried and simmered in a luscious sweet and spicy garlic coriander sauce with spring onions.",
    ingredients: ["Veg Dumplings", "Garlic Gravy", "Soy Sauce", "Ginger", "Coriander", "Spring Onions"],
    tags: ["Comforting", "Saucy", "Pair with Noodles"],
  },

  // --- STREET FOOD DELIGHTS ---
  {
    id: "st-1",
    title: "Mumbai Butter Pav Bhaji",
    mainCategory: "street-food",
    subCategory: "mumbai-special",
    price: 11.49,
    oldPrice: 14.49,
    rating: 4.9,
    reviews: 195,
    prepTime: "10 min",
    calories: 490,
    spiceLevel: 2,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/pav-bhaji.jpg",
    shortDesc: "Butter-loaded spiced vegetable mash with tawa-toasted brioche pavs & lemon.",
    fullDesc:
      "Slow-cooked mashed potatoes, green peas, and tomatoes blended with authentic tawa pav bhaji masala, finished with a huge cube of melting Amul butter, served with 2 buttery grilled pavs.",
    ingredients: ["Mashed Veg Medley", "Amul Butter", "Special Bhaji Masala", "Toasted Pavs", "Onion Rings", "Lime"],
    tags: ["Legendary", "Amul Butter", "Bestseller"],
  },
  {
    id: "st-2",
    title: "Amritsari Chole Bhature",
    mainCategory: "street-food",
    subCategory: "delhi-chaat",
    price: 11.99,
    oldPrice: 15.99,
    rating: 5.0,
    reviews: 215,
    prepTime: "12 min",
    calories: 620,
    spiceLevel: 2,
    isJain: false,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/chole-bhature.jpg",
    shortDesc: "2 Huge puffed golden bhature with slow-cooked dark spiced chickpea curry.",
    fullDesc:
      "Kabuli chickpeas slow-cooked in black tea decoction and raw anardana spices, accompanied by two oversized crisp puffed bhature, spicy pickled green chilies, and tangy amla pickle.",
    ingredients: ["Dark Spiced Chole", "2 Puffed Bhature", "Anardana Masala", "Pickled Chillies", "Amla Pickle"],
    tags: ["Signature", "Hearty", "Punjabi Pride"],
  },

  // --- THALI & VALUE COMBOS ---
  {
    id: "tc-1",
    title: "Royal Maharaja Grand Thali",
    mainCategory: "thali-combos",
    subCategory: "royal-thalis",
    price: 19.99,
    oldPrice: 24.99,
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
    shortDesc: "Imperial 8-dish feast: Shahi Paneer, Dal Makhani, Biryani, Naan, Gulab Jamun & Raita.",
    fullDesc:
      "The ultimate regal dining experience served on a traditional brass platter: includes Shahi Paneer, Dal Makhani, Mix Veg, Veg Dum Biryani, 2 Butter Naans, Crisp Papad, Boondi Raita, Salad, and 2 Hot Gulab Jamuns.",
    ingredients: ["Shahi Paneer", "Dal Makhani", "Dum Biryani", "Butter Naans", "Boondi Raita", "Gulab Jamun", "Papad"],
    tags: ["Grand Feast", "8 Dishes Included", "Top Value"],
  },
  {
    id: "tc-2",
    title: "Executive Lunch Box Combo",
    mainCategory: "thali-combos",
    subCategory: "lunch-combos",
    price: 13.99,
    oldPrice: 17.49,
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
    shortDesc: "Paneer Butter Masala, Yellow Dal Tadka, Jeera Rice, 2 Rotis & Gulab Jamun.",
    fullDesc:
      "A satisfying 5-item combo packed for rapid delivery: Paneer Butter Masala, Dal Tadka, fragrant Jeera Rice, 2 Soft Phulkas, and a warm dessert.",
    ingredients: ["Paneer Butter Masala", "Dal Tadka", "Jeera Rice", "2 Phulkas", "Gulab Jamun"],
    tags: ["Workplace Lunch", "Quick Delivery", "High Value"],
  },
  {
    id: "tc-3",
    title: "South Indian Tiffin Feast Platter",
    mainCategory: "thali-combos",
    subCategory: "regional-platters",
    price: 16.99,
    oldPrice: 21.99,
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
    shortDesc: "Mysore Masala Dosa, 2 Steamed Idlis, Medu Vada, Sambar & Chutneys with Filter Coffee.",
    fullDesc:
      "A complete authentic South Indian banquet: 1 Crispy Mysore Butter Masala Dosa, 2 fluffy Steamed Idlis, 1 Golden Medu Vada, Drumstick Sambar, 3 fresh chutneys, and Madras Filter Coffee.",
    ingredients: ["Mysore Masala Dosa", "2 Steamed Idlis", "Medu Vada", "Drumstick Sambar", "3 Chutneys", "Filter Coffee"],
    tags: ["South Indian Feast", "Includes Coffee", "Crispy & Fresh"],
  },
  {
    id: "tc-4",
    title: "Indo-Chinese Dragon Platter",
    mainCategory: "thali-combos",
    subCategory: "regional-platters",
    price: 18.49,
    oldPrice: 23.99,
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
    shortDesc: "Wok Hakka Noodles, Fiery Chilli Paneer Gravy, 4 Spring Rolls & Schezwan Dip.",
    fullDesc:
      "A sizzling Indo-Chinese feast: Smoky Veg Hakka Noodles tossed on high flame, saucy Chilli Paneer with bell peppers, 4 Crispy Spring Rolls, and Schezwan dip.",
    ingredients: ["Veg Hakka Noodles", "Chilli Paneer Semi-Gravy", "4 Spring Rolls", "Schezwan Sauce"],
    tags: ["Spicy Wok", "4 Items Included", "Party Favorite"],
  },
  {
    id: "tc-5",
    title: "Mumbai Street Food Carnival Combo",
    mainCategory: "thali-combos",
    subCategory: "street-food-combos",
    price: 15.99,
    oldPrice: 19.99,
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
      "Rich buttery Mumbai Pav Bhaji served with 4 butter toasted pavs, authentic dark Amritsari Chole with 2 balloon bhatures, and 2 refreshing Masala Chaas.",
    ingredients: ["Pav Bhaji", "4 Pavs", "Amritsari Chole", "2 Bhature", "2 Masala Chaas"],
    tags: ["Street Food Duo", "Includes Chaas", "Full Meal for 2"],
  },
  {
    id: "tc-6",
    title: "Grand Family Mega Feast Box (Serves 4)",
    mainCategory: "thali-combos",
    subCategory: "family-feasts",
    price: 44.99,
    oldPrice: 59.99,
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
    shortDesc: "Full family banquet: Paneer Tikka, Shahi Paneer, Dal Makhani, Biryani, 6 Naans & 4 Sweets.",
    fullDesc:
      "Paneer Tikka starter (8 pcs), Shahi Paneer Royale (L), 12-hour Dal Makhani (L), Subz Kadhai, Dum Biryani Handi, 6 Assorted Naans, Raita, and 4 Hot Gulab Jamuns.",
    ingredients: ["Paneer Tikka Starter", "Large Shahi Paneer", "Large Dal Makhani", "Dum Biryani Handi", "6 Naans", "4 Gulab Jamuns"],
    tags: ["Family Feast (Serves 4)", "Save 25%", "Complete 12-Item Feast"],
  },
  {
    id: "tc-7",
    title: "100% Pure Jain Heritage Thali",
    mainCategory: "thali-combos",
    subCategory: "royal-thalis",
    price: 17.99,
    oldPrice: 22.49,
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
    shortDesc: "Strictly No Onion/Garlic: Jain Paneer, Jain Dal, Jeera Rice, 3 Ghee Phulkas & Kheer.",
    fullDesc:
      "Cooked following strict Jain tenets: Rich cashew-tomato Jain Paneer, Yellow Moong Dal, Steamed Basmati Rice, 3 Ghee Phulkas, Raw Banana Sukhi Bhaji, and Saffron Kheer.",
    ingredients: ["Jain Paneer Masala", "Jain Moong Dal", "Raw Banana Bhaji", "Steamed Rice", "3 Ghee Phulkas", "Saffron Kheer"],
    tags: ["100% Jain Certified", "No Onion No Garlic", "Pure Ghee Prep"],
  },

  // --- DESSERTS & SWEETS ---
  {
    id: "ds-1",
    title: "Warm Shahi Gulab Jamun (2 Pcs)",
    mainCategory: "desserts",
    subCategory: "traditional-sweets",
    price: 6.99,
    oldPrice: 8.99,
    rating: 5.0,
    reviews: 190,
    prepTime: "5 min",
    calories: 340,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/gulab-jamun.jpg",
    shortDesc: "Mawa dumplings soaked in green cardamom & saffron scented rose sugar syrup.",
    fullDesc:
      "Pure condensed milk solids (khoya) kneaded tender, fried in pure desi ghee, and steeped in aromatic rose water, saffron, and green cardamom sugar syrup, garnished with slivered pistachios.",
    ingredients: ["Mawa Khoya", "Pure Desi Ghee", "Saffron Syrup", "Rose Water", "Pistachio Slivers"],
    tags: ["Melt In Mouth", "Desi Ghee", "Bestseller"],
  },
  {
    id: "ds-2",
    title: "Nutella Molten Lava Cake",
    mainCategory: "desserts",
    subCategory: "gourmet-cakes",
    price: 8.99,
    oldPrice: 11.99,
    rating: 4.9,
    reviews: 95,
    prepTime: "8 min",
    calories: 420,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: false,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/menu/5.jpg",
    shortDesc: "Warm dark chocolate sponge with molten flowing Nutella core & vanilla bean gelato.",
    fullDesc:
      "Decadent Belgian chocolate cake that oozes silky hot Nutella hazelnut cream with your first spoonful, served with a scoop of Madagascar vanilla gelato and strawberry coulis.",
    ingredients: ["Belgian Dark Chocolate", "Nutella Hazelnut Cream", "Vanilla Bean Gelato", "Berry Coulis"],
    tags: ["Hot & Cold", "Chocolate Lover", "Pure Veg"],
  },

  // --- BEVERAGES & COOLERS ---
  {
    id: "bv-1",
    title: "Royal Amritsari Malai Lassi",
    mainCategory: "beverages",
    subCategory: "creamy-lassis",
    price: 5.99,
    oldPrice: 7.99,
    rating: 4.9,
    reviews: 140,
    prepTime: "5 min",
    calories: 310,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "/img/category/beverage-lassi.jpg",
    shortDesc: "Thick hand-churned yogurt smoothie crowned with clotted cream & slivered nuts.",
    fullDesc:
      "Traditional earthen pot yogurt churned by hand with crushed sugar, rose essence, green cardamom, topped with a thick dollop of fresh malai and crushed almonds.",
    ingredients: ["Hand Churned Yogurt", "Clotted Malai", "Rose Essence", "Cardamom", "Almonds & Pistachios"],
    tags: ["Thick & Creamy", "Refreshing", "Signature"],
  },
  {
    id: "bv-2",
    title: "Alphonso Mango Saffron Shake",
    mainCategory: "beverages",
    subCategory: "milkshakes",
    price: 6.49,
    oldPrice: null,
    rating: 4.8,
    reviews: 112,
    prepTime: "5 min",
    calories: 290,
    spiceLevel: 1,
    isJain: true,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/beverage-lassi.jpg",
    shortDesc: "Ratnagiri Alphonso mango pulp blended with rich chilled milk & vanilla ice cream.",
    fullDesc:
      "Pure Alphonso mango puree blended with chilled organic milk, a scoop of vanilla ice cream, and steeped saffron strands for an irresistible tropical taste.",
    ingredients: ["Alphonso Mango Pulp", "Chilled Milk", "Vanilla Ice Cream", "Saffron Strands"],
    tags: ["Real Mango", "Summer Cool", "Kids Love"],
  },
  {
    id: "bv-3",
    title: "Masala Kulhad Chai (Hot)",
    mainCategory: "beverages",
    subCategory: "hot-brews",
    price: 3.99,
    oldPrice: null,
    rating: 4.9,
    reviews: 178,
    prepTime: "6 min",
    calories: 120,
    spiceLevel: 1,
    isJain: false,
    isGlutenFree: true,
    isChefSpecial: false,
    isBestseller: true,
    image: "/img/category/beverage-lassi.jpg",
    shortDesc: "Steaming Assam tea brewed with crushed ginger, cardamom, cinnamon in clay cup.",
    fullDesc:
      "Authentic street style slow-boiled black tea leaves simmered with fresh crushed ginger root, green cardamom, cloves, cinnamon stick, whole milk, served in an earthy terracotta kulhad.",
    ingredients: ["Assam Black Tea", "Crushed Fresh Ginger", "Cardamom & Cinnamon", "Whole Milk", "Clay Kulhad"],
    tags: ["Aromatic", "Immunity Booster", "Hot Brew"],
  },
];

export const fullMenuCatalog = [];

// ==========================================
// 2. CATEGORY DEFINITIONS & SUBCATEGORIES TREE (STATIC PREVIEW)
// ==========================================
export const CATEGORY_META = {
  "Fast Food": { emoji: "🍔" },
  "South Indian": { emoji: "🥞" },
  "North Indian": { emoji: "🍛" },
  "Chinese & Asian": { emoji: "🥢" },
  "Italian & Continental": { emoji: "🍕" },
  "Biryani & Rice Bowls": { emoji: "🍚" },
  "Desserts & Bakery": { emoji: "🍰" },
  "Beverages & Shakes": { emoji: "🥤" },
  "Street Food & Chaat": { emoji: "🫓" },
  "Healthy & Diet Food": { emoji: "🥗" },
};

export const categoryTree = {
  all: {
    name: "All Categories",
    icon: "✨",
    subcategories: [
      { id: "all", name: "All Items" },
      { id: "bestsellers", name: "⭐ Bestsellers" },
      { id: "chef-special", name: "👑 Chef Specials" },
      { id: "under-100", name: "⚡ Budget Picks (<₹100)" },
    ],
  },
  "fast-food": {
    name: "Fast Food",
    icon: "🍔",
    subcategories: [
      { id: "all", name: "All Fast Food" },
      { id: "burger", name: "Burger" },
      { id: "french-fries-sides", name: "French Fries & Sides" },
      { id: "sandwiches-subs", name: "Sandwiches & Subs" },
      { id: "crispy-fried-chicken", name: "Crispy Fried Chicken" },
    ],
  },
  "south-indian": {
    name: "South Indian",
    icon: "🥞",
    subcategories: [
      { id: "all", name: "All South Indian" },
      { id: "crispy-dosa", name: "Crispy Dosa" },
      { id: "idli-medu-vada", name: "Idli & Medu Vada" },
      { id: "uttapam-appam", name: "Uttapam & Appam" },
      { id: "south-indian-thali", name: "South Indian Thali" },
    ],
  },
  "north-indian": {
    name: "North Indian",
    icon: "🍛",
    subcategories: [
      { id: "all", name: "All North Indian" },
      { id: "paneer-specialties", name: "Paneer Specialties" },
      { id: "dal-makhani-curries", name: "Dal Makhani & Curries" },
      { id: "tandoori-roti-naan", name: "Tandoori Roti & Naan" },
      { id: "north-indian-deluxe-thali", name: "North Indian Deluxe Thali" },
    ],
  },
  chinese: {
    name: "Chinese & Asian",
    icon: "🥢",
    subcategories: [
      { id: "all", name: "All Chinese & Asian" },
      { id: "hakka-noodles-chowmein", name: "Hakka Noodles & Chowmein" },
      { id: "steamed-momos-dim-sum", name: "Steamed Momos & Dim Sum" },
      { id: "fried-rice-bowls", name: "Fried Rice & Bowls" },
      { id: "manchurian-chilli-gravy", name: "Manchurian & Chilli Gravy" },
    ],
  },
  "italian-continental": {
    name: "Italian & Continental",
    icon: "🍕",
    subcategories: [
      { id: "all", name: "All Italian & Continental" },
      { id: "gourmet-pizzas", name: "Gourmet Pizzas" },
      { id: "creamy-red-sauce-pastas", name: "Creamy & Red Sauce Pastas" },
      { id: "garlic-breads-bruschetta", name: "Garlic Breads & Bruschetta" },
      { id: "baked-lasagna-risotto", name: "Baked Lasagna & Risotto" },
    ],
  },
  "biryani-rice-bowls": {
    name: "Biryani & Rice Bowls",
    icon: "🍚",
    subcategories: [
      { id: "all", name: "All Biryani & Rice Bowls" },
      { id: "hyderabadi-dum-biryani", name: "Hyderabadi Dum Biryani" },
      { id: "kolkata-lucknowi-biryani", name: "Kolkata & Lucknowi Biryani" },
      { id: "pulao-jeera-rice", name: "Pulao & Jeera Rice" },
      { id: "seekh-kebabs-tikka", name: "Seekh Kebabs & Tikka" },
    ],
  },
  desserts: {
    name: "Desserts & Bakery",
    icon: "🍰",
    subcategories: [
      { id: "all", name: "All Desserts & Bakery" },
      { id: "cakes-pastries", name: "Cakes & Pastries" },
      { id: "ice-creams-sundaes", name: "Ice Creams & Sundaes" },
      { id: "waffles-brownies", name: "Waffles & Brownies" },
      { id: "gulab-jamun-sweets", name: "Gulab Jamun & Sweets" },
    ],
  },
  beverages: {
    name: "Beverages & Shakes",
    icon: "🥤",
    subcategories: [
      { id: "all", name: "All Beverages & Shakes" },
      { id: "thick-milkshakes", name: "Thick Milkshakes" },
      { id: "cold-coffee-frappe", name: "Cold Coffee & Frappe" },
      { id: "fresh-fruit-juices", name: "Fresh Fruit Juices" },
      { id: "refreshing-mocktails", name: "Refreshing Mocktails" },
    ],
  },
  "street-food": {
    name: "Street Food & Chaat",
    icon: "🫓",
    subcategories: [
      { id: "all", name: "All Street Food & Chaat" },
      { id: "pani-puri-gol-gappe", name: "Pani Puri & Gol Gappe" },
      { id: "mumbai-pav-bhaji", name: "Mumbai Pav Bhaji" },
      { id: "dahi-bhalla-papdi-chaat", name: "Dahi Bhalla & Papdi Chaat" },
      { id: "kathi-rolls-frankies", name: "Kathi Rolls & Frankies" },
    ],
  },
  "healthy-diet": {
    name: "Healthy & Diet Food",
    icon: "🥗",
    subcategories: [
      { id: "all", name: "All Healthy & Diet Food" },
      { id: "fresh-garden-salads", name: "Fresh Garden Salads" },
      { id: "high-protein-bowls", name: "High Protein Bowls" },
      { id: "smoothie-acai-bowls", name: "Smoothie & Acai Bowls" },
      { id: "fresh-fruit-platters", name: "Fresh Fruit Platters" },
    ],
  },
};

const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: 999999 },
  { id: "under-100", label: "Under ₹100", min: 0, max: 100 },
  { id: "100-200", label: "₹100 – ₹200", min: 100, max: 200 },
  { id: "200-300", label: "₹200 – ₹300", min: 200, max: 300 },
  { id: "above-300", label: "₹300 & Above", min: 300, max: 999999 },
];

// ==========================================
// 3. REDUX SLICE NORMALIZER
// Supports either a bare-array slice (state.XStateData = [...]) or a
// {data/list/items, loading, error} slice, so the UI never has to guess
// what shape the reducer actually returns.
// ==========================================
function normalizeSlice(slice) {
  if (Array.isArray(slice)) {
    return { data: slice, loading: false, error: null };
  }
  if (slice && typeof slice === "object") {
    const data = Array.isArray(slice.data)
      ? slice.data
      : Array.isArray(slice.list)
        ? slice.list
        : Array.isArray(slice.items)
          ? slice.items
          : [];
    return {
      data,
      loading: Boolean(slice.loading ?? slice.isLoading ?? slice.pending),
      error: slice.error ?? slice.errorMessage ?? null,
    };
  }
  return { data: [], loading: false, error: null };
}

// ==========================================
// 4. LOADING SKELETON
// ==========================================
function SkeletonGrid({ viewMode }) {
  const placeholders = Array.from({ length: 6 });

  if (viewMode === "list") {
    return (
      <div className="space-y-4" aria-hidden="true">
        {placeholders.map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-5 animate-pulse"
          >
            <div className="w-full sm:w-44 h-40 sm:h-36 rounded-2xl bg-zinc-100 shrink-0" />
            <div className="flex-1 w-full space-y-2.5">
              <div className="h-3 w-24 bg-zinc-100 rounded-full" />
              <div className="h-4 w-2/3 bg-zinc-100 rounded-full" />
              <div className="h-3 w-full bg-zinc-100 rounded-full" />
              <div className="h-3 w-1/2 bg-zinc-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5"
      aria-hidden="true"
    >
      {placeholders.map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden animate-pulse"
        >
          <div className="w-full h-36 sm:h-44 bg-zinc-100" />
          <div className="p-3 sm:p-4 space-y-2.5">
            <div className="h-3 w-1/3 bg-zinc-100 rounded-full" />
            <div className="h-4 w-4/5 bg-zinc-100 rounded-full" />
            <div className="h-3 w-full bg-zinc-100 rounded-full" />
            <div className="h-8 w-full bg-zinc-100 rounded-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuPageContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    addToCart, updateQty, addToWishlist, isInCart, isInWishlist, getQty,
    addedPopup, closeAddedPopup, clearCart, toast, cartCount, cartTotal,
  } = useCartWishlist();
  const { liveOrder } = useCart();

  // ------------------------------------------
  // REDUX: read the slices, normalize their shape, and derive
  // loading / error state that the rest of the component can trust.
  // ------------------------------------------
  const mainCategorySlice = useSelector((state) => state.MaincategoryStateData, shallowEqual);
  const subCategorySlice = useSelector((state) => state.SubcategoryStateData, shallowEqual);
  const productSlice = useSelector((state) => state.ProductStateData, shallowEqual);

  const {
    data: rawMainCategories,
    loading: mainCategoriesLoading,
    error: mainCategoriesError,
  } = normalizeSlice(mainCategorySlice);
  const { data: rawSubCategories, loading: subCategoriesLoading } = normalizeSlice(subCategorySlice);
  const {
    data: rawProducts,
    loading: productsLoading,
    error: productsError,
  } = normalizeSlice(productSlice);

  const hasLoadError = Boolean(mainCategoriesError || productsError);

  const fetchMenuData = () => {
    dispatch(getMaincategory());
    dispatch(getSubcategory());
    dispatch(getProduct());
  };

  useEffect(() => {
    fetchMenuData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Redux "loading" flags are trusted, but only for a short grace period.
  // If a reducer never flips `loading` back to false (wrong field name,
  // a missed success/failure action, a request that silently dies, etc.)
  // this used to leave the page blank forever with zero dishes ever
  // rendering — live or fallback. A hard timeout guarantees the page
  // always resolves to *something* within ~1.2s even if Redux never
  // reports itself as "done".
  const [loadingGraceElapsed, setLoadingGraceElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoadingGraceElapsed(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const reduxReportsLoading = mainCategoriesLoading || subCategoriesLoading || productsLoading;
  const hasAnyLiveData = rawMainCategories.length > 0 || rawProducts.length > 0;

  // True only for the very first fetch, before any data has arrived, and
  // only until the grace-period timeout fires.
  const isInitialLoading = !hasAnyLiveData && reduxReportsLoading && !loadingGraceElapsed;

  // Offline / backend-missing states should stay empty rather than show preview data.
  const usingPreviewCatalog = false;

  // Dynamically constructed Category Tree from backend data only.
  const dynamicCategoryTree = useMemo(() => {
    if (isInitialLoading) {
      return {
        all: {
          id: "all",
          _id: "all",
          name: "All",
          icon: "🍽️",
          subcategories: [{ id: "all", name: "All Dishes" }],
        },
      };
    }

    if (rawMainCategories.length === 0 && rawProducts.length === 0) {
      return {
        all: {
          id: "all",
          _id: "all",
          name: "All",
          icon: "🍽️",
          subcategories: [{ id: "all", name: "All Dishes" }],
        },
      };
    }

    const mains = rawMainCategories.filter((m) => m.active !== false);
    const subs = rawSubCategories.filter((s) => s.active !== false);

    const tree = {
      all: categoryTree.all,
    };

    mains.forEach((main) => {
      const meta = CATEGORY_META[main.name] || {};
      const childSubs = subs.filter((s) => {
        const parentId = s.maincategory?._id || s.maincategory;
        return String(parentId) === String(main._id);
      });

      tree[main.name] = {
        id: main.name,
        _id: main._id,
        name: main.name,
        icon: meta.emoji || "🍽️",
        subcategories: [
          { id: "all", name: `All ${main.name}` },
          ...childSubs.map((s) => ({
            id: s.name,
            _id: s._id,
            name: s.name,
            icon: "🍴",
          })),
        ],
      };
    });

    return tree;
  }, [rawMainCategories, rawSubCategories, isInitialLoading, usingPreviewCatalog]);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || searchParams.get("maincategory") || searchParams.get("cat");
  const subcategoryParam = searchParams.get("subcategory") || searchParams.get("sub");
  const searchQuery = searchParams.get("search") || "";

  // Local search state — synced with URL, used by the search input on the page
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Keep input in sync when URL changes (e.g. Navbar navigates to /menu?search=...)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Update URL search param when user types in the on-page search box
  const handleSearchInput = (value) => {
    setLocalSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.replace(query ? `/menu?${query}` : "/menu", { scroll: false });
  };

  // ------------------------------------------
  // FILTER STATES
  // ------------------------------------------
  const [selectedMainCat, setSelectedMainCat] = useState("all");
  const [selectedSubCat, setSelectedSubCat] = useState("all");

  // Automatically select maincategory and subcategory when URL search parameters change
  useEffect(() => {
    if (!categoryParam && !subcategoryParam) return;

    const catQuery = (categoryParam || "").toLowerCase().trim();
    const subQuery = (subcategoryParam || "").toLowerCase().trim();
    const clean = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    let matchedMainKey = null;

    // 1. Identify Main Category
    if (catQuery) {
      for (const [key, val] of Object.entries(dynamicCategoryTree)) {
        if (key === "all") continue;
        const kClean = clean(key);
        const nameClean = clean(val.name);
        const qClean = clean(catQuery);

        if (
          kClean === qClean ||
          nameClean === qClean ||
          nameClean.includes(qClean) ||
          qClean.includes(nameClean) ||
          (val._id && String(val._id).toLowerCase() === catQuery)
        ) {
          matchedMainKey = key;
          break;
        }
      }
    }

    // If maincategory is omitted, infer it from the subcategory
    if (!matchedMainKey && subQuery) {
      const sqClean = clean(subQuery);
      for (const [key, val] of Object.entries(dynamicCategoryTree)) {
        if (key === "all") continue;
        const hasSub = val.subcategories?.some((s) => {
          if (s.id === "all") return false;
          const sClean = clean(s.name || s.id);
          return sClean === sqClean || sClean.includes(sqClean) || sqClean.includes(sClean);
        });
        if (hasSub) {
          matchedMainKey = key;
          break;
        }
      }
    }

    if (matchedMainKey) {
      setSelectedMainCat(matchedMainKey);

      // 2. Identify Subcategory within the matched Main Category
      if (subQuery && dynamicCategoryTree[matchedMainKey]?.subcategories) {
        const sqClean = clean(subQuery);
        const matchedSub = dynamicCategoryTree[matchedMainKey].subcategories.find((s) => {
          if (s.id === "all") return false;
          const sNameClean = clean(s.name);
          const sIdClean = clean(s.id);
          const sDbId = (s._id || "").toString().toLowerCase();

          return (
            sIdClean === sqClean ||
            sNameClean === sqClean ||
            sDbId === subQuery ||
            sNameClean.includes(sqClean) ||
            sqClean.includes(sNameClean)
          );
        });

        if (matchedSub) {
          setSelectedSubCat(matchedSub.id);
        } else {
          setSelectedSubCat("all");
        }
      } else {
        setSelectedSubCat("all");
      }
    }
  }, [categoryParam, subcategoryParam, dynamicCategoryTree]);
  const [selectedPriceTier, setSelectedPriceTier] = useState("all");
  const [maxPriceSlider, setMaxPriceSlider] = useState(1000);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  // Dietary checkboxes
  const [dietaryJain, setDietaryJain] = useState(false);
  const [dietaryGF, setDietaryGF] = useState(false);
  const [dietaryChef, setDietaryChef] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState("all");

  // UI / Modal / Cart States
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false);
  const [quickViewDish, setQuickViewDish] = useState(null);

  // Pagination & Automatic Infinite Scroll States (Show 12 items initially)
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  // When main category changes, reset subcategory to "all"
  const handleMainCategoryChange = (catId) => {
    setSelectedMainCat(catId);
    setSelectedSubCat("all");
  };

  // Map Redux backend products into unified dish format
  const liveDishes = useMemo(() => {
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) return [];
    return rawProducts.filter((p) => p.active !== false).map(mapProductToDish);
  }, [rawProducts]);

  // Offline/no-backend states should not render dummy product data.
  const usingPreviewDishes = !isInitialLoading && liveDishes.length === 0;

  const allDishes = useMemo(() => {
    return liveDishes;
  }, [liveDishes]);

  // Compute maximum available price ceiling dynamically from dishes
  const maxAvailablePrice = useMemo(() => {
    if (!allDishes || allDishes.length === 0) return 1000;
    const maxVal = Math.max(...allDishes.map((d) => Number(d.price) || 0));
    return Math.max(500, Math.ceil((maxVal * 1.25) / 50) * 50);
  }, [allDishes]);

  // Auto-sync initial slider ceiling to max available price
  useEffect(() => {
    if (maxAvailablePrice > 0 && maxPriceSlider < maxAvailablePrice && maxPriceSlider <= 30) {
      setMaxPriceSlider(maxAvailablePrice);
    }
  }, [maxAvailablePrice, maxPriceSlider]);

  // Reset all filters
  const resetAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const query = params.toString();
    router.replace(query ? `/menu?${query}` : "/menu", { scroll: false });
    setSelectedMainCat("all");
    setSelectedSubCat("all");
    setSelectedPriceTier("all");
    setMaxPriceSlider(maxAvailablePrice);
    setDietaryJain(false);
    setDietaryGF(false);
    setDietaryChef(false);
    setSelectedSpice("all");
    setSortBy("featured");
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedMainCat !== "all") count++;
    if (selectedSubCat !== "all") count++;
    if (selectedPriceTier !== "all") count++;
    if (maxPriceSlider < maxAvailablePrice) count++;
    if (dietaryJain) count++;
    if (dietaryGF) count++;
    if (dietaryChef) count++;
    if (selectedSpice !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedMainCat,
    selectedSubCat,
    selectedPriceTier,
    maxPriceSlider,
    maxAvailablePrice,
    dietaryJain,
    dietaryGF,
    dietaryChef,
    selectedSpice,
    searchQuery,
  ]);

  // ------------------------------------------
  // FILTERING AND SORTING ENGINE
  // ------------------------------------------
  const filteredDishes = useMemo(() => {
    return allDishes
      .filter((dish) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (dish.title || "").toLowerCase().includes(q);
          const matchDesc =
            (dish.shortDesc || "").toLowerCase().includes(q) ||
            (dish.fullDesc || "").toLowerCase().includes(q);
          const matchIng = (dish.ingredients || []).some((ing) => (ing || "").toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchIng) return false;
        }

        const clean = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        // Main Category
        if (selectedMainCat !== "all") {
          const targetCat = dynamicCategoryTree[selectedMainCat]?.name || selectedMainCat;
          const dishCat = dish.mainCategory || "";
          const tcClean = clean(targetCat);
          const dcClean = clean(dishCat);

          const mainMatch =
            dish.mainCategory === selectedMainCat ||
            dish.mainCategoryId === selectedMainCat ||
            (tcClean && dcClean && (dcClean === tcClean || dcClean.includes(tcClean) || tcClean.includes(dcClean)));

          if (!mainMatch) return false;
        }

        // Sub Category
        if (selectedSubCat !== "all") {
          if (selectedMainCat === "all") {
            if (selectedSubCat === "bestsellers") {
              if (!dish.isBestseller) return false;
            } else if (selectedSubCat === "chef-special") {
              if (!dish.isChefSpecial) return false;
            } else if (selectedSubCat === "under-100" || selectedSubCat === "under-12") {
              if (Number(dish.price) >= 100) return false;
            } else {
              const tsClean = clean(selectedSubCat);
              const dsClean = clean(dish.subCategory || "");
              const subMatch =
                dish.subCategory === selectedSubCat ||
                dish.subCategoryId === selectedSubCat ||
                (tsClean && dsClean && (dsClean === tsClean || dsClean.includes(tsClean) || tsClean.includes(dsClean)));
              if (!subMatch) return false;
            }
          } else {
            const targetSub =
              dynamicCategoryTree[selectedMainCat]?.subcategories?.find(
                (s) => s.id === selectedSubCat
              )?.name || selectedSubCat;
            const dishSub = dish.subCategory || "";
            const tsClean = clean(targetSub);
            const dsClean = clean(dishSub);

            const subMatch =
              dish.subCategory === selectedSubCat ||
              dish.subCategoryId === selectedSubCat ||
              (tsClean && dsClean && (dsClean === tsClean || dsClean.includes(tsClean) || tsClean.includes(dsClean)));

            if (!subMatch) return false;
          }
        }

        const dishPrice = Number(dish.price) || 0;

        // Price Tier
        if (selectedPriceTier !== "all") {
          const tier = priceRanges.find((t) => t.id === selectedPriceTier);
          if (tier && (dishPrice < tier.min || dishPrice > tier.max)) {
            return false;
          }
        }

        // Price Slider (ceiling)
        if (dishPrice > maxPriceSlider) {
          return false;
        }

        // Dietary filters
        if (dietaryJain && !dish.isJain) return false;
        if (dietaryGF && !dish.isGlutenFree) return false;
        if (dietaryChef && !dish.isChefSpecial) return false;

        // Spice Level
        if (selectedSpice !== "all") {
          if (dish.spiceLevel !== parseInt(selectedSpice, 10)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        const aRating = Number(a.rating) || 0;
        const bRating = Number(b.rating) || 0;
        if (sortBy === "price-low") return aPrice - bPrice;
        if (sortBy === "price-high") return bPrice - aPrice;
        if (sortBy === "rating") return bRating - aRating;
        if (sortBy === "prep-time") return (parseInt(a.prepTime) || 0) - (parseInt(b.prepTime) || 0);
        // default "featured"
        if (a.isChefSpecial && !b.isChefSpecial) return -1;
        if (!a.isChefSpecial && b.isChefSpecial) return 1;
        return bRating - aRating;
      });
  }, [
    allDishes,
    searchQuery,
    selectedMainCat,
    selectedSubCat,
    selectedPriceTier,
    maxPriceSlider,
    dietaryJain,
    dietaryGF,
    dietaryChef,
    selectedSpice,
    sortBy,
    dynamicCategoryTree,
  ]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [
    searchQuery,
    selectedMainCat,
    selectedSubCat,
    selectedPriceTier,
    maxPriceSlider,
    sortBy,
    dietaryJain,
    dietaryGF,
    dietaryChef,
    selectedSpice,
  ]);

  // Automatic Infinite Scroll with IntersectionObserver
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= filteredDishes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && visibleCount < filteredDishes.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 450);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [visibleCount, filteredDishes.length, isLoadingMore]);

  // Available Subcategories based on active main category
  const activeSubcategories = dynamicCategoryTree[selectedMainCat]?.subcategories || [];

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 pt-32 sm:pt-36 lg:pt-40 pb-24 selection:bg-rose-500 selection:text-white">
      {/* ------------------------------------------
          HERO BANNER & SEARCH BAR (Clean, Airy & Spacious)
      ------------------------------------------ */}
      <section className="relative bg-gradient-to-b from-rose-50/80 via-white to-zinc-50 border-b border-rose-100/70 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-3">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Pure Veg Menu</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>100% Pure Vegetarian Masterpieces</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight">
                Our Delicious <span className="text-rose-600">Menu</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mt-1.5 font-medium">
                Explore Tastora's full culinary collection with all filters (Main Category, Subcategory, Price &amp; Diet) accessible in the filter panel.
              </p>
            </div>

          </div>


          {/* SEARCH BAR */}
          <div className="mt-5 relative max-w-2xl">
            <Search className="w-5 h-5 text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="menu-search-input"
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search dishes, ingredients, categories…"
              aria-label="Search menu dishes"
              className="w-full pl-11 pr-12 py-3 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 hover:border-zinc-300 transition-colors"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => handleSearchInput("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* MOBILE TOOLBAR (Filter trigger, counts & sorting for mobile screens) */}
          <div className="lg:hidden mt-4 bg-white rounded-2xl p-3 sm:p-4 border border-zinc-200/80 shadow-sm flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              {/* Mobile Filter Drawer Button */}
              <button
                onClick={() => setMobileFilterDrawerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters ({activeFiltersCount})</span>
              </button>

              <p className="text-xs font-bold text-zinc-800">
                {isInitialLoading ? (
                  "Loading menu…"
                ) : (
                  <>
                    Showing <span className="text-rose-600 font-extrabold">{Math.min(visibleCount, filteredDishes.length)}</span> of{" "}
                    <span className="text-zinc-900 font-extrabold">{filteredDishes.length}</span>{" "}
                    {filteredDishes.length === 1 ? "dish" : "dishes"}
                  </>
                )}
              </p>
            </div>

            {/* Mobile Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
              >
                <option value="featured">Featured / Best</option>
                <option value="rating">Highest Rated (★ 5.0)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="prep-time">Fastest Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROMINENT COMBOS & THALIS PROMO BANNER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🍱
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black tracking-tight">
                    Looking for Grand Value Combos &amp; Thalis?
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-rose-600 text-[10px] font-black uppercase shadow-2xs">
                    Save Up to 25%
                  </span>
                </div>
                <p className="text-xs text-rose-100 font-medium mt-0.5">
                  Explore our dedicated Combos Page with meal customizer, family feast boxes, and regional platters.
                </p>
              </div>
            </div>

            <Link
              href="/combos"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-black shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span>Explore Combos Page</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------
          REDUX FETCH ERROR BANNER
      ------------------------------------------ */}
      {hasLoadError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Couldn't load the live menu</p>
                <p className="text-xs text-red-700/80 mt-0.5">
                  {mainCategoriesError || productsError || "Something went wrong fetching menu data. Please try again."}
                </p>
              </div>
            </div>
            <button
              onClick={fetchMenuData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------
          PREVIEW-DATA NOTICE (only when backend has nothing yet)
      ------------------------------------------ */}
      {!hasLoadError && usingPreviewDishes && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800">
            <Info className="w-4 h-4 shrink-0" />
            <p className="text-xs font-semibold">
              Menu data is currently unavailable. Please check your internet connection or try again later.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------
          MAIN CONTENT AREA (Sidebar Filters + Dish Grid)
      ------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ==========================================
              LEFT SIDEBAR FILTERS (Desktop)
          ========================================== */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-6">
              {/* Filter Header with Reset */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                  <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                )}
              </div>

              {/* ==========================================
                  1. MAIN CATEGORY FILTER (Tier 1)
              ========================================== */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-rose-600" />
                    <span>Main Category</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {Object.keys(dynamicCategoryTree).length - 1} Cuisines
                  </span>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(dynamicCategoryTree).map(([catId, catData]) => {
                    const isSelected = selectedMainCat === catId;
                    const count =
                      catId === "all"
                        ? allDishes.length
                        : allDishes.filter((d) => {
                          const dishCat = (d.mainCategory || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                          const targetCat = (catData.name || catId).toLowerCase().replace(/[^a-z0-9]/g, "");
                          return dishCat === targetCat || dishCat.includes(targetCat) || targetCat.includes(dishCat);
                        }).length;

                    return (
                      <button
                        key={catId}
                        onClick={() => handleMainCategoryChange(catId)}
                        className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${isSelected
                          ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white border-transparent shadow-md shadow-rose-600/25 font-bold scale-[1.01]"
                          : "bg-zinc-50/80 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border-zinc-200/70 hover:border-rose-200 shadow-2xs hover:shadow-xs"
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform duration-200 group-hover:scale-110 ${isSelected
                              ? "bg-white/20 text-white backdrop-blur-xs"
                              : "bg-rose-100/60 text-zinc-800"
                              }`}
                          >
                            {catData.icon}
                          </span>
                          <span className="font-bold">{catData.name}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${isSelected
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

              {/* ==========================================
                  2. DYNAMIC SUBCATEGORY FILTER (Tier 2)
              ========================================== */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-600" />
                    <span>Subcategory</span>
                  </label>
                  {selectedSubCat !== "all" && (
                    <button
                      onClick={() => setSelectedSubCat("all")}
                      className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeSubcategories.map((sub) => {
                    const isSubSelected = selectedSubCat === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubCat(sub.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${isSubSelected
                          ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white border-transparent shadow-xs shadow-rose-600/30"
                          : "bg-zinc-50 hover:bg-rose-50 hover:text-rose-700 text-zinc-600 border-zinc-200/80 hover:border-rose-200 shadow-2xs"
                          }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  3. PRICE FILTER SECTION
              ========================================== */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <span className="font-serif font-black text-rose-600 text-sm">₹</span>
                    <span>Price Range</span>
                  </label>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                    Max: ₹{maxPriceSlider}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max={maxAvailablePrice}
                  step="10"
                  value={maxPriceSlider}
                  onChange={(e) => setMaxPriceSlider(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                  <span>₹0</span>
                  <span>₹{Math.round(maxAvailablePrice / 2)}</span>
                  <span>₹{maxAvailablePrice}</span>
                </div>

                {/* Price Tier Quick Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {priceRanges.map((range) => {
                    const isRangeSelected = selectedPriceTier === range.id;
                    return (
                      <button
                        key={range.id}
                        onClick={() => setSelectedPriceTier(range.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all border cursor-pointer ${isRangeSelected
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-zinc-50 text-zinc-600 border-zinc-200/80 hover:bg-zinc-100"
                          }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  4. DIETARY PREFERENCES
              ========================================== */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Dietary &amp; Special
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Jain Friendly (No Onion/Garlic)
                    </span>
                    <input
                      type="checkbox"
                      checked={dietaryJain}
                      onChange={(e) => setDietaryJain(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 border-zinc-300 accent-rose-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Gluten Free Options
                    </span>
                    <input
                      type="checkbox"
                      checked={dietaryGF}
                      onChange={(e) => setDietaryGF(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 border-zinc-300 accent-rose-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                      Chef's Signature Picks
                    </span>
                    <input
                      type="checkbox"
                      checked={dietaryChef}
                      onChange={(e) => setDietaryChef(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 border-zinc-300 accent-rose-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* ==========================================
                  5. SPICE LEVEL FILTER
              ========================================== */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Spice Tolerance
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "1", label: "Mild 🌶️" },
                    { id: "2", label: "Med 🌶️🌶️" },
                    { id: "3", label: "Hot 🔥" },
                  ].map((spice) => (
                    <button
                      key={spice.id}
                      onClick={() => setSelectedSpice(spice.id)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${selectedSpice === spice.id
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                        }`}
                    >
                      {spice.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pure Veg Guarantee Badge */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold">100% Pure Vegetarian</p>
                  <p className="text-emerald-700/80 leading-snug mt-0.5">
                    Dedicated pure vegetarian kitchens with zero meat cross-contact.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ==========================================
              RIGHT MAIN SECTION (Dish List & Controls)
          ========================================== */}
          <main className="flex-1 min-w-0 w-full">
            {/* Top Toolbar (Sort + View Switch + Results Count for Desktop) */}
            <div className="hidden lg:flex bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <p className="text-xs sm:text-sm font-bold text-zinc-800">
                  {isInitialLoading ? (
                    "Loading menu…"
                  ) : (
                    <>
                      Showing <span className="text-rose-600 font-extrabold">{Math.min(visibleCount, filteredDishes.length)}</span> of{" "}
                      <span className="text-zinc-900 font-extrabold">{filteredDishes.length}</span>{" "}
                      {filteredDishes.length === 1 ? "dish" : "dishes"}
                    </>
                  )}
                </p>
              </div>

              {/* Sort & Grid/List toggle */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
                  >
                    <option value="featured">Featured / Best</option>
                    <option value="rating">Highest Rated (★ 5.0)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="prep-time">Fastest Delivery</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid"
                      ? "bg-white text-rose-600 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list"
                      ? "bg-white text-rose-600 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags Row */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-xs font-semibold text-zinc-400">Active filters:</span>

                {selectedMainCat !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                    Category: {dynamicCategoryTree[selectedMainCat]?.name || selectedMainCat}
                    <button onClick={() => handleMainCategoryChange("all")} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {selectedSubCat !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-200 text-zinc-800 text-xs font-semibold">
                    Sub: {activeSubcategories.find((s) => s.id === selectedSubCat)?.name || selectedSubCat}
                    <button onClick={() => setSelectedSubCat("all")} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {selectedPriceTier !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    Tier: {priceRanges.find((p) => p.id === selectedPriceTier)?.label}
                    <button onClick={() => setSelectedPriceTier("all")} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {maxPriceSlider < maxAvailablePrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    Max: ₹{maxPriceSlider}
                    <button onClick={() => setMaxPriceSlider(maxAvailablePrice)} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {dietaryJain && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    Jain Friendly
                    <button onClick={() => setDietaryJain(false)} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {dietaryGF && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    Gluten Free
                    <button onClick={() => setDietaryGF(false)} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {dietaryChef && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                    Chef Special
                    <button onClick={() => setDietaryChef(false)} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                {selectedSpice !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                    Spice: {selectedSpice === "1" ? "Mild" : selectedSpice === "2" ? "Medium" : "Spicy"}
                    <button onClick={() => setSelectedSpice("all")} className="cursor-pointer">
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-rose-600 hover:underline ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ------------------------------------------
                DISHES GRID / LIST VIEW (12 Items initially + Load More)
            ------------------------------------------ */}
            {isInitialLoading && allDishes.length === 0 ? (
              <SkeletonGrid viewMode={viewMode} />
            ) : filteredDishes.length > 0 ? (
              <div className="space-y-8">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5"
                      : "space-y-4"
                  }
                >
                  {filteredDishes.slice(0, visibleCount).map((dish) => {
                    return (
                      <Menucard
                        key={dish.id}
                        dish={dish}
                        viewMode={viewMode}
                        inCart={isInCart(dish)}
                        qty={getQty(dish)}
                        getQtyForDish={getQty}
                        onUpdateQty={updateQty}
                        inWishlist={isInWishlist(dish)}
                        onAddToCart={addToCart}
                        onToggleWishlist={addToWishlist}
                        onQuickView={setQuickViewDish}
                      />
                    );
                  })}
                </div>

                {/* AUTOMATIC LOAD MORE & LOADING SIGN CONTROLS */}
                <div className="pt-4 pb-6 flex flex-col items-center justify-center space-y-4">
                  {/* Progress Indicator */}
                  <div className="flex flex-col items-center space-y-1.5 w-full max-w-xs text-center">
                    <div className="flex items-center justify-between w-full text-xs font-bold text-zinc-500">
                      <span>Showing {Math.min(visibleCount, filteredDishes.length)} of {filteredDishes.length} dishes</span>
                      <span className="text-rose-600 font-black">
                        {Math.round((Math.min(visibleCount, filteredDishes.length) / filteredDishes.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(Math.min(visibleCount, filteredDishes.length) / filteredDishes.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Automatic Loading Indicator / Sentinel */}
                  {visibleCount < filteredDishes.length ? (
                    <div
                      ref={loadMoreRef}
                      className="py-6 flex flex-col items-center justify-center gap-2.5 animate-in fade-in duration-300"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                      </div>
                      <span className="text-xs font-bold text-zinc-500 animate-pulse">
                        Loading more delicious dishes...
                      </span>
                    </div>
                  ) : (
                    filteredDishes.length > 12 && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>You have viewed all {filteredDishes.length} dishes in this category</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm space-y-4 max-w-md mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">No dishes match your filters</h3>
                  <p className="text-xs text-zinc-500">
                    Try adjusting the price range, subcategory, or search keywords to find delicious meals.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ------------------------------------------
          MOBILE FILTER DRAWER (Slide Up with Main Cat & Subcat)
      ------------------------------------------ */}
      {mobileFilterDrawerOpen && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-h-[88vh] overflow-y-auto bg-white rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-base font-bold text-zinc-900">
                <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                <span>Filters &amp; Categories</span>
              </div>
              <button
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="p-1 rounded-full bg-zinc-100 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Main Category in Mobile Drawer */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 block">
                1. Main Category
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(dynamicCategoryTree).map(([catId, catData]) => {
                  const isSelected = selectedMainCat === catId;
                  return (
                    <button
                      key={catId}
                      onClick={() => handleMainCategoryChange(catId)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold border ${isSelected
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200"
                        }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{catData.icon}</span>
                        <span className="truncate">{catData.name}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Subcategory in Mobile Drawer */}
            <div className="space-y-2 pt-3 border-t border-zinc-100">
              <label className="text-xs font-bold uppercase text-zinc-500 block">
                2. Subcategory
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCat(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${selectedSubCat === sub.id
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Price Filter in Mobile Drawer */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-zinc-500">
                  3. Max Price: ₹{maxPriceSlider}
                </label>
              </div>
              <input
                type="range"
                min="0"
                max={maxAvailablePrice}
                step="10"
                value={maxPriceSlider}
                onChange={(e) => setMaxPriceSlider(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-2">
                <span>₹0</span>
                <span>₹{Math.round(maxAvailablePrice / 2)}</span>
                <span>₹{maxAvailablePrice}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {priceRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setSelectedPriceTier(range.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border ${selectedPriceTier === range.id
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Dietary & Special in Mobile Drawer */}
            <div className="space-y-2 pt-3 border-t border-zinc-100">
              <label className="text-xs font-bold uppercase text-zinc-500 block">
                4. Dietary Options
              </label>
              <label className="flex items-center justify-between text-xs text-zinc-700 font-medium">
                <span>Jain Friendly (No Onion/Garlic)</span>
                <input
                  type="checkbox"
                  checked={dietaryJain}
                  onChange={(e) => setDietaryJain(e.target.checked)}
                  className="w-4 h-4 accent-rose-600"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-zinc-700 font-medium">
                <span>Gluten Free Options</span>
                <input
                  type="checkbox"
                  checked={dietaryGF}
                  onChange={(e) => setDietaryGF(e.target.checked)}
                  className="w-4 h-4 accent-rose-600"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-zinc-700 font-medium">
                <span>Chef's Signature Picks</span>
                <input
                  type="checkbox"
                  checked={dietaryChef}
                  onChange={(e) => setDietaryChef(e.target.checked)}
                  className="w-4 h-4 accent-rose-600"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Show {filteredDishes.length} Dishes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------
          QUICK VIEW DISH DETAILS MODAL
      ------------------------------------------ */}
      {quickViewDish && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Image Banner */}
            <div className="relative w-full h-56 sm:h-64 bg-zinc-100 shrink-0">
              <img
                src={quickViewDish.image}
                alt={quickViewDish.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setQuickViewDish(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-zinc-700 hover:bg-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-white text-xs font-bold">
                  {quickViewDish.mainCategory.toUpperCase().replace("-", " ")}
                </span>
                {quickViewDish.isJain && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    Jain Friendly
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                    {quickViewDish.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 mt-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{quickViewDish.rating}</span>
                      <span className="text-zinc-400 font-normal">
                        ({quickViewDish.reviews} reviews)
                      </span>
                    </div>
                    {quickViewDish.prepTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          {quickViewDish.prepTime}
                        </span>
                      </>
                    )}
                    {quickViewDish.calories && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          {quickViewDish.calories} kcal
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-rose-600">
                    ₹{(Number(quickViewDish.price) || 0).toFixed(0)}
                  </span>
                  {quickViewDish.oldPrice && (
                    <span className="text-xs text-zinc-400 line-through block">
                      ₹{(Number(quickViewDish.oldPrice) || 0).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {quickViewDish.fullDesc}
              </p>

              {/* Ingredients */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                  Ingredients &amp; Spices:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickViewDish.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => addToWishlist(quickViewDish)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-white text-zinc-700 font-bold text-xs hover:text-rose-600 hover:border-rose-200 cursor-pointer transition-colors"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(quickViewDish) ? "fill-rose-600 text-rose-600" : ""}`} />
                <span>{isInWishlist(quickViewDish) ? "Saved" : "Save"}</span>
              </button>

              {getQty(quickViewDish) > 0 ? (
                <div className="flex items-center gap-2.5">
                  <QtyStepper
                    qty={getQty(quickViewDish)}
                    disabled={!isInCart(quickViewDish)}
                    onChange={(d) => updateQty(quickViewDish, d)}
                  />
                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:shadow-lg transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Cart</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    addToCart(quickViewDish);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:shadow-lg transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Addtocart totalCartCount={cartCount} totalCartAmount={cartTotal} onClearCart={clearCart} />

      {toast && (
        <div className="fixed top-24 right-6 z-70 bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
      <CartAddedPopup
        popup={addedPopup}
        getQty={getQty}
        isInCart={isInCart}
        onUpdateQty={updateQty}
        onClose={closeAddedPopup}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MenuPageContent />
    </Suspense>
  );
}