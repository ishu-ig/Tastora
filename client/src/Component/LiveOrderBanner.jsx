"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navigation, X, ChevronRight, Clock, CheckCircle2, ChefHat, Bike, PackageCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";

// Map order statuses to step index and icon
const STATUS_STEPS = [
  { label: "Confirmed",    icon: CheckCircle2, color: "text-emerald-400" },
  { label: "In Kitchen",  icon: ChefHat,       color: "text-amber-400"  },
  { label: "Out for Delivery", icon: Bike,     color: "text-blue-400"   },
  { label: "Delivered",   icon: PackageCheck,  color: "text-emerald-500" },
];

function getStepIndex(status = "") {
  const s = status.toLowerCase();
  if (s.includes("confirm") || s.includes("accept") || s.includes("placed")) return 0;
  if (s.includes("kitchen") || s.includes("preparing") || s.includes("progress")) return 1;
  if (s.includes("out") || s.includes("delivery") || s.includes("dispatch")) return 2;
  if (s.includes("deliver")) return 3;
  return 0;
}

export function LiveOrderBanner() {
  const { liveOrder } = useCart();
  const { user: authUser } = useAuth() || {};
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when the logged-in user changes (e.g. logout → login as different user)
  const authUserId = authUser?._id || authUser?.id || null;
  React.useEffect(() => { setDismissed(false); }, [authUserId]);

  // Only show when:
  // 1. A user is logged in
  // 2. There is a live order
  // 3. User hasn't dismissed it
  // 4. Not already on the orders page
  if (!authUser || !liveOrder || dismissed || pathname?.startsWith("/orders")) return null;

  const stepIndex = getStepIndex(liveOrder.status);
  const currentStep = STATUS_STEPS[stepIndex] || STATUS_STEPS[0];
  const StepIcon = currentStep.icon;
  const progress = Math.round(((stepIndex + 1) / STATUS_STEPS.length) * 100);
  const trackId = liveOrder.dbId || liveOrder.id || "";
  const trackHref = trackId ? `/orders/track?id=${trackId}` : "/orders";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] pointer-events-none">
      {/* Safe-area padding for mobile notch phones */}
      <div className="pointer-events-auto mx-3 mb-3 sm:mx-auto sm:max-w-lg sm:mb-4">
        <div className="relative bg-zinc-900/98 backdrop-blur-xl rounded-2xl border border-zinc-700/60 shadow-2xl shadow-black/40 overflow-hidden">

          {/* Animated gradient progress bar at top */}
          <div className="h-0.5 w-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 transition-all duration-700 animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-3.5">
            {/* Live pulse dot */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                <StepIcon className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            </div>

            {/* Order info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Live Order
                </span>
                <span className="text-[10px] font-bold text-zinc-500">
                  {liveOrder.id}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black ${currentStep.color}`}>
                  {liveOrder.status || "In Progress"}
                </span>
                {liveOrder.eta && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {liveOrder.eta}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Track button */}
            <Link
              href={trackHref}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-black shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition-all shrink-0"
            >
              <Navigation className="w-3 h-3" />
              <span>Track</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss order banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 px-3 pb-3">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1 flex-1">
                <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-zinc-700"
                }`} />
                {i === STATUS_STEPS.length - 1 && null}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 pb-2.5">
            {STATUS_STEPS.map((step, i) => (
              <span
                key={step.label}
                className={`text-[9px] font-bold transition-colors ${
                  i === stepIndex
                    ? "text-emerald-400"
                    : i < stepIndex
                    ? "text-zinc-500"
                    : "text-zinc-700"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveOrderBanner;
