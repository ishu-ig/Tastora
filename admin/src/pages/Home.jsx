import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory }  from "../Redux/ActionCreators/SubcategoryActionCreators";
import { getResturent }    from "../Redux/ActionCreators/ResturentActionCreators";
import { getProduct }      from "../Redux/ActionCreators/ProductActionCreators";
import { getBanner }       from "../Redux/ActionCreators/BannerActionCreators";
import { getCheckout }     from "../Redux/ActionCreators/CheckoutActionCreators";
import { getBooking }      from "../Redux/ActionCreators/BookingActionCreators";
import { getNewsletter }   from "../Redux/ActionCreators/NewsletterActionCreators";
import { getContactUs }    from "../Redux/ActionCreators/ContactUsActionCreators";
import { getTestimonial }  from "../Redux/ActionCreators/TestimonialActionCreators";

// ── Sample fallback ────────────────────────────────────────────────────────────
const SAMPLE = {
    maincategories: [
        { name: "North Indian", active: true  },
        { name: "South Indian", active: true  },
        { name: "Chinese",      active: false },
        { name: "Desserts",     active: true  },
    ],
    subcategories: [
        { name: "Curries",   active: true  },
        { name: "Breads",    active: true  },
        { name: "Dosas",     active: true  },
        { name: "Noodles",   active: false },
        { name: "Ice Cream", active: true  },
    ],
    resturents: [
        { name: "Spice Garden",   active: true,  rating: 4.5, seatAvailable: 12 },
        { name: "Curry House",    active: true,  rating: 4.1, seatAvailable: 0  },
        { name: "Dragon Wok",     active: true,  rating: 3.9, seatAvailable: 6  },
        { name: "South Spice",    active: false, rating: 4.7, seatAvailable: 4  },
        { name: "Sweet Treats",   active: true,  rating: 4.3, seatAvailable: 20 },
    ],
    products: [
        { name: "Butter Chicken",   resturent: { name: "Spice Garden" }, maincategory: { name: "North Indian" }, availability: true,  basePrice: 399, discount: 5,  finalPrice: 379, rating: 4.6 },
        { name: "Masala Dosa",      resturent: { name: "South Spice"  }, maincategory: { name: "South Indian" }, availability: true,  basePrice: 149, discount: 0,  finalPrice: 149, rating: 4.4 },
        { name: "Hakka Noodles",    resturent: { name: "Dragon Wok"   }, maincategory: { name: "Chinese"      }, availability: true,  basePrice: 219, discount: 10, finalPrice: 197, rating: 4.0 },
        { name: "Paneer Tikka",     resturent: { name: "Curry House"  }, maincategory: { name: "North Indian" }, availability: false, basePrice: 279, discount: 0,  finalPrice: 279, rating: 4.2 },
        { name: "Gulab Jamun",      resturent: { name: "Sweet Treats" }, maincategory: { name: "Desserts"     }, availability: true,  basePrice: 99,  discount: 0,  finalPrice: 99,  rating: 4.8 },
        { name: "Chilli Paneer",    resturent: { name: "Dragon Wok"   }, maincategory: { name: "Chinese"      }, availability: false, basePrice: 249, discount: 5,  finalPrice: 237, rating: 4.1 },
    ],
    banners: [{ qty: 2, total: 151998 }, { qty: 1, total: 7649 }, { qty: 3, total: 8997 }],
    checkouts: [
        { user: { name: "Rahul Sharma"  }, paymentMode: "UPI",  subtotal: 478,   shipping: 0,  total: 478,   orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-02-10" },
        { user: { name: "Priya Mehta"   }, paymentMode: "COD",  subtotal: 149,   shipping: 20, total: 169,   orderStatus: "Processing",      paymentStatus: "Pending", createdAt: "2025-03-15" },
        { user: { name: "Aakash Singh"  }, paymentMode: "Card", subtotal: 197,   shipping: 20, total: 217,   orderStatus: "Out for Delivery",paymentStatus: "Done",    createdAt: "2025-04-01" },
        { user: { name: "Sneha Patel"   }, paymentMode: "UPI",  subtotal: 99,    shipping: 0,  total: 99,    orderStatus: "Order is Placed", paymentStatus: "Pending", createdAt: "2025-04-18" },
        { user: { name: "Vikram Nair"   }, paymentMode: "COD",  subtotal: 279,   shipping: 20, total: 299,   orderStatus: "Cancelled",       paymentStatus: "Pending", createdAt: "2025-05-02" },
        { user: { name: "Anjali Rao"    }, paymentMode: "UPI",  subtotal: 237,   shipping: 0,  total: 237,   orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-05-20" },
    ],
    bookings: [
        { user: { name: "Rahul Sharma"  }, resturent: { name: "Spice Garden" }, qty: 4, total: 0, createdAt: "2025-05-12" },
        { user: { name: "Priya Mehta"   }, resturent: { name: "Curry House"  }, qty: 2, total: 0, createdAt: "2025-05-18" },
        { user: { name: "Aakash Singh"  }, resturent: { name: "Dragon Wok"   }, qty: 6, total: 0, createdAt: "2025-05-20" },
    ],
    newsletters:  Array(28).fill({ _id: "x" }),
    contacts: [
        { name: "Rahul Sharma",  email: "rahul@email.com",  active: true  },
        { name: "Priya Mehta",   email: "priya@email.com",  active: true  },
        { name: "Aakash Singh",  email: "aakash@email.com", active: false },
        { name: "Sneha Patel",   email: "sneha@email.com",  active: true  },
        { name: "Vikram Nair",   email: "vikram@email.com", active: false },
    ],
    testimonials: [
        { name: "Rahul Sharma", active: true  },
        { name: "Priya Mehta",  active: true  },
        { name: "Aakash Singh", active: false },
        { name: "Sneha Patel",  active: true  },
        { name: "Vikram Nair",  active: false },
    ],
};

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
}

// ── Tooltip — uses BS CSS vars so it adapts to light/dark theme ───────────────
const DashTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--bs-body-bg, #fff)",
            border: "1px solid var(--bs-border-color)",
            borderRadius: 8, padding: "8px 14px", fontSize: 12,
        }}>
            {label && <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 11 }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ margin: 0, color: p.fill || p.color }}>
                    {p.name}: <strong>
                        {(p.name || "").toLowerCase().includes("revenue") || (p.name || "").toLowerCase().includes("total")
                            ? "₹" + Number(p.value).toLocaleString("en-IN")
                            : p.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

// ── Order status badge helper ─────────────────────────────────────────────────
function orderBadge(status) {
    return {
        "Order is Placed":  { cls: "badge text-bg-warning",   label: "Placed"      },
        "Processing":       { cls: "badge text-bg-primary",   label: "Processing"  },
        "Out for Delivery": { cls: "badge text-bg-info",      label: "Dispatched"  },
        "Delivered":        { cls: "badge text-bg-success",   label: "Delivered"   },
        "Cancelled":        { cls: "badge text-bg-danger",    label: "Cancelled"   },
    }[status] || { cls: "badge text-bg-secondary", label: status || "—" };
}

function payBadge(status) {
    return {
        "Done":    "badge text-bg-success",
        "Pending": "badge text-bg-warning",
        "Failed":  "badge text-bg-danger",
    }[status] || "badge text-bg-secondary";
}

export default function Home() {
    const {_id} = useParams()
    const dispatch = useDispatch();
    const [loaded,      setLoaded]      = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    // ── Selectors — keys match RootReducer exactly ─────────────────────────────
    const raw = {
        maincategories: useSelector(s => s.MaincategoryStateData),
        subcategories:  useSelector(s => s.SubcategoryStateData),
        resturents:     useSelector(s => s.ResturentStateData),
        products:       useSelector(s => s.ProductStateData),
        banners:        useSelector(s => s.BannerStateData),
        checkouts:      useSelector(s => s.CheckoutStateData),
        bookings:       useSelector(s => s.BookingStateData),
        newsletters:    useSelector(s => s.NewsletterStateData),
        contacts:       useSelector(s => s.ContactUsStateData),
        testimonials:   useSelector(s => s.TestimonialStateData),
    };

    useEffect(() => {
        dispatch(getMaincategory());
        dispatch(getSubcategory());
        dispatch(getResturent());
        dispatch(getProduct());
        dispatch(getBanner());
        dispatch(getCheckout());
        dispatch(getBooking());
        dispatch(getNewsletter());
        dispatch(getContactUs());
        dispatch(getTestimonial());
        setTimeout(() => setLoaded(true), 600);
    }, []);

    const live = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, unwrap(v)])
    );

    const allEmpty = loaded && Object.values(live).every(a => a.length === 0);
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const D = allEmpty ? SAMPLE : live;

    // ── Derived numbers ───────────────────────────────────────────────────────
    const fmt = n => "₹" + Number(n).toLocaleString("en-IN");

    // Product availability replaces old stock/stockQuantity fields
    const outOfStock           = D.products.filter(p => !p.availability).length;
    const inStock              = D.products.filter(p => p.availability).length;

    const totalRevenue         = D.checkouts.filter(o => o.paymentStatus === "Done").reduce((s, o) => s + (o.total || 0), 0);
    const totalRevenuePending  = D.checkouts.filter(o => o.paymentStatus === "Pending").reduce((s, o) => s + (o.total || 0), 0);

    const pendingOrders        = D.checkouts.filter(o => o.orderStatus === "Order is Placed").length;
    const pendingPayments      = D.checkouts.filter(o => o.paymentStatus === "Pending").length;
    const deliveredOrders      = D.checkouts.filter(o => o.orderStatus === "Delivered").length;
    const cancelledOrders      = D.checkouts.filter(o => o.orderStatus === "Cancelled").length;

    const unreadContacts       = D.contacts.filter(c => c.active).length;
    const approvedTestimonials = D.testimonials.filter(t => t.active).length;
    const pendingTestimonials  = D.testimonials.filter(t => !t.active).length;

    const activeResturents     = D.resturents.filter(r => r.active).length;
    const inactiveResturents   = D.resturents.filter(r => !r.active).length;
    const fullyBookedResturents = D.resturents.filter(r => (r.seatAvailable || 0) === 0).length;

    // ── Recent orders sorted by date ──────────────────────────────────────────
    const recentOrders = [...D.checkouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    // ── Recent bookings sorted by date ─────────────────────────────────────────
    const recentBookings = [...D.bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // ── Unavailable products (replaces low-stock; no stockQuantity field exists) ──
    const unavailableProducts = D.products
        .filter(p => !p.availability)
        .slice(0, 5);

    // ── Monthly revenue area chart ────────────────────────────────────────────
    const monthlyMap = {};
    D.checkouts.filter(c => c.paymentStatus === "Done" && c.createdAt).forEach(c => {
        const key = new Date(c.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
        monthlyMap[key] = (monthlyMap[key] || 0) + (c.total || 0);
    });
    const monthlyRevenue = Object.entries(monthlyMap).slice(-7).map(([month, revenue]) => ({ month, revenue }));

    // ── Order status pie — all 5 statuses ────────────────────────────────────
    const orderStatusPie = [
        { name: "Placed",          value: D.checkouts.filter(c => c.orderStatus === "Order is Placed").length,  fill: "#ffc107" },
        { name: "Processing",      value: D.checkouts.filter(c => c.orderStatus === "Processing").length,       fill: "#0d6efd" },
        { name: "Out for Delivery",value: D.checkouts.filter(c => c.orderStatus === "Out for Delivery").length, fill: "#0dcaf0" },
        { name: "Delivered",       value: deliveredOrders,                                                       fill: "#198754" },
        { name: "Cancelled",       value: cancelledOrders,                                                       fill: "#dc3545" },
    ].filter(d => d.value > 0);

    // ── Revenue split bar ─────────────────────────────────────────────────────
    const revenueSplit = [
        { name: "Collected", revenue: totalRevenue,        fill: "#0d6efd" },
        { name: "Pending",   revenue: totalRevenuePending, fill: "#ffc107" },
    ];

    // ── Products per restaurant bar (replaces "per brand" — no Brand reducer exists) ──
    const resturentMap = {};
    D.products.forEach(p => { const n = p.resturent?.name || "Unknown"; resturentMap[n] = (resturentMap[n] || 0) + 1; });
    const productsPerResturent = Object.entries(resturentMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, count]) => ({ name, count }));

    // ── Products per category pie ─────────────────────────────────────────────
    const catMap = {};
    D.products.forEach(p => { const n = p.maincategory?.name || "Unknown"; catMap[n] = (catMap[n] || 0) + 1; });
    const productsPerCategory = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // ── Availability status bar ────────────────────────────────────────────────
    const availabilityData = [
        { name: "Available",     count: inStock,    fill: "#198754" },
        { name: "Unavailable",   count: outOfStock, fill: "#dc3545" },
    ];

    // ── Content breakdown bars ────────────────────────────────────────────────
    const contentBars = [
        { label: "Products",    count: D.products.length,       to: "/product",      color: "#0d6efd" },
        { label: "Main Cat.",   count: D.maincategories.length,  to: "/maincategory", color: "#198754" },
        { label: "Sub Cat.",    count: D.subcategories.length,   to: "/subcategory",  color: "#0dcaf0" },
        { label: "Resturents",  count: D.resturents.length,      to: "/resturent",    color: "#ffc107" },
        { label: "Orders",      count: D.checkouts.length,       to: "/checkout",     color: "#6f42c1" },
        { label: "Bookings",    count: D.bookings.length,        to: "/booking",      color: "#fd7e14" },
        { label: "Subscribers", count: D.newsletters.length,     to: "/newsletter",   color: "#14b8a6" },
    ];
    const maxBar = Math.max(...contentBars.map(b => b.count), 1);

    // ── Stat cards ────────────────────────────────────────────────────────────
    const statCards = [
        { label: "Total Products",   value: D.products.length,   icon: "bi-egg-fried",   variant: "metric-primary", to: "/product"   },
        { label: "Total Orders",     value: D.checkouts.length,  icon: "bi-bag-check",   variant: "metric-success", to: "/checkout"  },
        { label: "Table Bookings",   value: D.bookings.length,   icon: "bi-calendar-check", variant: "metric-warning", to: "/booking"  },
        { label: "Queries",          value: D.contacts.length,   icon: "bi-headset",     variant: "metric-danger",  to: "/contactUs" },
    ];

    // ── Alert cards ───────────────────────────────────────────────────────────
    const alertCards = [
        { label: "New Orders",         value: pendingOrders,          icon: "bi-clock-history",      color: "text-warning" },
        { label: "Pending Payments",   value: pendingPayments,        icon: "bi-credit-card",        color: "text-danger"  },
        { label: "Unread Messages",    value: unreadContacts,         icon: "bi-envelope",           color: "text-primary" },
        { label: "Fully Booked",       value: fullyBookedResturents,  icon: "bi-exclamation-circle", color: "text-warning" },
    ];

    // ── Quick actions ─────────────────────────────────────────────────────────
    const quickActions = [
        { label: "Add Product",     icon: "bi-plus-circle",     to: "/product/create",      color: "#0d6efd" },
        { label: "Add Category",    icon: "bi-folder-plus",     to: "/maincategory/create", color: "#198754" },
        { label: "Add Resturent",   icon: "bi-shop",            to: "/resturent/create",    color: "#ffc107" },
        { label: "Add Sub-Cat.",    icon: "bi-diagram-3",       to: "/subcategory/create",  color: "#0dcaf0" },
        { label: "View Orders",     icon: "bi-bag-check",       to: "/checkout",            color: "#6f42c1" },
        { label: "View Bookings",   icon: "bi-calendar-check",  to: "/booking",             color: "#fd7e14" },
        { label: "View Banner",     icon: "bi-images",          to: "/banner",              color: "#14b8a6" },
        { label: "View Messages",   icon: "bi-headset",         to: "/contactUs",           color: "#dc3545" },
        { label: "Testimonials",    icon: "bi-chat-quote",      to: "/testimonial",         color: "#ec4899" },
    ];

    const axisStyle = { fontSize: 11, fill: "var(--bs-secondary-color, #6c757d)" };
    const gridStyle = { stroke: "var(--bs-border-color, rgba(0,0,0,.1))", strokeDasharray: "3 3" };
    const PIE_COLORS = ["#0d6efd", "#198754", "#0dcaf0", "#ffc107", "#dc3545", "#6f42c1"];

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* ── Page heading ── */}
                <div className="page-heading mb-4">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-speedometer2" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Overview</p>
                            <h1 className="h3 mb-1">Dashboard</h1>
                            <p className="text-muted mb-0">
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Sample banner ── */}
                {usingSample && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-flask"></i>
                        <span><strong>Preview mode —</strong> showing sample data. API returned no records yet.</span>
                    </div>
                )}

                {/* ── Revenue banner ── */}
                <div
                    className="panel mb-4"
                    style={{
                        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
                        border: "none",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "0 12px 36px rgba(30, 58, 138, 0.25)",
                        padding: "1.75rem",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: -60,
                            right: -60,
                            width: 200,
                            height: 200,
                            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ position: "relative", zIndex: 1 }}>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    Live Financial Summary
                                </span>
                            </div>
                            <p className="text-white mb-0" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-.02em" }}>
                                {fmt(totalRevenue)}
                            </p>
                            <p className="text-white-50 mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
                                Total collected revenue across all verified transactions
                            </p>
                        </div>
                        <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 56,
                                height: 56,
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(8px)",
                                fontSize: 24,
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.25)",
                            }}
                        >
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 gap-md-3 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
                        {[
                            { icon: "bi-check-circle-fill", label: `Collected: ${fmt(totalRevenue)}`, bg: "rgba(16, 185, 129, 0.2)" },
                            { icon: "bi-clock-history",    label: `Pending: ${fmt(totalRevenuePending)}`, bg: "rgba(245, 158, 11, 0.2)" },
                            { icon: "bi-bag-check-fill",   label: `${deliveredOrders} Delivered`, bg: "rgba(255, 255, 255, 0.12)" },
                            { icon: "bi-x-circle-fill",     label: `${cancelledOrders} Cancelled`, bg: "rgba(239, 68, 68, 0.2)" },
                            { icon: "bi-box-seam-fill",    label: `${D.products.length} Products`, bg: "rgba(255, 255, 255, 0.12)" },
                            { icon: "bi-envelope-paper-fill", label: `${D.newsletters.length} Subscribers`, bg: "rgba(255, 255, 255, 0.12)" },
                        ].map((s, i) => (
                            <span
                                key={i}
                                className="d-inline-flex align-items-center gap-2 px-3 py-1 text-white"
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    background: s.bg,
                                    backdropFilter: "blur(6px)",
                                    borderRadius: "50px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                }}
                            >
                                <i className={`bi ${s.icon}`}></i> {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <section className="row g-3 mb-3">
                    {statCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
                            <Link to={c.to} style={{ textDecoration: "none" }}>
                                <article className={`metric-card ${c.variant}`}>
                                    <div className="metric-top">
                                        <span className="metric-label">{c.label}</span>
                                        <span className="metric-icon"><i className={`bi ${c.icon}`} aria-hidden="true"></i></span>
                                    </div>
                                    <div className="metric-value">{c.value}</div>
                                    <div className="metric-meta"><span className="text-muted">total records</span></div>
                                </article>
                            </Link>
                        </div>
                    ))}
                </section>

                {/* ── Alert cards ── */}
                <div className="row g-3 mb-3">
                    {alertCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
                            <div className="panel d-flex align-items-center gap-3 py-3">
                                <span className={`fs-4 ${c.color}`}><i className={`bi ${c.icon}`}></i></span>
                                <div>
                                    <div className="fw-bold fs-5">{c.value}</div>
                                    <div className="text-muted small">{c.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Monthly Revenue (area) + Order Status (pie) ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-graph-up" aria-hidden="true"></i>
                                        <span>Monthly Revenue Trend</span>
                                    </h2>
                                    <p className="text-muted mb-0">Completed orders only</p>
                                </div>
                                <span className="badge text-bg-secondary" style={{ fontSize: 11 }}>Last 7 months</span>
                            </div>
                            {monthlyRevenue.length === 0
                                ? <p className="text-muted text-center py-4">No revenue data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0d6efd" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid {...gridStyle} />
                                        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                                        <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                            tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                        <Tooltip content={<DashTooltip />} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue"
                                            stroke="#0d6efd" strokeWidth={2.5} fill="url(#revGrad)"
                                            dot={{ fill: "#0d6efd", r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: "#6ea8fe" }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bag-check" aria-hidden="true"></i>
                                        <span>Order Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">All statuses</p>
                                </div>
                                <Link to="/checkout" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {orderStatusPie.length === 0
                                ? <p className="text-muted text-center py-4">No orders yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={orderStatusPie} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                                            paddingAngle={3} strokeWidth={0}>
                                            {orderStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Pie>
                                        <Tooltip content={<DashTooltip />} />
                                        <Legend iconType="circle" iconSize={8}
                                            formatter={v => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Revenue Split + Payment Modes + Availability Status ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
                                        <span>Revenue Split</span>
                                    </h2>
                                    <p className="text-muted mb-0">Collected vs Pending</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={revenueSplit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={44}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                        tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                                        {revenueSplit.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-credit-card" aria-hidden="true"></i>
                                        <span>Payment Modes</span>
                                    </h2>
                                    <p className="text-muted mb-0">Orders by payment type</p>
                                </div>
                            </div>
                            {(() => {
                                const modeMap = {};
                                D.checkouts.forEach(c => { const m = c.paymentMode || "COD"; modeMap[m] = (modeMap[m] || 0) + 1; });
                                const modeData = Object.entries(modeMap).map(([name, count]) => ({ name, count }));
                                return modeData.length === 0
                                    ? <p className="text-muted text-center py-4">No data yet.</p>
                                    : <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={modeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={36}>
                                            <CartesianGrid {...gridStyle} />
                                            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<DashTooltip />} />
                                            <Bar dataKey="count" name="Orders" fill="#6f42c1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>;
                            })()}
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-boxes" aria-hidden="true"></i>
                                        <span>Availability Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">Available vs unavailable</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={availabilityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={44}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                                        {availabilityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Products per Resturent + Products per Category ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-shop" aria-hidden="true"></i>
                                        <span>Products per Resturent</span>
                                    </h2>
                                    <p className="text-muted mb-0">Top 6 resturents by item count</p>
                                </div>
                                <Link to="/resturent" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {productsPerResturent.length === 0
                                ? <p className="text-muted text-center py-4">No product data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={productsPerResturent} margin={{ top: 10, right: 10, left: 0, bottom: 44 }} barSize={32}>
                                        <CartesianGrid {...gridStyle} />
                                        <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false}
                                            angle={-25} textAnchor="end" interval={0} />
                                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<DashTooltip />} />
                                        <Bar dataKey="count" name="Products" fill="#fd7e14" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-layer-backward" aria-hidden="true"></i>
                                        <span>Products per Category</span>
                                    </h2>
                                    <p className="text-muted mb-0">Category distribution</p>
                                </div>
                                <Link to="/maincategory" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {productsPerCategory.length === 0
                                ? <p className="text-muted text-center py-4">No product data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={productsPerCategory} dataKey="count" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                                            paddingAngle={3} strokeWidth={0}>
                                            {productsPerCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<DashTooltip />} />
                                        <Legend iconType="circle" iconSize={8}
                                            formatter={v => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Content breakdown ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bar-chart" aria-hidden="true"></i>
                                        <span>Content Breakdown</span>
                                    </h2>
                                    <p className="text-muted mb-0">Records per section</p>
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-2 mt-3">
                                {contentBars.map(b => (
                                    <div key={b.label} className="d-flex align-items-center gap-2">
                                        <Link to={b.to} style={{ width: 86, fontSize: 12, color: "var(--bs-secondary-color)", textDecoration: "none", flexShrink: 0 }}>
                                            {b.label}
                                        </Link>
                                        <div className="flex-grow-1" style={{ height: 8, background: "var(--bs-secondary-bg)", borderRadius: 99, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${Math.round((b.count / maxBar) * 100)}%`, background: b.color, borderRadius: 99, transition: "width .5s ease" }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{b.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Testimonial status ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-chat-quote" aria-hidden="true"></i>
                                        <span>Testimonial Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">Approved vs pending</p>
                                </div>
                                <Link to="/testimonial" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={[
                                        { name: "Approved", value: approvedTestimonials, fill: "#198754" },
                                        { name: "Pending",  value: pendingTestimonials,  fill: "#ffc107" },
                                    ].filter(d => d.value > 0)} dataKey="value" nameKey="name"
                                        cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                                        paddingAngle={3} strokeWidth={0}>
                                        {[{ fill: "#198754" }, { fill: "#ffc107" }].map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Pie>
                                    <Tooltip content={<DashTooltip />} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={v => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Recent Messages ── */}
                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-headset" aria-hidden="true"></i>
                                        <span>Recent Messages</span>
                                    </h2>
                                    <p className="text-muted mb-0">Latest contact queries</p>
                                </div>
                                <Link to="/contactUs" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <div className="table-responsive mt-2">
                                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {D.contacts.slice(0, 5).map((c, i) => (
                                            <tr key={i}>
                                                <td className="fw-semibold">{c.name || "—"}</td>
                                                <td className="text-muted">{c.email || "—"}</td>
                                                <td>
                                                    <span className={`badge ${c.active ? "text-bg-warning" : "text-bg-success"}`}>
                                                        {c.active ? "Unread" : "Read"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Orders (rich table) ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-receipt" aria-hidden="true"></i>
                                        <span>Recent Orders</span>
                                    </h2>
                                    <p className="text-muted mb-0">Latest checkout records, sorted by date</p>
                                </div>
                                <Link to="/checkout" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <div className="table-responsive mt-2">
                                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Pay Mode</th>
                                            <th>Subtotal</th>
                                            <th>Shipping</th>
                                            <th>Total</th>
                                            <th>Order Status</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((o, i) => {
                                            const s = orderBadge(o.orderStatus);
                                            return (
                                                <tr key={i}>
                                                    <td className="text-muted" style={{ fontSize: 11 }}>#{i + 1}</td>
                                                    <td className="fw-semibold">{o.user?.name || o.user?.email || "—"}</td>
                                                    <td className="text-muted">{o.paymentMode || "COD"}</td>
                                                    <td className="text-muted">{fmt(o.subtotal || 0)}</td>
                                                    <td className="text-muted">{fmt(o.shipping || 0)}</td>
                                                    <td className="fw-semibold">{fmt(o.total || 0)}</td>
                                                    <td><span className={s.cls}>{s.label}</span></td>
                                                    <td><span className={payBadge(o.paymentStatus)}>{o.paymentStatus || "Pending"}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Unavailable Products + Quick Actions ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                                        <span>Unavailable Products</span>
                                    </h2>
                                    <p className="text-muted mb-0">Products currently marked unavailable</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {unavailableProducts.length === 0
                                ? <p className="text-muted text-center py-4">🎉 All products are available.</p>
                                : <div className="table-responsive mt-2">
                                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                        <thead>
                                            <tr><th>Product</th><th>Resturent</th><th>Category</th><th>Price</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {unavailableProducts.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="fw-semibold">{p.name}</td>
                                                    <td className="text-muted">{p.resturent?.name || "—"}</td>
                                                    <td className="text-muted">{p.maincategory?.name || "—"}</td>
                                                    <td className="text-muted">{fmt(p.finalPrice || 0)}</td>
                                                    <td>
                                                        <span className="badge text-bg-danger">Unavailable</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-lightning" aria-hidden="true"></i>
                                        <span>Quick Actions</span>
                                    </h2>
                                </div>
                            </div>

                            <div className="row g-2">
                                {quickActions.map((q, i) => (
                                    <div key={i} className="col-6">
                                        <Link
                                            to={q.to}
                                            className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 text-decoration-none"
                                            style={{
                                                background: "var(--admin-surface-soft)",
                                                border: "1px solid var(--admin-border)",
                                                fontSize: "0.82rem",
                                                fontWeight: 600,
                                                color: "var(--admin-text)",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)";
                                                e.currentTarget.style.borderColor = q.color;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                                e.currentTarget.style.borderColor = "var(--admin-border)";
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 6,
                                                    background: `${q.color}15`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 13 }}></i>
                                            </div>
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.label}</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--bs-border-color)" }}>
                                {[
                                    { icon: "bi-envelope-paper", color: "text-primary",   label: "Newsletter Subscribers", val: D.newsletters.length,   to: "/newsletter"  },
                                    { icon: "bi-star",           color: "text-warning",   label: "Testimonials",          val: D.testimonials.length,   to: "/testimonial" },
                                ].map((r, i) => (
                                    <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={`text-muted small d-flex align-items-center gap-2`}>
                                            <i className={`bi ${r.icon} ${r.color}`}></i> {r.label}
                                        </span>
                                        <Link to={r.to} className="fw-bold small text-decoration-none">{r.val}</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Bookings ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-calendar-check" aria-hidden="true"></i>
                                        <span>Recent Table Bookings</span>
                                    </h2>
                                    <p className="text-muted mb-0">Latest reservation requests</p>
                                </div>
                                <Link to="/booking" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {recentBookings.length === 0
                                ? <p className="text-muted text-center py-4">No bookings yet.</p>
                                : <div className="table-responsive mt-2">
                                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                        <thead>
                                            <tr><th>#</th><th>Customer</th><th>Resturent</th><th>Seats</th></tr>
                                        </thead>
                                        <tbody>
                                            {recentBookings.map((b, i) => (
                                                <tr key={i}>
                                                    <td className="text-muted" style={{ fontSize: 11 }}>#{i + 1}</td>
                                                    <td className="fw-semibold">{b.user?.name || b.user?.email || "—"}</td>
                                                    <td className="text-muted">{b.resturent?.name || "—"}</td>
                                                    <td className="text-muted">{b.qty || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}