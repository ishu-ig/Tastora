"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

// Rose pill stepper used on the cards, the quick-view modal and the "added to cart" popup.
// At qty 1 the minus turns into a bin so it's clear the next tap removes the item.
export default function QtyStepper({
  qty = 1,
  onChange,
  disabled = false,
  size = "md", // "sm" for tight grid cards, "md" everywhere else
  className = "",
}) {
  const sm = size === "sm";
  const stop = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) fn();
  };

  return (
    <div
      className={`inline-flex items-center bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full shadow-md shadow-rose-600/25 animate-in fade-in zoom-in-90 duration-200 ${
        sm ? "gap-1 px-1.5 py-0.5" : "gap-2 px-2.5 py-1.5"
      } ${disabled ? "opacity-70" : ""} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={stop(() => onChange?.(-1))}
        className={`${sm ? "w-4.5 h-4.5" : "w-5 h-5"} rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-90 disabled:cursor-not-allowed`}
        aria-label={qty <= 1 ? "Remove from cart" : "Decrease quantity"}
      >
        {qty <= 1 ? (
          <Trash2 className={sm ? "w-2.5 h-2.5" : "w-3 h-3"} />
        ) : (
          <Minus className={sm ? "w-2.5 h-2.5" : "w-3 h-3"} />
        )}
      </button>

      <span
        key={qty}
        className={`font-black text-center font-mono animate-in zoom-in-125 duration-150 ${
          sm ? "text-[11px] sm:text-xs min-w-[14px]" : "text-sm min-w-[18px]"
        }`}
        aria-live="polite"
      >
        {qty}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={stop(() => onChange?.(1))}
        className={`${sm ? "w-4.5 h-4.5" : "w-5 h-5"} rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors cursor-pointer active:scale-90 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <Plus className={sm ? "w-2.5 h-2.5" : "w-3 h-3"} />
      </button>
    </div>
  );
}