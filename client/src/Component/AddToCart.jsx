"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bike,
} from "lucide-react";

/**
 * Elevated Floating Cart Bar
 * Provides instant feedback when items are added to the cart,
 * with animated counter badges, free delivery indicator, two-step safe clear,
 * and high-converting glassmorphic call-to-action.
 */
export function Addtocart({ totalCartCount = 0, totalCartAmount = 0, onClearCart }) {
  const count = Number(totalCartCount) || 0;
  const amount = Number(totalCartAmount) || 0;
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const prevCount = useRef(count);
  const [pulse, setPulse] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setAnimKey((k) => k + 1);
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const handleClearClick = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
    } else {
      setConfirmClear(false);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      onClearCart?.();
    }
  };

  if (!mounted || count <= 0) return null;

  const isFreeDeliveryEligible = amount >= 250;
  const shortfall = Math.max(0, 250 - amount);

  return createPortal(
    <aside
      key={animKey}
      aria-label="Current order summary"
      style={{
        animation: animKey > 0 ? "cartSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) both" : "none",
      }}
      className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
    >
      <style>{`
        @keyframes cartSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.32); }
          100% { transform: scale(1); }
        }
        @keyframes subtleGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-auto w-full max-w-2xl bg-zinc-950/92 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/10 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300">
        
        {/* Left: Bag Icon & Cart details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-600/30 shrink-0">
            <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            
            {/* Animated Item Count Badge */}
            <span
              style={pulse ? { animation: "badgePulse 0.5s ease" } : {}}
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950 text-[11px] font-black flex items-center justify-center shadow-md border-2 border-zinc-950"
            >
              {count}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
                {count} {count === 1 ? "dish" : "dishes"}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-sm sm:text-base font-black text-amber-400">
                ₹{Math.round(amount).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Delivery micro-indicator */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {isFreeDeliveryEligible ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Free Delivery unlocked!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                  <Bike className="w-3 h-3 text-amber-400/90" />
                  <span>Add ₹{Math.round(shortfall)} more for FREE delivery</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Safe Clear Cart Button with Confirmation */}
          <button
            type="button"
            onClick={handleClearClick}
            className={`h-9 px-2.5 rounded-xl transition-all duration-200 flex items-center gap-1 text-xs font-bold cursor-pointer ${
              confirmClear
                ? "bg-rose-600/90 text-white shadow-md animate-pulse"
                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            }`}
            title={confirmClear ? "Click again to confirm clearing your cart" : "Clear cart"}
            aria-label={confirmClear ? "Confirm clear cart" : "Clear cart"}
          >
            {confirmClear ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline">Sure?</span>
              </>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          {/* View Cart / Checkout Button */}
          <Link
            href="/cart"
            className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </aside>,
    document.body
  );
}

export default Addtocart;