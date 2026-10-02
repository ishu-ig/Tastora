"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, X, ShoppingBag, ChevronRight } from "lucide-react";
import QtyStepper from "./QtyStepper";
import { rupee } from "@/lib/MenuDish";

const DURATION_MS = 5000;

// Popup that appears after any "Add" (card or quick view).
// - auto-closes after 5s (the progress bar drives it, so hovering pauses both)
// - lets you change the quantity right there
// - closes itself if you remove the item with the stepper
export function CartAddedPopup({ popup, getQty, isInCart, onUpdateQty, onClose }) {
  const [paused, setPaused] = useState(false);

  const dish = popup?.dish;
  const qty = dish ? getQty(dish) : 0;
  const hasDishInCart = !!dish && (isInCart(dish) || qty > 0);

  useEffect(() => {
    setPaused(false);
  }, [popup?.id]);

  useEffect(() => {
    if (!popup || !dish) return;
    if (!hasDishInCart) onClose?.();
  }, [popup, dish, hasDishInCart, onClose]);

  if (!popup || !dish) return null;

  const shownQty = qty || 1;

  return (
    <div
      key={popup.id}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="fixed z-[60] top-20 sm:top-24 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[380px] animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <style>{`@keyframes cartPopupBar { from { width: 100%; } to { width: 0%; } }`}</style>

      <div className="relative overflow-hidden bg-white rounded-3xl border border-zinc-200/80 shadow-2xl shadow-rose-600/15">
        <div className="p-3.5 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
            <img src={dish.image} alt={dish.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Added to cart
            </p>
            <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{dish.title}</h4>
            <p className="text-xs font-semibold text-zinc-500">
              {dish.variantName ? `${dish.variantName} portion • ` : ""}
              <span className="text-rose-600 font-black">{rupee((Number(dish.price) || 0) * shownQty)}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="self-start w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-3.5 pb-3.5 flex items-center gap-2.5">
          <QtyStepper
            qty={shownQty}
            disabled={!hasDishInCart}
            onChange={(d) => onUpdateQty?.(dish, d)}
          />
          <Link
            href="/cart"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Persistent status bar while the item still exists in the cart. */}
        <div className="h-1 bg-zinc-100">
          <div
            key={popup.id}
            onAnimationEnd={onClose}
            style={{
              animation: `cartPopupBar ${DURATION_MS}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
            className="h-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500"
          />
        </div>
      </div>
    </div>
  );
}

export default CartAddedPopup;