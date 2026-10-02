"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  Utensils,
  Copy,
  CheckCheck,
  Receipt,
  Phone,
  Flame,
  Calendar,
  Users,
  Crown,
  Heart,
  AlertCircle,
  Share2,
  XCircle,
  HelpCircle,
  Navigation,
} from "lucide-react";

/**
 * Universal Reusable HistoryCard Component
 * Shared between Order History and Reservation History pages & tabs.
 *
 * @param {Object} props
 * @param {"order"|"reservation"} props.type - Type of history record
 * @param {Object} props.item - Data object (Order or Reservation)
 * @param {Function} [props.onReorder] - Handler for reorder action (orders)
 * @param {Function} [props.onAddSingleDish] - Handler for adding a single dish to cart
 * @param {Function} [props.onOpenInvoice] - Handler for invoice modal (orders / reservations)
 * @param {Function} [props.onOpenRating] - Handler for rating modal
 * @param {Function} [props.onOpenDeliveryRating] - Handler for delivery rating modal
 * @param {Function} [props.onOpenHelp] - Handler for order help/support modal
 * @param {Function} [props.onCancelReservation] - Handler for cancelling a reservation
 * @param {Function} [props.onBookAgain] - Handler for booking again
 * @param {React.ReactNode} [props.customActions] - Custom buttons override
 */
