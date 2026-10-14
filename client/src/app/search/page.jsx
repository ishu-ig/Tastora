"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Search, Bike, Store, Utensils, ArrowUpRight, ChevronRight, X } from "lucide-react";
import { getProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import { getCombo } from "../../Redux/ActionCreators/ComboActionCreators";
import { getThali } from "../../Redux/ActionCreators/ThaliActionCreators";

const TYPE_CONFIG = {
  all:   { label: "All Results",  badgeActive: "bg-zinc-900 text-white",    badgeInactive: "bg-white text-zinc-600 border-zinc-200", tag: "bg-zinc-400" },
  menu:  { label: "Menu",         badgeActive: "bg-rose-600 text-white",    badgeInactive: "bg-white text-zinc-600 border-zinc-200", tag: "bg-rose-600",   pill: "bg-rose-50 text-rose-700 border-rose-200",   icon: Utensils },
  combo: { label: "Combo",        badgeActive: "bg-amber-500 text-white",   badgeInactive: "bg-white text-zinc-600 border-zinc-200", tag: "bg-amber-500",  pill: "bg-amber-50 text-amber-700 border-amber-200",  icon: Store },
  thali: { label: "Thali",        badgeActive: "bg-purple-600 text-white",  badgeInactive: "bg-white text-zinc-600 border-zinc-200", tag: "bg-purple-600", pill: "bg-purple-50 text-purple-700 border-purple-200", icon: Bike },
};

const typeOf = (id) => id?.startsWith("combo-") ? "combo" : id?.startsWith("thali-") ? "thali" : "menu";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState("all");

  const reduxProducts = useSelector((s) => s.product?.data || s.product || []);
  const reduxCombos   = useSelector((s) => s.combo?.data   || s.combo   || []);
  const reduxThalis   = useSelector((s) => s.thali?.data   || s.thali   || []);

  useEffect(() => {
    if (!Array.isArray(reduxProducts) || !reduxProducts.length) dispatch(getProduct());
    if (!Array.isArray(reduxCombos)   || !reduxCombos.length)   dispatch(getCombo());
    if (!Array.isArray(reduxThalis)   || !reduxThalis.length)   dispatch(getThali());
  }, [dispatch]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q); setInputValue(q);
  }, [searchParams]);

  const catalog = useMemo(() => {
    const products = (Array.isArray(reduxProducts) ? reduxProducts : []).filter(i => i.active !== false && i.name).map(i => {
      const variant = Array.isArray(i.variants) ? i.variants[0] : null;
      const rawImage = Array.isArray(i.pic) ? i.pic[0] : i.pic;
      const category = typeof i.maincategory === "object" ? i.maincategory?.name : i.maincategory;
      return {
        id: `product-${i._id}`, title: i.name, category: category || "Dish",
        price: Number(variant?.finalPrice ?? variant?.price) > 0 ? `₹${Math.round(Number(variant.finalPrice ?? variant.price))}` : "",
        image: rawImage || "/img/category/paneer-tikka.jpg",
        link: `/menu?search=${encodeURIComponent(i.name)}`,
        desc: String(i.description || "").replace(/<[^>]*>?/gm, "").slice(0, 90),
      };
    });
    const combos = (Array.isArray(reduxCombos) ? reduxCombos : []).filter(i => i.name).map(i => ({
      id: `combo-${i._id}`, title: i.name, category: "Combo",
      price: Number(i.price) > 0 ? `₹${Math.round(Number(i.price))}` : "",
      image: i.image || i.pic || "/img/category/royal-thali.jpg",
      link: `/combos?type=combo&search=${encodeURIComponent(i.name)}`,
      desc: String(i.description || "").replace(/<[^>]*>?/gm, "").slice(0, 90),
    }));
    const thalis = (Array.isArray(reduxThalis) ? reduxThalis : []).filter(i => i.name).map(i => ({
      id: `thali-${i._id}`, title: i.name, category: "Thali",
      price: Number(i.price) > 0 ? `₹${Math.round(Number(i.price))}` : "",
      image: i.image || i.pic || "/img/category/royal-thali.jpg",
      link: `/combos?type=thali&search=${encodeURIComponent(i.name)}`,
      desc: String(i.description || "").replace(/<[^>]*>?/gm, "").slice(0, 90),
    }));
    return [...products, ...combos, ...thalis];
  }, [reduxProducts, reduxCombos, reduxThalis]);

  const allResults = useMemo(() => {
    if (!query.trim()) return catalog.slice(0, 30);
    const q = query.toLowerCase();
    const score = (item) => {
      const t = item.title.toLowerCase();
      if (t === q) return 4; if (t.startsWith(q)) return 3; if (t.includes(q)) return 2; return 1;
    };
    return catalog
      .filter(d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))
      .sort((a, b) => score(b) - score(a));
  }, [catalog, query]);

  const filtered = typeFilter === "all" ? allResults : allResults.filter(d => typeOf(d.id) === typeFilter);
  const counts = { all: allResults.length, menu: allResults.filter(d => typeOf(d.id) === "menu").length, combo: allResults.filter(d => typeOf(d.id) === "combo").length, thali: allResults.filter(d => typeOf(d.id) === "thali").length };

  const handleSearch = (e) => { e.preventDefault(); if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`); };

  return (
    <div className="min-h-screen bg-[#F8F4F0] pt-24 sm:pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-3">
            <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {query ? <>Results for <span className="text-rose-600">"{query}"</span></> : "Search Tastora"}
          </h1>
          {query && (
            <p className="text-sm text-zinc-500 mt-1">
              Found <span className="font-bold text-zinc-900">{allResults.length}</span> results across Menu, Combos &amp; Thalis
            </p>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-rose-500 absolute left-4 pointer-events-none" />
            <input
              type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
              placeholder="Search menu, combos & thalis..." autoFocus={!query}
              className="w-full pl-12 pr-24 py-3.5 rounded-2xl text-sm font-medium bg-white border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 focus:outline-none shadow-sm transition-all text-zinc-900 placeholder-zinc-400"
            />
            {inputValue && (
              <button type="button" onClick={() => { setInputValue(""); router.push("/search"); }}
                className="absolute right-14 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="absolute right-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer">Search</button>
          </div>
        </form>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {["all", "menu", "combo", "thali"].map(t => {
            const cfg = TYPE_CONFIG[t]; const active = typeFilter === t;
            return (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${active ? cfg.badgeActive + " border-transparent shadow-sm" : cfg.badgeInactive + " hover:border-zinc-300"}`}>
                {cfg.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>{counts[t]}</span>
              </button>
            );
          })}
        </div>

        {/* Results Grid */}
        {!catalog.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 animate-pulse flex gap-0 overflow-hidden h-24">
                <div className="w-24 bg-zinc-100 shrink-0" />
                <div className="flex-1 p-3.5 space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-3/4" />
                  <div className="h-2.5 bg-zinc-100 rounded w-full" />
                  <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-1">No results found</h3>
            <p className="text-sm text-zinc-500 mb-6">{query ? `Nothing matched "${query}"` : "Type something to search."}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Paneer Tikka", "Royal Thali", "Combo Meal", "Dosa", "Dal Makhani"].map(s => (
                <button key={s} onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                  className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(item => {
                const type = typeOf(item.id); const cfg = TYPE_CONFIG[type]; const Icon = cfg.icon;
                return (
                  <Link key={item.id} href={item.link}
                    className="group bg-white rounded-2xl border border-zinc-200/80 hover:border-rose-200 hover:shadow-md hover:shadow-rose-500/5 transition-all duration-200 overflow-hidden flex">
                    <div className="relative w-24 sm:w-28 shrink-0 bg-zinc-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className={`absolute top-0 left-0 w-1 h-full ${cfg.tag}`} />
                    </div>
                    <div className="flex-1 min-w-0 p-3 sm:p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-black text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-1">{item.title}</h3>
                          <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2 leading-relaxed">
                          {item.desc || `Authentic ${item.category} from Tastora's kitchen`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
                          {Icon && <Icon className="w-3 h-3" />}{item.category}
                        </span>
                        {item.price && <span className="text-sm font-black text-rose-600">{item.price}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick-link shortcuts to full filtered pages */}
            {query && (
              <div className="mt-8 pt-6 border-t border-zinc-200 grid grid-cols-3 gap-3">
                {[
                  { type: "menu",  href: `/menu?search=${encodeURIComponent(query)}`,                      label: "Full Menu",   Icon: Utensils, count: counts.menu,  active: "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700 hover:border-rose-400" },
                  { type: "combo", href: `/combos?type=combo&search=${encodeURIComponent(query)}`,         label: "Combos",      Icon: Store,    count: counts.combo, active: "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700 hover:border-amber-400" },
                  { type: "thali", href: `/combos?type=thali&search=${encodeURIComponent(query)}`,         label: "Thalis",      Icon: Bike,     count: counts.thali, active: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 hover:border-purple-400" },
                ].map(({ type, href, label, Icon, count, active }) => (
                  <Link key={type} href={href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center group cursor-pointer ${active}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{label} ({count})</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F4F0] pt-32 flex justify-center items-start">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mt-8" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
