"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Mail,
  Send,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Heart,
  CheckCircle2,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import { TastoraLogo } from "./TastoraLogo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-zinc-950 text-zinc-400 overflow-hidden pt-7 sm:pt-9 pb-5 border-t border-zinc-800/80">
      {/* Background Lighting Halos */}
      <div className="absolute top-0 left-1/4 w-80 h-40 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-40 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* =========================================================================
            1. COMPACT NEWSLETTER SUBSCRIPTION BAR
        ========================================================================= */}
        <div className="relative p-4 sm:p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-zinc-900/95 via-zinc-900/80 to-zinc-900/95 border border-zinc-800/90 shadow-xl backdrop-blur-md mb-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
            {/* Left: Text */}
            <div className="lg:col-span-5 space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>Join The Tastora Club</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight leading-snug">
                Subscribe &amp; Get{" "}
                <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-400 bg-clip-text text-transparent">
                  15% Off
                </span>{" "}
                Your Next Meal
              </h3>
            </div>

            {/* Right: Input */}
            <div className="lg:col-span-7">
              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! Check your inbox for your 15% discount code.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-white placeholder-zinc-500 text-xs transition-all focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. COMPACT 4-COLUMN FOOTER CONTENT
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 pb-7 border-b border-zinc-800/80">
          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-4 space-y-2.5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <TastoraLogo size={36} textColor="text-white" subtitle="Artisan Dining" subtextColor="text-rose-400" />
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Gourmet dining crafted with heritage culinary artistry, organic spices, and premium kitchen excellence.
            </p>

            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { icon: FaFacebookF, href: "#", label: "Facebook" },
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaXTwitter, href: "#", label: "Twitter" },
                { icon: FaYoutube, href: "#", label: "YouTube" },
                { icon: FaTiktok, href: "#", label: "TikTok" },
              ].map((item, idx) => {
                const SIcon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    aria-label={item.label}
                    className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 hover:border-rose-600 flex items-center justify-center transition-all duration-150 hover:scale-105"
                  >
                    <SIcon className="w-3 h-3" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[
                { name: "Home", href: "/" },
                { name: "Explore Menu", href: "/menu" },
                { name: "Combos & Feasts", href: "/combos" },
                { name: "Reserve a Table", href: "/reserve" },
                { name: "Special Offers", href: "/#special" },
                { name: "About Us", href: "/#about" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors group"
                  >
                    <ChevronRight className="w-2.5 h-2.5 text-zinc-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specialties */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>Specialties</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[
                { name: "Sizzling Paneer Tikka", href: "/menu" },
                { name: "Crispy Masala Dosa", href: "/menu" },
                { name: "Royal Tastora Thali", href: "/combos" },
                { name: "Overnight Dal Makhani", href: "/menu" },
                { name: "Hyderabadi Dum Biryani", href: "/menu" },
                { name: "Kesar Saffron Rasmalai", href: "/menu" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors group"
                  >
                    <ChevronRight className="w-2.5 h-2.5 text-zinc-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="lg:col-span-3 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Contact &amp; Hours
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">42 Flavor Street, Manhattan, NY 10001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <a href="tel:+18001234567" className="text-zinc-300 hover:text-rose-400 transition-colors font-medium">
                +1 (800) 123-4567
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <a href="mailto:hello@tastorafood.com" className="text-zinc-300 hover:text-rose-400 transition-colors">
                hello@tastorafood.com
              </a>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-zinc-300">Wed - Sun: 09:00 AM – 11:00 PM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Open" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. COMPACT BOTTOM COPYRIGHT & LEGAL BAR
        ========================================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-zinc-500">
          <p className="flex items-center gap-1 text-center sm:text-left">
            &copy; 2026 <span className="text-zinc-300 font-bold">Tastora Gourmet</span>. Made with
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline mx-0.5 animate-pulse" />
            for food lovers.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/#privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/#allergen" className="hover:text-zinc-300 transition-colors">
              Allergen Info
            </Link>
            <Link href="/#cookies" className="hover:text-zinc-300 transition-colors">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
