"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Sparkles,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight,
  Search,
  Utensils,
  X,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getProduct } from "@/Redux/ActionCreators/ProductActionCreators";
import useCartWishlist from "@/hooks/useCartWishlist";
import { CartAddedPopup } from "@/Component/Cartaddedpoup";
import { mapProductToDish } from "@/lib/MenuDish";
import { fullMenuCatalog } from "@/app/menu/page";

export default function WishlistPage() {
  const dispatch = useDispatch();

  // Profile / coins still come from the context (UI-only data).
  const { userProfile, creditCoinsBalance } = useCart();

  // Wishlist + cart both come from Redux (WishlistStateData / CartStateData -> database).
  const {
    addToCart,
    updateQty,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    wishlistItems,
    wishlistLoaded,
    isInCart,
    isInWishlist,
    getQty,
    addedPopup,
    closeAddedPopup,
    toast,
    cartCount,
    cartTotal,
    clearCart,
  } = useCartWishlist();

  // Product data (a wishlist entry only stores the product id, so we look the dish up here)
  const productSlice = useSelector((state) => state.ProductStateData, shallowEqual);

  useEffect(() => {
    dispatch(getProduct());
  }, [dispatch]);

  const allDishes = useMemo(() => {
    const list = Array.isArray(productSlice?.data)
      ? productSlice.data
      : Array.isArray(productSlice)
        ? productSlice
        : [];
    return list.filter((p) => p.active !== false).map(mapProductToDish);
  }, [productSlice]);

  // Wishlist entries -> dishes (one card per product, checking DB items + catalog)
  const wishlistedDishes = useMemo(() => {
    const byId = new Map();
    (fullMenuCatalog || []).forEach((d) => byId.set(String(d.id), d));
    allDishes.forEach((d) => byId.set(String(d.id), d));

    const seen = new Set();
    const out = [];

    (wishlistItems || []).forEach((w) => {
      const p = w.product;
      const pid = String(p?._id || p || "");
      let dish = byId.get(pid);
      if (!dish && p && typeof p === "object" && p.name) {
        dish = mapProductToDish(p);
      }
      if (dish && !seen.has(dish.id)) {
        seen.add(dish.id);
        out.push(dish);
      }
    });

    return out;
  }, [allDishes, wishlistItems]);

  // Don't flash "Your Wishlist is Empty" while data is still on its way
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const ready =
    timedOut ||
    (wishlistLoaded && (wishlistItems.length === 0 || allDishes.length > 0)) ||
    wishlistedDishes.length > 0;

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return wishlistedDishes;
    const q = searchQuery.toLowerCase();
    return wishlistedDishes.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.mainCategory?.toLowerCase().includes(q) ||
        d.subCategory?.toLowerCase().includes(q)
    );
  }, [wishlistedDishes, searchQuery]);

  // Empty wishlist state
  if (ready && wishlistedDishes.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-4 border-b border-zinc-200/80 mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-rose-600 font-bold">Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 flex items-center gap-3">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center shadow-inner">
              <Heart className="w-14 h-14 text-rose-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900">Your Wishlist is Empty</h2>
              <p className="text-zinc-500 max-w-sm">
                Save your favourite dishes here so you can order them later with a single tap.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-rose-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all text-sm"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-28">
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {addedPopup && (
        <CartAddedPopup
          popup={addedPopup}
          getQty={getQty}
          isInCart={isInCart}
          onUpdateQty={updateQty}
          onClose={closeAddedPopup}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="pb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 flex items-center gap-3">
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                My Wishlist
                <span className="text-sm font-bold text-zinc-400">
                  ({wishlistedDishes.length} items)
                </span>
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Your saved favourites — ready to order anytime.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {cartCount > 0 && (
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-sm font-bold shadow-md hover:shadow-rose-500/30 hover:scale-[1.02] transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart ({cartCount})</span>
                </Link>
              )}

              <button
                onClick={() => clearWishlist()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {wishlistedDishes.length > 4 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your wishlist…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-zinc-500 font-medium">No dishes match "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-rose-600 text-sm font-bold underline-offset-2 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((dish) => {
              const inCart = isInCart(dish);
              const qty = getQty(dish);

              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-3xl overflow-hidden border border-zinc-200/80 hover:border-rose-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  <div className="relative overflow-hidden h-44 bg-zinc-100">
                    <img
                      src={dish.image || "/img/category/paneer-tikka.jpg"}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <button
                      onClick={() => removeFromWishlist(dish)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 group-hover:fill-white" />
                    </button>

                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {dish.isBestseller && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Bestseller
                        </span>
                      )}
                      {dish.isChefSpecial && (
                        <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Chef's Pick
                        </span>
                      )}
                    </div>

                    {dish.rating > 0 && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-zinc-800">
                          {dish.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-3 h-3 rounded bg-white border border-emerald-600 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      </span>
                      {dish.subCategory && (
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                          {dish.subCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-zinc-900 leading-snug line-clamp-2 flex-1">
                      {dish.title}
                    </h3>

                    {dish.shortDesc && (
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{dish.shortDesc}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-rose-600">
                        ₹{Math.round(dish.price)}
                      </span>
                      {dish.oldPrice && (
                        <span className="text-xs text-zinc-400 line-through">
                          ₹{Math.round(dish.oldPrice)}
                        </span>
                      )}
                      {dish.oldPrice && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {Math.round(((dish.oldPrice - dish.price) / dish.oldPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {dish.prepTime && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{dish.prepTime}</span>
                      </div>
                    )}

                    <div className="pt-1">
                      {!inCart ? (
                        <button
                          onClick={() => addToCart(dish)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-bold hover:shadow-md hover:shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-rose-600 rounded-xl px-3 py-1.5">
                          <button
                            onClick={() => updateQty(dish, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-white stroke-[3]" />
                          </button>
                          <span className="text-white text-sm font-black">{qty}</span>
                          <button
                            onClick={() => updateQty(dish, +1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-white stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {wishlistedDishes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-zinc-200/80">
            <p className="text-sm text-zinc-500">
              <span className="font-bold text-zinc-900">{wishlistedDishes.length}</span> saved
              dishes • <span className="font-bold text-zinc-900">{cartCount}</span> in cart
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/menu"
                className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:underline underline-offset-2"
              >
                <Plus className="w-4 h-4" />
                Add More Dishes
              </Link>

              {cartCount > 0 && (
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-rose-500/25 hover:scale-[1.02] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Go to Cart
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
