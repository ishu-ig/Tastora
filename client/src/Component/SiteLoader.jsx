"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Food icons cycle:
 * burger → pizza → fries → hot dog → ice cream → soft drink
 */
const FOOD_SEQUENCE = [
  { emoji: "🍔", label: "Burger" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍟", label: "Fries" },
  { emoji: "🌭", label: "Hot Dog" },
  { emoji: "🍦", label: "Ice Cream" },
  { emoji: "🥤", label: "Soft Drink" },
];

export function SiteLoader() {
  const auth = useAuth();
  // Safe fallback if useAuth is null or loading is undefined
  const authLoading = auth?.loading ?? false;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageReady, setPageReady] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [forceHide, setForceHide] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // 1. Cycle food icons every ~700ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FOOD_SEQUENCE.length);
    }, 700);
    return () => clearInterval(timer);
  }, []);

  // 2. Check: browser window / assets fully loaded
  useEffect(() => {
    if (typeof document !== "undefined" && document.readyState === "complete") {
      setPageReady(true);
      return;
    }

    const handleLoad = () => setPageReady(true);
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  // 3. Check: minimum display time of 600ms to eliminate instant flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // 4. Safety timer: force-hide after 8 seconds so no user is ever blocked
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setForceHide(true);
    }, 8000);

    // If an unexpected error occurs during startup, don't hold the user hostage
    const handleError = () => setForceHide(true);
    window.addEventListener("error", handleError);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Ready when: safety timer fired OR (browser loaded AND min 600ms passed AND auth check complete)
  const isReady = forceHide || (pageReady && minTimePassed && !authLoading);

  // 5. Smooth fade out and DOM removal
  useEffect(() => {
    if (!isReady) return;

    // Wait for the 500ms opacity transition to finish before removing from DOM
    const removeTimer = setTimeout(() => {
      setIsRemoved(true);
    }, 520);

    return () => clearTimeout(removeTimer);
  }, [isReady]);

  // Completely unmounted once transition is finished
  if (isRemoved) return null;

  const currentFood = FOOD_SEQUENCE[currentIndex];

  return (
    <div
      aria-label="Loading Tastora"
      role="status"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFFDFB] select-none transition-opacity duration-500 ease-out ${
        isReady ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Subtle warm ambient background glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-rose-500/10 via-amber-400/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Card / Animated Icon Area */}
      <div className="flex flex-col items-center gap-6">
        {/* Glowing badge container */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl shadow-rose-900/5 border border-rose-100/80">
          {/* Subtle spinning accent ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-rose-200/60 animate-spin-slow pointer-events-none" />

          {/* Icon with smooth pop/bounce animation on each swap */}
          <span
            key={currentIndex}
            className="text-5xl sm:text-6xl animate-food-pop filter drop-shadow-md select-none transform-gpu"
            role="img"
            aria-label={currentFood.label}
          >
            {currentFood.emoji}
          </span>
        </div>

        {/* Brand & Loading Label */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            Tastora Gourmet
          </span>
          <p className="text-sm font-semibold tracking-wide text-zinc-700">
            Preparing your menu...
          </p>
        </div>

        {/* Progress Bar & Bouncing Dots Container */}
        <div className="flex flex-col items-center gap-3 w-48 sm:w-56">
          {/* Thin Brand Progress Bar */}
          <div className="w-full h-1.5 bg-rose-100/70 rounded-full overflow-hidden shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-loader-progress shadow-sm" />
          </div>

          {/* Three Bouncing Dots */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full bg-rose-600 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-rose-600 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteLoader;