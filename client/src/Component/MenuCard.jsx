"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  Heart,
  ShoppingBag,
  Clock,
  Flame,
  Eye,
  Plus,
  Minus,
  X,
  Sparkles,
  Check,
  UtensilsCrossed,
  Navigation,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { rupee } from "@/lib/MenuDish";
import QtyStepper from "./QtyStepper";

// Shows "Add" until the dish is in the cart, then changes to the +/- QtyStepper.
function CartControl({
  dish,
  qty,
  onAddToCart,
  onUpdateQty,
  onOpenVariants,
  hasVariantOptions,
  onVariantStepChange,
  size,
}) {
  if (qty > 0) {
    return (
      <div className="flex flex-col items-end gap-1">
        <QtyStepper
          qty={qty}
          size={size === "sm" ? "sm" : "md"}
          onChange={(delta) => {
            if (hasVariantOptions && onVariantStepChange) {
              onVariantStepChange(delta);
            } else {
              onUpdateQty?.(dish, delta);
            }
          }}
        />
        {hasVariantOptions && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenVariants?.();
            }}
            className="text-[9px] sm:text-[10px] font-extrabold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer leading-tight tracking-tight"
          >
            Customise ▾
          </button>
        )}
      </div>
    );
  }

  const sm = size === "sm";
  return (
    <button
      type="button"
      onClick={() => (hasVariantOptions ? onOpenVariants?.() : onAddToCart?.(dish))}
      className={`flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl font-black cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 ${
        sm ? "px-2.5 sm:px-3.5 h-7.5 sm:h-9 text-[11px] sm:text-xs" : "px-4 h-9 sm:h-10 text-xs sm:text-sm"
      }`}
    >
      <Plus className={sm ? "w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" : "w-4 h-4 stroke-[3]"} />
      <span>Add</span>
    </button>
  );
}

// Live Order CTA — shown instead of Add/Stepper when an active order exists
function LiveOrderCTA({ liveOrder, size }) {
  const sm = size === "sm";
  // Use dbId (Mongo _id) for the track URL; fall back to display id
  const trackId = liveOrder?.dbId || liveOrder?.id || "";
  const trackHref = trackId ? `/orders/track?id=${trackId}` : "/orders";

  return (
    <a
      href={trackHref}
      className={`flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl font-black cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 relative overflow-hidden ${
        sm
          ? "px-2.5 sm:px-3.5 h-7.5 sm:h-9 text-[11px] sm:text-xs"
          : "px-4 h-9 sm:h-10 text-xs sm:text-sm"
      }`}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 animate-pulse" />
      <Navigation className={sm ? "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 relative" : "w-4 h-4 shrink-0 relative"} />
      <span className="relative leading-none whitespace-nowrap">Track Order</span>
    </a>
  );
}