export default function HistoryCard({
  type = "order",
  item,
  onReorder,
  onAddSingleDish,
  onOpenInvoice,
  onOpenRating,
  onOpenDeliveryRating,
  onOpenHelp,
  onCancelReservation,
  onBookAgain,
  customActions,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!item) return null;

  const isOrder = type === "order";
  const isReservation = type === "reservation";

  // Check if active / live
  const isLiveOrder =
    isOrder &&
    (["Order is Placed", "Confirmed", "Preparing", "In Kitchen", "Packing", "Out for Delivery", "Picked Up"].includes(item.status));
  const isUpcomingReservation =
    isReservation && item.status === "Confirmed";

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(item.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
        isLiveOrder || isUpcomingReservation
          ? "border-rose-300 ring-2 ring-rose-400/20 shadow-md"
          : "border-zinc-200/80 hover:border-rose-200 shadow-xs"
      }`}
    >
      {/* ====================================================
          1. UNIVERSAL HEADER BANNER
      ==================================================== */}
      <div className="p-3.5 sm:p-5 bg-gradient-to-r from-zinc-50/90 via-white to-rose-50/20 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Record ID with Copy Button */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-100/90 border border-zinc-200 text-zinc-900 font-mono font-black text-[11px] sm:text-xs">
            <span>{item.id}</span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy ID"
              className="text-zinc-400 hover:text-rose-600 cursor-pointer ml-0.5"
            >
              {isCopied ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Date & Time */}
          <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{item.date}</span>
          </span>

          {/* Type / Fulfillment Mode Badge */}
          {isOrder && (
            <span
              className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1 ${
                item.orderMode === "takeaway"
                  ? "bg-amber-100 text-amber-900"
                  : item.orderMode === "dinein"
                  ? "bg-rose-100 text-rose-900"
                  : "bg-blue-100 text-blue-900"
              }`}
            >
              {item.orderMode === "takeaway" ? (
                <>
                  <Store className="w-3 h-3" />
                  <span>Takeaway</span>
                </>
              ) : item.orderMode === "dinein" ? (
                <>
                  <Utensils className="w-3 h-3" />
                  <span>Dine-In ({item.tableNumber || "Table"})</span>
                </>
              ) : (
                <>
                  <Bike className="w-3 h-3" />
                  <span>Delivery</span>
                </>
              )}
            </span>
          )}

          {isReservation && (
            <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1 bg-amber-100 text-amber-900">
              <Calendar className="w-3 h-3" />
              <span>Table Reservation</span>
            </span>
          )}
        </div>

        {/* Status Badge & Price/Guests */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black flex items-center gap-1.5 ${
              item.status === "Delivered" || item.status === "Completed"
                ? "bg-emerald-100 text-emerald-800"
                : item.status === "In Kitchen" || item.status === "Confirmed"
                ? "bg-rose-100 text-rose-800"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {(item.status === "Delivered" || item.status === "Completed") && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {(item.status === "In Kitchen" || item.status === "Confirmed") && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
            <span>{item.status}</span>
          </span>

          <span className="text-sm sm:text-base md:text-lg font-black text-zinc-900 font-mono">
            ${item.total?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      {/* ====================================================
          2. CONTEXTUAL MAIN BODY CONTENT (CLEAN & USER-FRIENDLY)
      ==================================================== */}

      {/* --- A. ORDER CONTENT (STREAMLINED SUMMARY) --- */}
      {isOrder && (
        <div className="p-3.5 sm:p-5 space-y-3.5">
          {/* Active Live Notice (Only if active) */}
          {isLiveOrder && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-zinc-900 truncate">
                    {item.status === "In Kitchen"
                      ? "👨‍🍳 Chef is Preparing Your Feast"
                      : item.status === "Picked Up"
                      ? "🛵 Rider is On The Way"
                      : "✨ Order Confirmed & In Cooking Queue"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-zinc-500">
                    Estimated arrival: <strong className="text-rose-600 font-bold">{item.eta || "18-22 mins"}</strong>
                  </p>
                </div>
              </div>

              <Link
                href={`/orders/track?id=${item.id}`}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20 shrink-0 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live GPS Map &rarr;</span>
              </Link>
            </div>
          )}

          {/* Dishes Overview & Thumbnails */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70">
            <div className="flex items-center gap-3 min-w-0">
              {/* Dish Thumbnail Avatars */}
              <div className="flex items-center -space-x-2 shrink-0">
                {item.items?.slice(0, 3).map((dish, idx) => (
                  <div
                    key={idx}
                    className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-200 border-2 border-white overflow-hidden shadow-2xs"
                  >
                    <img
                      src={dish.image}
                      alt={dish.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {item.items && item.items.length > 3 && (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-800 text-white font-black text-[10px] sm:text-xs border-2 border-white flex items-center justify-center shadow-2xs shrink-0">
                    +{item.items.length - 3}
                  </div>
                )}
              </div>

              {/* Textual Dish List Summary */}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                  {item.items?.map((it) => {
                    const title = typeof it === "string" ? it : (it.title || it.name || it.customName || it.product?.name || "Dish");
                    const q = it.quantity || it.qty || 1;
                    return `${q}x ${title}`;
                  }).join(", ")}
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                  {item.items?.length || 0} {item.items?.length === 1 ? "dish" : "dishes"} • 100% Satvik Pure Veg
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>+{Math.floor((item.total || 0) * 2)} Coins</span>
            </span>
          </div>

          {/* Delivery Address Line */}
          {item.deliveryAddress && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{item.deliveryAddress}</span>
            </div>
          )}

          {/* Rating given badge (if already rated) */}
          {item.ratingGiven && (
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.ratingGiven ? "fill-amber-400" : "text-zinc-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-amber-950 text-[11px] sm:text-xs">
                  Rated {item.ratingGiven}/5
                </span>
                {item.feedback && (
                  <span className="text-zinc-600 truncate text-[11px] sm:text-xs hidden sm:inline">
                    • "{item.feedback}"
                  </span>
                )}
              </div>

              {onOpenRating && (
                <button
                  type="button"
                  onClick={() => onOpenRating(item)}
                  className="text-[10px] sm:text-xs font-bold text-amber-900 hover:underline cursor-pointer shrink-0"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- B. RESERVATION CONTENT --- */}
      {isReservation && (
        <div className="p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/30 to-white border border-rose-200/70">
            {/* Zone Image Thumbnail */}
            <div className="relative w-full sm:w-28 h-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-rose-200 shadow-2xs">
              <img
                src={item.zoneImage || "/img/dining/royal-courtyard.jpg"}
                alt={item.zone}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                <span>Fine Dining</span>
              </div>
            </div>

            {/* Zone & Booking Info */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                  {item.zone}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {item.tableNumber || "Reserved Table"}
                </span>
              </div>

              {/* Badges row: Guests, Slot, Occasion */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600">
                <span className="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 font-bold text-zinc-800 flex items-center gap-1 text-[11px] sm:text-xs">
                  <Users className="w-3.5 h-3.5 text-rose-600" />
                  <span>{item.guests} Guests</span>
                </span>

                <span className="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 font-medium text-zinc-700 flex items-center gap-1 text-[11px] sm:text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.slots?.join(", ") || item.date}</span>
                </span>

                {item.occasion && (
                  <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold text-[10px] sm:text-[11px]">
                    {item.occasion}
                  </span>
                )}
              </div>

              {item.addOns && item.addOns.length > 0 && (
                <div className="text-[10px] sm:text-[11px] text-zinc-500 pt-0.5 flex items-center gap-1 flex-wrap">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="font-semibold text-zinc-700">Add-ons:</span>
                  <span>{item.addOns.join(" • ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          3. CLEAN ACTION BUTTONS FOOTER
      ==================================================== */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-zinc-50/80 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Left Side: Invoice / Help Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenInvoice && (
            <button
              type="button"
              onClick={() => onOpenInvoice(item)}
              className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>{isOrder ? "Tax Invoice" : "Voucher"}</span>
            </button>
          )}

          {onOpenHelp && (
            <button
              type="button"
              onClick={() => onOpenHelp(item)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Need Help?</span>
            </button>
          )}

          {/* Rate Button if Delivered and Unrated */}
          {!item.ratingGiven && !item.commentRewarded &&
            (item.status === "Delivered" || item.status === "Completed") &&
            onOpenRating && (
              <button
                type="button"
                onClick={() => onOpenRating(item)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Rate</span>
              </button>
            )}

          {isOrder && item.deliveryBoyAssigned && !item.deliveryRating && !item.deliveryRatingRewarded &&
            (item.status === "Delivered" || item.status === "Completed") &&
            onOpenDeliveryRating && (
              <button
                type="button"
                onClick={() => onOpenDeliveryRating(item)}
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bike className="w-3.5 h-3.5 text-sky-600" />
                <span>Rate delivery</span>
              </button>
            )}
        </div>

        {/* Right Side: Primary Navigation & Reorder Buttons */}
        <div className="flex items-center gap-2">
          {/* Reservation Actions */}
          {isReservation && item.status === "Confirmed" && onCancelReservation && (
            <button
              type="button"
              onClick={() => onCancelReservation(item.id)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-700 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Cancel Table</span>
            </button>
          )}

          {isReservation && onBookAgain && (
            <button
              type="button"
              onClick={() => onBookAgain(item)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-rose-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Again</span>
            </button>
          )}

          {/* Reorder Button for Delivered Orders */}
          {isOrder && onReorder && item.status !== "In Kitchen" && item.status !== "Picked Up" && (
            <button
              type="button"
              onClick={() => onReorder(item)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
              <span>Reorder</span>
            </button>
          )}

          {/* Primary View Order Details Page Link */}
          {isOrder && (
            <Link
              href={`/orders/${item.id}`}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-white text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>View Details &rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
