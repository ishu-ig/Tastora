"use client";

import React from "react";
import Link from "next/link";
import {
  Leaf,
  Award,
  Truck,
  ArrowRight,
  CheckCircle2,
  Flame,
  ShieldCheck,
  ChefHat,
  Coins,
  CalendarCheck,
  Star,
  Users,
  Package,
  Heart,
  Sparkles,
} from "lucide-react";
import Reveal, { CountUp } from "./Reveal";

// ── Edit these to match your real numbers ───────────────────────────────────
const STATS = [
  { icon: Flame, end: 12, suffix: "+", label: "Years of excellence" },
  { icon: Users, end: 50000, suffix: "+", label: "Happy guests served" },
  { icon: Star, end: 4.8, decimals: 1, suffix: "/5", label: "Average guest rating" },
  { icon: Leaf, end: 100, suffix: "%", label: "Pure vegetarian kitchen" },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "Certified 100% Pure Veg",
    desc: "A dedicated vegetarian kitchen with no cross-contact, and every order sealed in a tamper-evident container.",
    tone: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    icon: Leaf,
    title: "Satvik & Jain Friendly",
    desc: "Onion-garlic mindful cooking and strict Jain preparation on request, so every guest can eat with confidence.",
    tone: "from-green-500 to-emerald-600",
    soft: "bg-green-50 text-green-600 border-green-200",
  },
  {
    icon: ChefHat,
    title: "Chef-Crafted Recipes",
    desc: "Signature spice blends and heritage recipes from our master chefs, cooked fresh to order and never reheated.",
    tone: "from-amber-500 to-orange-500",
    soft: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    icon: Truck,
    title: "Hot Delivery, Live Tracking",
    desc: "Sealed thermal bags and a rider you can follow on a live map, with food at your door in about 25 minutes.",
    tone: "from-rose-500 to-pink-500",
    soft: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    icon: Coins,
    title: "Rewards on Every Order",
    desc: "Earn 10% back in CreditCoins on each order. VIP Club members get free delivery, member discounts and double coins.",
    tone: "from-amber-400 to-rose-500",
    soft: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: CalendarCheck,
    title: "Fine-Dining Reservations",
    desc: "Book the Royal Courtyard, Starlit Rooftop or Private VIP Suite in a few taps, and get an instant digital table pass.",
    tone: "from-violet-500 to-fuchsia-500",
    soft: "bg-violet-50 text-violet-600 border-violet-200",
  },
];

const PROCESS = [
  {
    icon: Leaf,
    title: "Sourced Fresh",
    desc: "Vegetables, dairy and spices picked up daily from trusted local growers.",
  },
  {
    icon: ChefHat,
    title: "Cooked Satvik Style",
    desc: "Prepared to order in our pure-veg kitchen, with Jain options on request.",
  },
  {
    icon: Package,
    title: "Sealed & Dispatched",
    desc: "Packed in eco-friendly, tamper-evident containers inside a thermal bag.",
  },
  {
    icon: Heart,
    title: "Served With Love",
    desc: "At your table or at your door, hot and exactly as the chef intended.",
  },
];

