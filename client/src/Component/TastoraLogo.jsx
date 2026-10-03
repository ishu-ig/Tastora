"use client";

import React from "react";
import Image from "next/image";

/**
 * Tastora Logo Component
 * Renders the official Tastora logo mark and wordmark.
 */
export function TastoraIcon({ size = 40, className = "" }) {
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/img/logo.png"
        alt="Tastora Logo"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

export function TastoraLogo({
  size = 40,
  showText = true,
  hideTextOnMobile = false,
  subtitle = "Gourmet Dining",
  className = "",
  textColor = "text-zinc-900",
  subtextColor = "text-zinc-400",
}) {
  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-[#FFF5F7] p-1 border border-rose-100/80 shadow-xs group-hover:scale-105 group-hover:shadow-rose-500/20 group-hover:shadow-md transition-all duration-300 flex items-center justify-center">
          <Image
            src="/img/logo.png"
            alt="Tastora"
            width={72}
            height={72}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {showText && (
        <div className={`flex flex-col ${hideTextOnMobile ? "hidden sm:flex" : ""}`}>
          <span className={`text-2xl font-black tracking-tight ${textColor} flex items-center gap-0.5 leading-none`}>
            TAST<span className="text-[#E11D48]">ORA</span>
            <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse inline-block ml-0.5" />
          </span>
          {subtitle && (
            <span className={`text-[10px] tracking-widest uppercase font-bold ${subtextColor} mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default TastoraLogo;
