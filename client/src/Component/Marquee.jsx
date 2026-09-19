"use client";

import React from "react";
import { Flame, Sparkles, Utensils, Heart, Star, Coffee, Leaf } from "lucide-react";

export function Marquee() {
  const items = [
    { title: "Sizzling Paneer Tikka", icon: Flame, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200/80" },
    { title: "Crispy Golden Masala Dosa", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200/80" },
    { title: "Royal Tastora Thalis", icon: Star, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200/80" },
    { title: "Clay Oven Butter Naan", icon: Utensils, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/80" },
    { title: "Hyderabadi Dum Biryani", icon: Flame, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200/80" },
    { title: "Slow-Cooked Dal Makhani", icon: Heart, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200/80" },
    { title: "Amritsari Chole Bhature", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/80" },
    { title: "Gourmet Artisan Kitchen", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200/80" },
    { title: "Saffron Kesar Rasmalai", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200/80" },
    { title: "Thick Creamy Mango Lassi", icon: Coffee, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200/80" },
  ];

  // Duplicate for seamless infinite loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/90 py-3.5 border-y border-rose-200/60 shadow-xs">
      {/* Left and Right Fade Overlays with Theme Gradient */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-rose-50 via-rose-50/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-rose-50 via-rose-50/80 to-transparent z-10" />

      {/* Marquee Track */}
      <div className="flex animate-marquee whitespace-nowrap select-none">
        {duplicatedItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 mx-3 sm:mx-4 px-4 py-1.5 rounded-full bg-white/95 hover:bg-white text-zinc-800 border border-rose-200/90 hover:border-rose-400 hover:text-rose-600 shadow-2xs hover:shadow-md transition-all duration-200 cursor-default group"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <div className={`w-5 h-5 rounded-md ${item.bg} ${item.border} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-3 h-3 ${item.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-800 group-hover:text-rose-600">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Marquee;
