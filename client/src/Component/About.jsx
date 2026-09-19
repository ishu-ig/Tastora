"use client";

import React from "react";
import { Leaf, Award, Truck, ArrowRight, CheckCircle2, Flame } from "lucide-react";

export function About() {
  const highlights = [
    {
      icon: Leaf,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      title: "100% Fresh & Organic Ingredients",
      desc: "We source locally and sustainably. Every single ingredient is hand-picked daily for optimum nutrition and peak flavor.",
    },
    {
      icon: Award,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      title: "Award-Winning Secret Recipes",
      desc: "Crafted by internationally recognized master chefs, our signature spice blends and artisanal recipes have won accolades for 5 consecutive years.",
    },
    {
      icon: Truck,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      title: "Lightning-Fast Hot Delivery",
      desc: "Order online and experience sizzling, oven-fresh food at your doorstep in under 25 minutes — backed by our hot-food guarantee.",
    },
  ];

  return (
    <section id="about" className="py-12 sm:py-16 bg-white relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Layered Images Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-zinc-200/60 aspect-[4/5] z-10">
                <img
                  src="img/about1.jpg"
                  alt="Tastora Gourmet Dining"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Secondary Overlapping Image */}
              <div className="absolute -bottom-8 -right-6 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-zinc-200/60 z-20 hidden sm:block">
                <img
                  src="img/about2.jpg"
                  alt="Delicious food platter"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Floating Experience Badge */}
              <div className="absolute -top-6 -left-6 z-30 animate-float bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-zinc-700/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                    12+
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 leading-tight">
                    Years of<br />Excellence
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Our Culinary Journey</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
              We Invite You to Taste the <br />
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                Extraordinary
              </span>
            </h2>

            <div className="w-20 h-1.5 bg-gradient-to-r from-rose-600 to-amber-500 rounded-full" />

            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
              Founded in 2012, Tastora began with a passion for bringing people together over unforgettable food. Today, we take pride in crafting artisanal dishes that merge gourmet quality with lightning speed and genuine hospitality.
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-2">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50/80 hover:bg-white border border-zinc-200/60 hover:border-rose-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <a
                href="#category"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-base shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
