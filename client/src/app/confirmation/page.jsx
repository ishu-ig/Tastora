"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  MapPin,
  Clock,
  ArrowRight,
  Receipt,
  UtensilsCrossed,
  ShieldCheck,
  ChevronRight,
  User,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import MasterLayout from "../MasterLayout";

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("latest_confirmed_order");
      if (stored) {
        setOrder(JSON.parse(stored));
      } else {
        const localStored = localStorage.getItem("latest_confirmed_order");
        if (localStored) {
          setOrder(JSON.parse(localStored));
        }
      }
    } catch (e) {
      console.error("Could not parse confirmed order:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackingSteps =
    order?.orderMode === "delivery"
      ? [
          { step: "1", title: "Confirmed", desc: "Paid & Received", done: true },
          { step: "2", title: "In Kitchen", desc: "Chef Preparing", active: true },
          { step: "3", title: "Picked Up", desc: "Rider en route" },
          { step: "4", title: "Delivered", desc: "At your door" },
        ]
      : order?.orderMode === "takeaway"
      ? [
          { step: "1", title: "Confirmed", desc: "Order Received", done: true },
          { step: "2", title: "Preparing", desc: "In Kitchen", active: true },
          { step: "3", title: "Ready", desc: "Pickup Counter" },
        ]
      : [
          { step: "1", title: "Confirmed", desc: "Order Received", done: true },
          { step: "2", title: "Preparing", desc: "Chef Cooking", active: true },
          { step: "3", title: "Served", desc: "At Your Table" },
        ];

  return (
    <MasterLayout>
      <div className="min-h-screen bg-zinc-50/70 pt-36 sm:pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-sm space-y-4">
              <span className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin inline-block" />
              <p className="text-sm font-semibold text-zinc-500">Retrieving order details…</p>
            </div>
          ) : !order ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-zinc-200/80 shadow-sm space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
                📋
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-zinc-900">No Recent Order Found</h1>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  It looks like no order confirmation is active in this session, or the order was placed earlier.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/checkout"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Go to Checkout</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View All Orders in Profile</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Success Banner ── */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center space-y-5 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-400/30 animate-in zoom-in-75 duration-500">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide">
                    🎉 Order Placed Successfully!
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                    Thank You for Your Order!
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Order ID:{" "}
                    <span className="font-black text-zinc-900 font-mono">{order.id}</span>
                    {order.orderMode === "delivery" && (
                      <> • ETA: <span className="text-rose-600 font-bold">25–35 mins</span></>
                    )}
                  </p>
                </div>

                {/* Tracking Steps */}
                <div className="pt-4 border-t border-zinc-100 space-y-3 text-left">
                  <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Live Order Status</p>
                  <div className={`grid gap-3 ${trackingSteps.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                    {trackingSteps.map((st) => (
                      <div
                        key={st.step}
                        className={`p-3 rounded-2xl border text-xs flex flex-col gap-1.5 ${
                          st.done
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : st.active
                            ? "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/25 animate-pulse"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                            {st.step}
                          </span>
                          {st.done && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          {st.active && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                        </div>
                        <div>
                          <p className="font-black text-[11px]">{st.title}</p>
                          <p className="text-[10px] opacity-75">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.orderMode === "delivery" && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left">
                    <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-base shrink-0">🛵</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900">Delivery Partner Assigned</p>
                      <p className="text-[11px] text-zinc-500">Contactless delivery enabled</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">ON TIME</span>
                  </div>
                )}
              </div>

              {/* ── Order Receipt ── */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" /> Order Receipt
                </h2>

                <div className="divide-y divide-zinc-100 text-xs">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center gap-2.5">
                      <img
                        src={item.image || "/img/category/paneer-tikka.jpg"}
                        alt={item.title}
                        className="w-9 h-9 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">{item.title}</p>
                        {item.note && <p className="text-[10px] text-zinc-400 truncate">Note: {item.note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-zinc-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        <p className="text-zinc-400">×{item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(order.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Savings</span>
                      <span className="font-mono">−₹{order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {(order.deliveryFee || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-mono">₹{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax & GST</span>
                    <span className="font-mono">₹{(order.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-100 font-black text-sm text-zinc-900">
                    <span>Total Paid</span>
                    <span className="text-rose-600 font-mono">₹{(order.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-zinc-400">
                    <span>Payment</span>
                    <span className="font-medium text-zinc-700">{order.paymentMethod || "UPI"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>{order.orderMode === "dinein" ? "Table" : order.orderMode === "takeaway" ? "Pickup" : "Deliver to"}</span>
                    <span className="font-medium text-zinc-700 text-right max-w-[55%] truncate">{order.deliveryAddress}</span>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/menu"
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Order More Delicacies</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex-1 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm text-center hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View All Orders</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </MasterLayout>
  );
}