export function About() {
  return (
    <>
      <style>{`
        @keyframes tastora-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes tastora-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        .tastora-float { animation: tastora-float 5s ease-in-out infinite; }
        .tastora-shimmer { position: relative; overflow: hidden; }
        .tastora-shimmer::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
          transform: translateX(-120%); animation: tastora-shimmer 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .tastora-float, .tastora-shimmer::after { animation: none; }
        }
      `}</style>

      {/* ============================================================
          OUR STORY
      ============================================================ */}
      <section id="about" className="relative scroll-mt-28 overflow-hidden bg-white py-12 sm:py-16">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-rose-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Images */}
            <Reveal className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-3xl border-4 border-white shadow-2xl ring-1 ring-zinc-200/60">
                  <img
                    src="/img/about1.jpg"
                    alt="Tastora pure vegetarian fine dining"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="absolute -bottom-8 -right-6 z-20 hidden h-44 w-44 overflow-hidden rounded-2xl border-4 border-white shadow-2xl ring-1 ring-zinc-200/60 sm:block sm:h-56 sm:w-56">
                  <img
                    src="/img/about2.jpg"
                    alt="Signature vegetarian platter"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                <div className="tastora-float absolute -left-4 -top-6 z-30 flex items-center gap-3 rounded-2xl border border-zinc-700/60 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 p-4 text-white shadow-xl sm:-left-6 sm:p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow-md shadow-rose-500/30">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                      12+
                    </div>
                    <div className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-zinc-300">
                      Years of<br />Excellence
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Story */}
            <div className="space-y-6 lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Our Culinary Journey</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                  We Invite You to Taste the <br />
                  <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                    Extraordinary
                  </span>
                </h2>
                <div className="mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-rose-600 to-amber-500" />
              </Reveal>

              <Reveal delay={140}>
                <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
                  Founded in 2012, Tastora began with a simple belief: pure vegetarian food can be
                  royal. Today we cook heritage recipes with fresh ingredients and a mindful Satvik
                  touch, and serve them with genuine hospitality, whether you dine with us or order
                  in.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Onion-garlic mindful & Jain options",
                    "Fresh ingredients sourced daily",
                    "Eco-friendly sealed packaging",
                    "Award-winning signature recipes",
                  ].map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 bg-zinc-50/80 px-4 py-3 text-sm font-semibold text-zinc-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={260} className="pt-2">
                <Link
                  href="/menu"
                  className="tastora-shimmer group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/40 active:translate-y-0"
                >
                  <span>Explore Full Menu</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS STRIP
      ============================================================ */}
      <section className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.label} delay={i * 90} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-3 bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                  <CountUp end={stat.end} decimals={stat.decimals || 0} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          WHY CHOOSE US
      ============================================================ */}
      <section id="why-choose-us" className="relative scroll-mt-28 overflow-hidden bg-zinc-50/70 py-14 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
              The Tastora{" "}
              <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <div className="mx-auto mb-4 mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-rose-600 to-amber-500" />
            <p className="text-base text-zinc-600 sm:text-lg">
              Six reasons our guests keep coming back, at the table and at home.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={(i % 3) * 100}>
                  <div className="group relative h-full">
                    {/* Glow on hover */}
                    <div
                      className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${item.tone} opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40`}
                    />
                    <div className="relative flex h-full flex-col rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-transparent group-hover:shadow-xl">
                      <span className="absolute right-5 top-4 text-5xl font-black text-zinc-100 transition-colors group-hover:text-zinc-200/80">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${item.soft} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 text-lg font-black text-zinc-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                      <div
                        className={`mt-5 h-1 w-10 rounded-full bg-gradient-to-r ${item.tone} transition-all duration-500 group-hover:w-24`}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FROM OUR KITCHEN TO YOUR TABLE
      ============================================================ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Our Process</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              From Our Kitchen to Your Table
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-rose-600 to-amber-500" />
          </Reveal>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 lg:block" />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={i * 120} className="relative text-center">
                    <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-500/30 transition-transform duration-300 hover:scale-110">
                      <Icon className="h-7 w-7" />
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-black text-white ring-2 ring-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-black text-zinc-900">{step.title}</h3>
                    <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-zinc-500">
                      {step.desc}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CLOSING CTA
      ============================================================ */}
      <section className="bg-white pb-14 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-amber-500 px-6 py-12 text-center text-white shadow-2xl shadow-rose-500/20 sm:px-12">
              <div className="tastora-float pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="tastora-float pointer-events-none absolute -bottom-12 -right-8 h-56 w-56 rounded-full bg-amber-300/20 blur-2xl" />

              <div className="relative">
                <Award className="mx-auto h-10 w-10 text-amber-200" />
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Ready to Taste the Difference?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-rose-50 sm:text-lg">
                  Order a pure-veg feast to your door, or reserve a table for an unforgettable
                  evening.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/menu"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black text-rose-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-50"
                  >
                    Order Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/reserve"
                    className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-8 py-3.5 text-sm font-black text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Reserve a Table
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default About;