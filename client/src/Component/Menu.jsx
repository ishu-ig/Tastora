"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
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
  ArrowUpRight,
  SlidersHorizontal,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { fullMenuCatalog, categoryTree } from "../app/menu/page";

export { fullMenuCatalog, categoryTree };

export function Menu({ isHomePage = true } = {}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewDish, setQuickViewDish] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [favorites, setFavorites] = useState({});
  const [addedToast, setAddedToast] = useState(null);

  // Cart operations
  const updateQuantity = (id, delta, dish) => {
    setCartItems((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });

    if (delta > 0 && dish) {
      setAddedToast(dish.title);
      setTimeout(() => setAddedToast(null), 2500);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Cart stats
  const totalCartCount = Object.values(cartItems).reduce((sum, q) => sum + q, 0);
  const totalCartAmount = Object.entries(cartItems).reduce((sum, [id, qty]) => {
    const item = fullMenuCatalog.find((d) => d.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Filtered dishes for homepage view (show top 8 or 12 per category)
  const displayedDishes = useMemo(() => {
    let list = fullMenuCatalog;
    if (selectedCategory !== "all") {
      list = list.filter((dish) => dish.mainCategory === selectedCategory);
    }
    return list.slice(0, 8);
  }, [selectedCategory]);

  return (
    <section id="menu" className="py-12 sm:py-16 bg-gradient-to-b from-white via-rose-50/30 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>100% Pure Vegetarian Masterpieces</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Our Delicious <span className="text-rose-600">Menu</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mt-1 font-medium">
              Handcrafted specialties prepared with farm-fresh ingredients and traditional spices at Tastora.
            </p>
          </div>

          {/* Direct Link to Full Menu Page with Filters */}
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start md:self-auto group"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
            <span>Open Menu with All Filters</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </Link>
        </div>

        {/* Clean Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {Object.entries(categoryTree).map(([catId, catData]) => {
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white border-transparent shadow-md shadow-rose-600/25 scale-[1.02]"
                    : "bg-white text-zinc-700 hover:text-rose-600 border-zinc-200/80 hover:border-rose-200 shadow-2xs hover:shadow-xs"
                }`}
              >
                <span>{catData.icon}</span>
                <span>{catData.name}</span>
              </button>
            );
          })}
        </div>

        {/* Full-Width Clean Dishes Grid (No Sidebar Filters on Homepage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayedDishes.map((dish) => {
            const isFav = favorites[dish.id] || false;
            const qty = cartItems[dish.id] || 0;

            return (
              <div
                key={dish.id}
                className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-xl hover:border-rose-200/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Media Header */}
                <div className="relative w-full h-40 sm:h-44 bg-zinc-100 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {/* Pure Veg Green Badge */}
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/95 backdrop-blur-sm border border-emerald-600 flex items-center justify-center shadow-xs">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600"></span>
                    </div>

                    {dish.isBestseller && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[9px] sm:text-[10px] font-bold shadow-xs">
                        Bestseller
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    onClick={() => toggleFavorite(dish.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-zinc-500 hover:text-rose-500 transition-all shadow-xs cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isFav ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>

                  {/* Prep time badge on bottom */}
                  <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-zinc-950/75 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                    <span>{dish.prepTime}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                      <span className="text-rose-600 uppercase tracking-wider">
                        {dish.subCategory.replace("-", " ")}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{dish.rating}</span>
                        <span className="text-zinc-400 font-normal">({dish.reviews})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setQuickViewDish(dish)}
                      className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {dish.title}
                    </h3>

                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {dish.shortDesc}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm sm:text-base font-black text-zinc-900">
                        ${dish.price.toFixed(2)}
                      </span>
                      {dish.oldPrice && (
                        <span className="text-[10px] text-zinc-400 line-through block leading-none">
                          ${dish.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => updateQuantity(dish.id, 1, dish)}
                        className="h-[34px] px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs hover:shadow-rose-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="h-[34px] px-2 rounded-full bg-rose-600 text-white shadow-xs flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(dish.id, -1, dish)}
                          className="w-6 h-6 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold min-w-[14px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(dish.id, 1, dish)}
                          className="w-6 h-6 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer"
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

        {/* Bottom Banner linking to Full Menu with Advanced Filters */}
        <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              🔍
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black">
                Looking for Detailed Dietary &amp; Price Filters?
              </h4>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                Visit our dedicated Menu page with Subcategories, Jain-friendly toggles, Price Sliders &amp; Infinite Scroll.
              </p>
            </div>
          </div>

          <Link
            href="/menu"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore All 35+ Dishes with Filters</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* QUICK VIEW DISH DETAILS MODAL */}
      {quickViewDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
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
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      {quickViewDish.prepTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      {quickViewDish.calories} kcal
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-rose-600">
                    ${quickViewDish.price.toFixed(2)}
                  </span>
                  {quickViewDish.oldPrice && (
                    <span className="text-xs text-zinc-400 line-through block">
                      ${quickViewDish.oldPrice.toFixed(2)}
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500">Qty:</span>
                <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-2 py-1">
                  <button
                    onClick={() => updateQuantity(quickViewDish.id, -1, quickViewDish)}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold min-w-[16px] text-center">
                    {cartItems[quickViewDish.id] || 1}
                  </span>
                  <button
                    onClick={() => updateQuantity(quickViewDish.id, 1, quickViewDish)}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!cartItems[quickViewDish.id]) {
                    updateQuantity(quickViewDish.id, 1, quickViewDish);
                  }
                  setQuickViewDish(null);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Bar (When items in cart) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-zinc-950/95 backdrop-blur-xl text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-zinc-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-600/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>{totalCartCount} {totalCartCount === 1 ? "Item" : "Items"} in Cart</span>
                <span className="text-zinc-500">•</span>
                <span className="text-amber-400 font-extrabold">${totalCartAmount.toFixed(2)}</span>
              </p>
              <p className="text-[10px] text-zinc-400">
                Includes free contactless delivery
              </p>
            </div>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added "{addedToast}" to cart!</span>
        </div>
      )}
    </section>
  );
}

export default Menu;
