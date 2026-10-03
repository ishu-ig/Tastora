"use client";

import React, { useRef } from "react";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const testimonialsData = [
  {
    id: 1,
    name: "Aarav Mehta",
    role: "Food Connoisseur",
    location: "Manhattan, NY",
    avatar: "/img/testimonial/1.jpg",
    rating: 5,
    dishLoved: "Royal Maharaja Thali",
    text: "The Maharaja Thali is legendary! Rich Dal Makhani and piping hot Naans delivered fresh and authentic.",
    date: "2 days ago",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Regular Foodie",
    location: "Brooklyn, NY",
    avatar: "/img/testimonial/2.jpg",
    rating: 5,
    dishLoved: "Butter Masala Dosa",
    text: "Crispiest Dosa in town! The coconut chutney and drumstick sambar remind me of authentic South Indian kitchens.",
    date: "4 days ago",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    id: 3,
    name: "David Chen",
    role: "Culinary Explorer",
    location: "Jersey City, NJ",
    avatar: "/img/testimonial/3.jpg",
    rating: 5,
    dishLoved: "Shahi Paneer Tikka",
    text: "Smoky tandoor perfection. The paneer was incredibly soft and bursting with spices. Highly recommended!",
    date: "1 week ago",
    gradient: "from-red-500 to-rose-500",
  },
  {
    id: 4,
    name: "Ananya Iyer",
    role: "VIP Patron",
    location: "Queens, NY",
    avatar: "/img/testimonial/4.jpg",
    rating: 5,
    dishLoved: "Hyderabadi Dum Biryani",
    text: "Fragrant long-grain basmati with saffron and caramelized onions. 100% pure vegetarian dining at its finest.",
    date: "1 week ago",
    gradient: "from-purple-500 to-orange-500",
  },
  {
    id: 5,
    name: "Vikram Malhotra",
    role: "Weekend Regular",
    location: "Hoboken, NJ",
    avatar: "/img/testimonial/1.jpg",
    rating: 5,
    dishLoved: "Amritsari Chole Bhature",
    text: "Puffed golden bhatures that were non-greasy and accompanied by spicy dark chole and pickled chillies.",
    date: "2 weeks ago",
    gradient: "from-amber-600 to-orange-500",
  },
  {
    id: 6,
    name: "Rohan Patel",
    role: "Family Gathering Lead",
    location: "Staten Island, NY",
    avatar: "/img/testimonial/2.jpg",
    rating: 5,
    dishLoved: "Mega Family Feast Box",
    text: "Ordered the 12-item box for 6 people. Portions were super generous and arrived in pristine hot thermal packaging.",
    date: "2 weeks ago",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: 7,
    name: "Neha Gupta",
    role: "Dessert Lover",
    location: "Manhattan, NY",
    avatar: "/img/testimonial/3.jpg",
    rating: 5,
    dishLoved: "Kesar Saffron Rasmalai",
    text: "Melt-in-the-mouth rasmalai soaked in fragrant saffron milk and pistachios. The perfect end to every meal.",
    date: "3 weeks ago",
    gradient: "from-pink-500 to-amber-400",
  },
  {
    id: 8,
    name: "Marcus Vance",
    role: "Event Organizer",
    location: "New York, NY",
    avatar: "/img/testimonial/4.jpg",
    rating: 5,
    dishLoved: "Wok Hakka Noodles & Chilli Paneer",
    text: "Superb Indo-Chinese flavors with the right amount of wok smoke and chili kick. A huge hit with all our guests!",
    date: "1 month ago",
    gradient: "from-orange-600 to-red-600",
  },
];

