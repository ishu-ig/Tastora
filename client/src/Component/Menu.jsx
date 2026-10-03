"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { getProduct } from "@/Redux/ActionCreators/ProductActionCreators";
import { getMaincategory } from "@/Redux/ActionCreators/MaincategoryActionCreators";
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
import { Menucard } from "./MenuCard";
import useCartWishlist from "@/hooks/useCartWishlist";
import { useCart } from "../context/CartContext";
import { mapProductToDish, rupee } from "@/lib/MenuDish";
import { Addtocart } from "./AddToCart";
import QtyStepper from "./QtyStepper";
import { CartAddedPopup } from "./Cartaddedpoup";

export function Menu() {
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewDish, setQuickViewDish] = useState(null);
  const {
    addToCart, updateQty, addToWishlist, isInCart, isInWishlist, getQty,
    addedPopup, closeAddedPopup, clearCart, toast, cartCount, cartTotal,
  } = useCartWishlist();
  const { liveOrder } = useCart();

  // ── Redux state ────────────────────────────────────────────────────────────
  // ADAPT the key names below if your reducers mount under different keys.
  const rawProducts = useSelector((state) => state.ProductStateData);
  const rawMainCategories = useSelector((state) => state.MaincategoryStateData);

  useEffect(() => {
    dispatch(getProduct());
    dispatch(getMaincategory());
  }, [dispatch]);

  const dishes = useMemo(
    () => (Array.isArray(rawProducts) ? rawProducts.filter((p) => p.active !== false).map(mapProductToDish) : []),
    [rawProducts]
  );

  // ── Category tabs, built from real Maincategory data instead of the static
  // categoryTree. No icon/emoji field exists on Maincategory in your schema,
  // so every tab uses a generic Utensils icon — swap this for a real field
  // (e.g. main.icon) once/if you add one.
  const categoryTabs = useMemo(() => {
    const mains = Array.isArray(rawMainCategories)
      ? rawMainCategories.filter((m) => m.active !== false)
      : [];
    return [
      { id: "all", name: "All Dishes", icon: <Utensils className="w-3.5 h-3.5" /> },
      ...mains.map((m) => ({
        id: m._id,
        name: m.name,
        icon: <Utensils className="w-3.5 h-3.5" />,
      })),
    ];
  }, [rawMainCategories]);

  // Filtered dishes for homepage view (show top 8 per category)
  const displayedDishes = useMemo(() => {
    let list = dishes;
    if (selectedCategory !== "all") {
      list = list.filter((dish) => dish.mainCategoryId === selectedCategory);
    }
    return list.slice(0, 8);
  }, [dishes, selectedCategory]);

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
          {categoryTabs.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer shrink-0 ${isSelected
                  ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white border-transparent shadow-md shadow-rose-600/25 scale-[1.02]"
                  : "bg-white text-zinc-700 hover:text-rose-600 border-zinc-200/80 hover:border-rose-200 shadow-2xs hover:shadow-xs"
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Empty state while products are loading / none returned */}
        {displayedDishes.length === 0 && (
          <div className="text-center py-16 text-zinc-400 text-sm font-medium">
            Loading dishes…
          </div>
        )}

        {/* Full-Width Clean Dishes Grid (No Sidebar Filters on Homepage) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {displayedDishes.map((dish) => {
            return (
              <Menucard
                key={dish.id}
                dish={dish}
                viewMode={"grid"}
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
            <span>Explore All Dishes with Filters</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* QUICK VIEW DISH DETAILS MODAL */}
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
                  {quickViewDish.mainCategory?.toUpperCase()}
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
                    {rupee(quickViewDish.price)}
                  </span>
                  {quickViewDish.oldPrice && (
                    <span className="text-xs text-zinc-400 line-through block">
                      {rupee(quickViewDish.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {quickViewDish.fullDesc}
              </p>

              {/* Ingredients */}
              {quickViewDish.ingredients?.length > 0 && (
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
              )}
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
        <div className="fixed top-24 right-6 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
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
    </section>
  );
}

export default Menu;