function VariantSelectionModal({
  dish,
  variants,
  selectedVariant,
  selectedQuantity,
  getVariantQty,
  onSelectVariant,
  onChangeQuantity,
  onAdd,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const selected = variants.find((variant) => variant.name === selectedVariant) || variants[0];
  const selectedPrice = Number(selected?.finalPrice ?? selected?.price) || 0;
  const quantityInCart = getVariantQty(selected);
  const totalPrice = selectedPrice * selectedQuantity;

  const getServingHint = (name) => {
    const lower = String(name || "").toLowerCase();
    if (lower.includes("half")) return "Serves 1 person";
    if (lower.includes("full")) return "Serves 2–3 persons";
    if (lower.includes("small")) return "Standard single bowl";
    if (lower.includes("large") || lower.includes("grand") || lower.includes("jumbo")) return "Generous feast portion";
    if (lower.includes("regular")) return "1 hearty serving";
    return "Chef special serving";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-variant-title"
        className="w-full max-w-lg overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* ── Dish Banner & Header ── */}
        <div className="relative border-b border-zinc-100 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            {/* Dish Thumbnail */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 shadow-md border border-zinc-100 bg-zinc-100">
              <img
                src={dish.image || "/img/category/paneer-tikka.jpg"}
                alt={dish.title}
                className="w-full h-full object-cover"
              />
              {/* Veg Emblem Badge */}
              <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-sm border border-emerald-600 bg-white/95 flex items-center justify-center shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
            </div>

            {/* Dish Info */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  Pure Veg
                </span>
                {dish.rating && (
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                    ★ {dish.rating}
                  </span>
                )}
              </div>
              <h2 id="menu-variant-title" className="text-base sm:text-lg font-black text-zinc-900 truncate">
                {dish.title}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Select your preferred portion &amp; quantity</p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close portion selection"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Content Area ── */}
        <div className="space-y-4 p-4 sm:p-5 overflow-y-auto">
          {/* Portion Selection Title */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500" />
              Choose Portion Size
            </span>
            <span className="text-[11px] font-bold text-zinc-400">
              {variants.length} option{variants.length > 1 ? "s" : ""} available
            </span>
          </div>

          {/* Portion Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => {
              const isSelected = variant.name === selectedVariant;
              const cartQty = getVariantQty(variant);
              const price = Number(variant.finalPrice ?? variant.price) || 0;
              const originalPrice = Number(variant.price) || price;
              const hasDiscount = originalPrice > price;

              return (
                <button
                  key={variant.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectVariant(variant)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between min-h-[6.5rem] cursor-pointer ${isSelected
                    ? "border-2 border-rose-500 bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-amber-50/30 ring-4 ring-rose-500/10 shadow-sm"
                    : "border border-zinc-200 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-xs"
                    }`}
                >
                  {/* Top: Name & Radio/Check badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-sm sm:text-base font-black text-zinc-900 leading-tight">
                        {variant.name}
                      </span>
                      <span className="block text-[11px] font-semibold text-zinc-500 mt-0.5">
                        {getServingHint(variant.name)}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* Bottom: Pricing & Cart Status */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-rose-600 font-mono">
                        {rupee(price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {rupee(originalPrice)}
                        </span>
                      )}
                    </div>

                    {cartQty > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        {cartQty} in cart
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Quantity Stepper Section ── */}
          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200/80">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 block">
                Select Quantity
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                {selectedVariant ? `${selectedVariant} portion` : "Standard serving"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-zinc-200 shadow-xs">
              <button
                type="button"
                onClick={() => onChangeQuantity(-1)}
                disabled={selectedQuantity <= 1}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>

              <span className="w-8 text-center text-sm font-black font-mono text-zinc-900">
                {selectedQuantity}
              </span>

              <button
                type="button"
                onClick={() => onChangeQuantity(1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Action Footer ── */}
        <div className="flex items-center justify-between gap-4 border-t border-zinc-100 bg-white px-5 py-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Amount
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
                {rupee(totalPrice)}
              </span>
              {selectedQuantity > 1 && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  ({rupee(selectedPrice)} × {selectedQuantity})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-rose-600/25 hover:shadow-rose-600/35 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>{quantityInCart > 0 ? "Update Cart" : "Add to Cart"}</span>
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export function Menucard({
  dish,
  inCart = false,
  inWishlist = false,
  qty = 0,
  getQtyForDish,
  onAddToCart,
  onUpdateQty,
  onToggleWishlist,
  onQuickView,
  viewMode = "grid",
  liveOrder = null,
}) {
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedVariantName, setSelectedVariantName] = useState(dish?.variantName || "");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  if (!dish) return null;

  const variantOptions = (Array.isArray(dish.variants) ? dish.variants : []).filter((variant) => variant.available !== false);
  const hasVariantOptions = variantOptions.length > 1;

  const getVariantDish = (variant) => {
    const price = Number(variant.finalPrice ?? variant.price) || 0;
    const listPrice = Number(variant.price) || price;
    return {
      ...dish,
      variantName: variant.name,
      variantId: variant.id || null,
      variantFinalPrice: price,
      price,
      oldPrice: price < listPrice ? listPrice : null,
    };
  };

  const getVariantCartQty = (variant) => Number(getQtyForDish?.(getVariantDish(variant))) || 0;
  const totalVariantQty = hasVariantOptions
    ? variantOptions.reduce((total, variant) => total + getVariantCartQty(variant), 0)
    : 0;
  const count = hasVariantOptions ? totalVariantQty : Number(qty) || (inCart ? 1 : 0);
  const isAdded = count > 0;

  const isList = viewMode === "list";

  const openVariantModal = () => {
    const variant = variantOptions.find((option) => option.name === selectedVariantName) || variantOptions[0];
    if (!variant) return;
    setSelectedVariantName(variant.name);
    setSelectedQuantity(Math.max(1, getVariantCartQty(variant)));
    setIsVariantModalOpen(true);
  };

  const selectVariant = (variant) => {
    setSelectedVariantName(variant.name);
    setSelectedQuantity(Math.max(1, getVariantCartQty(variant)));
  };

  const addSelectedVariant = () => {
    const variant = variantOptions.find((option) => option.name === selectedVariantName);
    if (!variant) return;
    const selectedDish = getVariantDish(variant);
    const existingQuantity = getVariantCartQty(variant);

    if (existingQuantity > 0) {
      const quantityChange = selectedQuantity - existingQuantity;
      if (quantityChange !== 0) onUpdateQty?.(selectedDish, quantityChange);
    } else {
      onAddToCart?.(selectedDish, selectedQuantity);
    }
    setIsVariantModalOpen(false);
  };

  const handleVariantStepChange = (delta) => {
    const variantsInCart = variantOptions
      .map((v) => ({ variant: v, qty: getVariantCartQty(v) }))
      .filter((item) => item.qty > 0);

    if (variantsInCart.length === 0) {
      if (delta > 0) openVariantModal();
      return;
    }

    if (delta > 0) {
      const target =
        variantsInCart.find((item) => item.variant.name === selectedVariantName) ||
        variantsInCart[0];
      const targetDish = getVariantDish(target.variant);
      onUpdateQty?.(targetDish, 1);
    } else {
      const target =
        variantsInCart.find((item) => item.variant.name === selectedVariantName) ||
        variantsInCart[variantsInCart.length - 1];
      const targetDish = getVariantDish(target.variant);
      onUpdateQty?.(targetDish, -1);
    }
  };

  const variantModal = isVariantModalOpen && (
    <VariantSelectionModal
      dish={dish}
      variants={variantOptions}
      selectedVariant={selectedVariantName}
      selectedQuantity={selectedQuantity}
      getVariantQty={getVariantCartQty}
      onSelectVariant={selectVariant}
      onChangeQuantity={(delta) => setSelectedQuantity((quantity) => Math.max(1, quantity + delta))}
      onAdd={addSelectedVariant}
      onClose={() => setIsVariantModalOpen(false)}
    />
  );

  // Calculate discount percentage if oldPrice exists
  const discountPercent =
    dish.oldPrice && Number(dish.oldPrice) > Number(dish.price)
      ? Math.round(((Number(dish.oldPrice) - Number(dish.price)) / Number(dish.oldPrice)) * 100)
      : null;

  const categoryLabel = dish.subCategory || dish.mainCategory || "";

  // =========================================================================
  // LIST VIEW
  // =========================================================================
  if (isList) {
    return (
      <div className="group relative bg-white rounded-3xl border border-zinc-200/80 hover:border-rose-300/80 shadow-xs hover:shadow-xl hover:shadow-rose-600/10 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row gap-0 sm:gap-5 p-3 sm:p-4">
        {/* Left: Image Container */}
        <div className="relative w-full sm:w-56 md:w-64 h-48 sm:h-auto rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
          <img
            src={dish.image || "/img/category/paneer-tikka.jpg"}
            alt={dish.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />

          {/* Gradient overlay for bottom chips */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Top Left: 100% Veg Emblem & Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {/* Green Veg Emblem */}
            <div
              className="w-5 h-5 rounded-md bg-white/95 backdrop-blur-md border border-emerald-600 flex items-center justify-center shadow-xs"
              title="100% Pure Vegetarian"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </div>

            {dish.isBestseller && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Bestseller</span>
              </span>
            )}

            {discountPercent && discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Top Right: Wishlist Button */}
          <button
            type="button"
            aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(dish);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-zinc-600 hover:text-rose-600 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${inWishlist ? "fill-rose-600 text-rose-600" : ""
                }`}
            />
          </button>

          {/* Bottom chips: Prep time & calories */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold text-white">
            {dish.prepTime ? (
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-amber-400" />
                {dish.prepTime}
              </span>
            ) : <span />}

            {dish.calories ? (
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3 text-rose-400" />
                {dish.calories} kcal
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: Content details */}
        <div className="flex-1 flex flex-col justify-between py-2 sm:py-1">
          <div>
            {/* Category & Rating Row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
                {categoryLabel}
              </span>

              {dish.rating > 0 && (
                <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-black shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{dish.rating}</span>
                  {dish.reviews > 0 && (
                    <span className="text-zinc-400 font-semibold text-[10px]">
                      ({dish.reviews})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <h3
              onClick={() => onQuickView?.(dish)}
              className="text-base sm:text-lg font-extrabold text-zinc-900 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-1 mb-1"
            >
              {dish.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">
              {dish.shortDesc || dish.fullDesc}
            </p>

            {/* Dietary Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {dish.isJain && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  🌿 Jain Friendly
                </span>
              )}
              {dish.isChefSpecial && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  ⭐ Chef&apos;s Pick
                </span>
              )}
              {dish.variantName && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-semibold">
                  {dish.variantName} portion
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Action Row */}
          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
            <div className="flex flex-col items-start gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${isAdded
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                  }`}
              >
                {isAdded ? `Added (${count})` : "Not in cart"}
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-zinc-900">
                  {rupee(dish.price)}
                </span>
                {dish.oldPrice && (
                  <span className="text-xs text-zinc-400 line-through font-semibold">
                    {rupee(dish.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onQuickView && (
                <button
                  type="button"
                  aria-label="Quick view"
                  onClick={() => onQuickView(dish)}
                  className="w-9 h-9 rounded-2xl border border-zinc-200/90 bg-white hover:bg-rose-50 hover:border-rose-300 text-zinc-600 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              {liveOrder ? (
                <LiveOrderCTA liveOrder={liveOrder} size="md" />
              ) : (
                <CartControl
                  dish={dish}
                  qty={count}
                  onAddToCart={onAddToCart}
                  onUpdateQty={onUpdateQty}
                  onOpenVariants={openVariantModal}
                  hasVariantOptions={hasVariantOptions}
                  onVariantStepChange={handleVariantStepChange}
                  size="md"
                />
              )}
            </div>
          </div>
        </div>
        {variantModal}
      </div>
    );
  }

  // =========================================================================
  // GRID VIEW (Default) — Premium, fully responsive for 2-col mobile grid
  // =========================================================================
  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-rose-300/80 shadow-sm hover:shadow-xl hover:shadow-rose-600/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* ── Card Media Header ────────────────────────────────────────── */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-zinc-100 overflow-hidden">
        <img
          src={dish.image || "/img/category/paneer-tikka.jpg"}
          alt={dish.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Top-Left Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-1 flex-wrap z-10">
          {/* Veg Emblem */}
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] sm:rounded-md bg-white/95 backdrop-blur-md border border-emerald-600 flex items-center justify-center shadow-xs"
            title="100% Pure Vegetarian"
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600" />
          </div>

          {dish.isBestseller && (
            <span className="hidden sm:inline-flex px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span>Bestseller</span>
            </span>
          )}

          {discountPercent && discountPercent > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-600 text-white text-[8px] sm:text-[10px] font-black shadow-sm">
              {discountPercent}%
            </span>
          )}
        </div>

        {/* Top Right: Wishlist Heart */}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(dish);
          }}
          className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-zinc-600 hover:text-rose-600 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${inWishlist ? "fill-rose-600 text-rose-600" : ""}`}
          />
        </button>

        {/* Bottom floating chips: Prep Time & Calories — hidden on very small screens */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 right-1.5 sm:right-2.5 z-10 flex items-center justify-between text-[8px] sm:text-[10px] font-bold text-white">
          {dish.prepTime ? (
            <span className="flex items-center gap-0.5 sm:gap-1 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>{dish.prepTime}</span>
            </span>
          ) : <span />}

          {dish.calories ? (
            <span className="hidden sm:flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-xs">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{dish.calories} kcal</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Card Body ──────────────────────────────────────────────── */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category Eyebrow & Rating */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-600 line-clamp-1 truncate">
              {categoryLabel}
            </span>

            {dish.rating > 0 && (
              <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-50 border border-amber-200/80 px-1 sm:px-2 py-0.5 rounded-lg text-amber-700 text-[8px] sm:text-xs font-black shrink-0 shadow-2xs">
                <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span>{dish.rating}</span>
              </div>
            )}
          </div>

          {/* Dish Title */}
          <h3
            onClick={() => onQuickView?.(dish)}
            className="text-xs sm:text-sm lg:text-base font-extrabold text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1 cursor-pointer leading-snug"
          >
            {dish.title}
          </h3>

          {/* Short Description — hidden on very small screens */}
          <p className="hidden sm:block text-[10px] sm:text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {dish.shortDesc || dish.fullDesc}
          </p>

          {/* Dietary / Feature Pills — only on sm+ */}
          {(dish.isJain || dish.isChefSpecial || dish.variantName) && (
            <div className="hidden sm:flex items-center gap-1 pt-0.5 flex-wrap">
              {dish.isJain && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[9px] sm:text-[10px] font-bold">
                  🌿 Jain
                </span>
              )}
              {dish.isChefSpecial && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[9px] sm:text-[10px] font-bold">
                  ⭐ Chef&apos;s Pick
                </span>
              )}
              {dish.variantName && (
                <span className="px-1 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[9px] sm:text-[10px] font-semibold">
                  {dish.variantName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Card Footer: Pricing & Action Buttons ────────────────── */}
        <div className="pt-1.5 sm:pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-1 sm:gap-2">
          {/* Price Block */}
          <div className="flex flex-col items-start min-w-0">
            <div className="flex items-baseline gap-1 leading-none flex-wrap">
              <span className="text-sm sm:text-lg lg:text-xl font-black text-zinc-900 group-hover:text-rose-600 transition-colors whitespace-nowrap">
                {rupee(dish.price)}
              </span>
              {dish.oldPrice && (
                <span className="text-[9px] sm:text-[11px] text-zinc-400 line-through font-semibold whitespace-nowrap">
                  {rupee(dish.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onQuickView && (
              <button
                type="button"
                aria-label="Quick view"
                onClick={() => onQuickView(dish)}
                className={`hidden sm:flex w-8 h-8 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-rose-50 hover:border-rose-300 text-zinc-600 hover:text-rose-600 items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs`}
                title="Quick view"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {liveOrder ? (
              <LiveOrderCTA liveOrder={liveOrder} size="sm" />
            ) : (
              <CartControl
                dish={dish}
                qty={count}
                onAddToCart={onAddToCart}
                onUpdateQty={onUpdateQty}
                onOpenVariants={openVariantModal}
                hasVariantOptions={hasVariantOptions}
                onVariantStepChange={handleVariantStepChange}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
      {variantModal}
    </div>
  );
}

export default Menucard;