export function Testimonial() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section
      id="testimonials"
      className="py-10 sm:py-14 bg-gradient-to-b from-white via-rose-50/25 to-white relative overflow-hidden"
    >
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-gradient-to-tr from-rose-200/25 to-amber-200/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-pink-200/20 to-rose-200/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {/* Section Header with Live Rating Summary & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-rose-100/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
              <span>Real Customer Stories &amp; Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
              Loved By Over{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                10,000+ Foodies
              </span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              Read authentic reviews from guests who experienced our 100% pure vegetarian dining &amp; rapid doorstep delivery
            </p>
          </div>

          {/* Right: Quick Rating Stats + Slider Navigation Controls */}
          <div className="flex items-center gap-3.5 self-start md:self-end shrink-0">
            {/* Aggregate Score Pill */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white border border-rose-200/90 px-3.5 py-2 rounded-2xl shadow-xs">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-left border-l border-zinc-200 pl-2">
                <div className="text-xs font-black text-zinc-900 leading-none">4.9 / 5.0</div>
                <div className="text-[10px] text-zinc-400 font-bold leading-none mt-0.5">2,400+ Verified</div>
              </div>
            </div>

            {/* Swiper Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                ref={prevRef}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 text-zinc-700 hover:text-white border border-zinc-200/90 hover:border-transparent shadow-xs hover:shadow-lg hover:shadow-rose-500/25 flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-30 cursor-pointer group"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                ref={nextRef}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 text-zinc-700 hover:text-white border border-zinc-200/90 hover:border-transparent shadow-xs hover:shadow-lg hover:shadow-rose-500/25 flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-30 cursor-pointer group"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TESTIMONIALS SWIPER (only complete cards visible):
            - 4 per view on laptop (>=1024px)
            - 3 per view on tablet (>=640px)
            - 2 per view on mobile
        ========================================================================= */}
        <div className="relative pt-1">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            speed={750}
            grabCursor={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            loopAdditionalSlides={4}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{
              clickable: true,
              bulletClass:
                "swiper-pagination-bullet !bg-zinc-200 !w-2.5 !h-2.5 !transition-all !duration-300",
              bulletActiveClass:
                "swiper-pagination-bullet-active !bg-gradient-to-r !from-rose-600 !to-pink-600 !w-8 !rounded-full !shadow-sm !shadow-rose-500/40",
            }}
            slidesPerView={2}
            slidesPerGroup={1}
            spaceBetween={12}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="!px-1 !pt-2 !pb-12"
          >
            {testimonialsData.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                {/* Animated Luxury Testimonial Card */}
                <div className="group h-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-zinc-200/90 hover:border-rose-400/80 shadow-xs hover:shadow-2xl hover:shadow-rose-500/15 transition-all duration-400 p-3 sm:p-5 flex flex-col justify-between relative overflow-hidden select-none hover:-translate-y-1.5">
                  {/* Top Glowing Animated Accent Bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Top Ambient Card Glow */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />

                  {/* Watermark Quote Icon with 3D Tilt on Hover */}
                  <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 text-rose-500/10 group-hover:text-rose-500/25 group-hover:rotate-12 group-hover:scale-110 pointer-events-none transition-all duration-500" />

                  <div className="space-y-3 relative z-10">
                    {/* Top Row: 5 Stars + Review Timestamp */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 transition-transform group-hover:scale-105"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {item.date}
                      </span>
                    </div>

                    {/* Dish Loved Tag Pill with Animated Hover */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/90 border border-rose-200/80 text-rose-900 text-[10px] sm:text-[11px] font-bold truncate max-w-full group-hover:bg-rose-100/90 transition-colors shadow-2xs">
                      <Utensils className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="truncate">{item.dishLoved}</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-zinc-600 text-[11px] sm:text-xs md:text-[13px] leading-relaxed line-clamp-4 sm:line-clamp-3 font-normal group-hover:text-zinc-800 transition-colors">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                  {/* Customer Author Row */}
                  <div className="pt-3.5 mt-3.5 border-t border-zinc-100 flex items-center gap-2.5 sm:gap-3 relative z-10">
                    {/* Avatar with Rotating Gradient Ring on Hover */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr ${item.gradient} shadow-xs group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300`}
                      >
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-full h-full rounded-full object-cover bg-white"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-zinc-900 text-xs sm:text-[13px] truncate group-hover:text-rose-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium truncate">
                        {item.role} • {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;