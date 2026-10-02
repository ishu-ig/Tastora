"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Navigation,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import api from "../lib/axiosInstance";
import Reveal from "./Reveal";

// ── Restaurant details: edit here ───────────────────────────────────────────
const RESTAURANT = {
  address: "42 Flavor Street, Manhattan, New York, NY 10001",
  phone: "+1 (800) 123-4567",
  phoneHref: "tel:+18001234567",
  email: "hello@tastorafood.com",
};

// Index 0 = Sunday ... 6 = Saturday. Keep in sync with your reservation hours.
const HOURS = [
  { day: "Sunday", open: "09:00", close: "23:00" },
  { day: "Monday", closed: true },
  { day: "Tuesday", closed: true },
  { day: "Wednesday", open: "09:00", close: "23:00" },
  { day: "Thursday", open: "09:00", close: "23:00" },
  { day: "Friday", open: "09:00", close: "23:00" },
  { day: "Saturday", open: "09:00", close: "23:00" },
];

const SUBJECTS = [
  "General Inquiry",
  "Catering & Events",
  "Feedback & Suggestions",
  "Partnership & Franchise",
  "Media & Press",
];

const FAQS = [
  {
    q: "Is all your food 100% vegetarian?",
    a: "Yes. Tastora runs a dedicated pure vegetarian kitchen, and we offer Satvik (onion-garlic mindful) and Jain preparations on request.",
  },
  {
    q: "How do I reserve a table?",
    a: "Open the Reserve page, choose your date, time slot and number of guests, and confirm. You get an instant digital table pass.",
  },
  {
    q: "Do you take catering and event orders?",
    a: "We do. Choose “Catering & Events” in the form above with your date, guest count and venue, and our team will reply with a custom menu and quote.",
  },
  {
    q: "How quickly will you reply to my message?",
    a: "We aim to reply within 2 hours during opening hours. For anything urgent, please call us.",
  },
];

const to12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: SUBJECTS[0],
  message: "",
  website: "", // honeypot: real users never fill this
};

const MAX_MESSAGE = 500;

const inputBase =
  "w-full px-4 py-3 rounded-2xl bg-zinc-50 border text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all";
const inputOk = "border-zinc-200 focus:ring-rose-500/40 focus:border-rose-500";
const inputBad = "border-red-300 focus:ring-red-400/40 focus:border-red-500";

// Server may send reason as a string or as { field: message }
function readReason(error) {
  const reason = error?.response?.data?.reason;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") return Object.values(reason)[0];
  return null;
}

export function Contactus() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Computed after mount so the server and browser render the same HTML
  const [todayIdx, setTodayIdx] = useState(null);
  const [openNow, setOpenNow] = useState(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const idx = now.getDay();
      const today = HOURS[idx];
      const mins = now.getHours() * 60 + now.getMinutes();
      setTodayIdx(idx);
      setOpenNow(
        !today.closed && mins >= toMinutes(today.open) && mins < toMinutes(today.close)
      );
    };
    compute();
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, []);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.phone.trim() && !/^[+\d][\d\s()-]{6,17}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid phone number.";
    }
    if (form.message.trim().length < 10) e.message = "Please write at least 10 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Bots fill the hidden field. Pretend it worked and stop.
    if (form.website) {
      setIsSubmitted(true);
      setForm(EMPTY_FORM);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      const res = await api.post("/contactus", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      if (res.data?.result !== "Done") {
        throw new Error(res.data?.reason || "Could not send your message.");
      }
      setIsSubmitted(true);
      setForm(EMPTY_FORM);
      setTimeout(() => setIsSubmitted(false), 6000);
    } catch (error) {
      setServerError(
        readReason(error) ||
          error.message ||
          "Something went wrong. Please try again or call us."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapQuery = encodeURIComponent(RESTAURANT.address);
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  const quickCards = [
    {
      icon: Phone,
      label: "Call us",
      value: RESTAURANT.phone,
      href: RESTAURANT.phoneHref,
      tone: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      icon: Mail,
      label: "Email us",
      value: RESTAURANT.email,
      href: `mailto:${RESTAURANT.email}`,
      tone: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      icon: Navigation,
      label: "Visit us",
      value: "Get directions",
      href: directionsHref,
      external: true,
      tone: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <section
      id="contact-section"
      className="relative scroll-mt-28 overflow-hidden bg-white py-12 sm:py-16"
    >
      <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-rose-100/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            Contact{" "}
            <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
              Us
            </span>
          </h2>
          <div className="mx-auto mb-4 mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-rose-600 to-amber-500" />
          <p className="text-base text-zinc-600 sm:text-lg">
            Have a question, catering request, or feedback? We’d love to connect with you.
          </p>
        </Reveal>

        {/* Quick action cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.label} delay={i * 90}>
                <a
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${card.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      {card.label}
                    </p>
                    <p className="truncate text-sm font-bold text-zinc-900 group-hover:text-rose-600">
                      {card.value}
                    </p>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left: info + hours */}
          <Reveal className="lg:col-span-5">
            <div className="relative space-y-7 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-8 text-white shadow-2xl sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-500/20 blur-2xl" />

              <div>
                <h3 className="mb-2 text-2xl font-bold text-white">Let's Talk</h3>
                <p className="text-sm text-zinc-400">
                  We typically respond within 2 hours during opening hours.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-700/60 bg-zinc-800 text-rose-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Address
                  </div>
                  <div className="text-sm font-medium text-zinc-200">{RESTAURANT.address}</div>
                </div>
              </div>

              {/* Opening hours */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <Clock className="h-4 w-4 text-rose-400" />
                    Opening Hours
                  </div>
                  {openNow !== null && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${
                        openNow
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          openNow ? "animate-pulse bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      {openNow ? "Open now" : "Closed now"}
                    </span>
                  )}
                </div>
                <ul className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-black/20">
                  {HOURS.map((h, i) => {
                    const isToday = todayIdx === i;
                    return (
                      <li
                        key={h.day}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                          isToday ? "bg-rose-500/10 font-bold text-white" : "text-zinc-300"
                        }`}
                      >
                        <span>
                          {h.day}
                          {isToday && (
                            <span className="ml-2 text-[10px] font-black uppercase text-rose-300">
                              Today
                            </span>
                          )}
                        </span>
                        <span className={h.closed ? "text-zinc-500" : ""}>
                          {h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Social */}
              <div className="border-t border-zinc-800/80 pt-4">
                <div className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Follow Us
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { icon: FaFacebookF, href: "#", label: "Facebook" },
                    { icon: FaInstagram, href: "#", label: "Instagram" },
                    { icon: FaXTwitter, href: "#", label: "X" },
                    { icon: FaYoutube, href: "#", label: "YouTube" },
                  ].map((social) => {
                    const SIcon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        aria-label={social.label}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-rose-600 hover:text-white"
                      >
                        <SIcon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={100} className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl sm:p-10">
              <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-zinc-900">
                <MessageSquare className="h-6 w-6 text-rose-600" />
                <span>Send Us a Message</span>
              </h3>

              {isSubmitted && (
                <div
                  role="status"
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 animate-in fade-in duration-300"
                >
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold">Thank you! Message sent successfully.</p>
                    <p className="text-xs text-emerald-700">
                      We will get back to you within 2 hours.
                    </p>
                  </div>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot: hidden from people and screen readers */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700"
                    >
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      className={`${inputBase} ${errors.name ? inputBad : inputOk}`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      className={`${inputBase} ${errors.email ? inputBad : inputOk}`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (800) 000-0000"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      className={`${inputBase} ${errors.phone ? inputBad : inputOk}`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700"
                    >
                      Subject *
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-700"
                    >
                      Your Message *
                    </label>
                    <span
                      className={`text-[11px] font-semibold ${
                        form.message.length >= MAX_MESSAGE ? "text-red-500" : "text-zinc-400"
                      }`}
                    >
                      {form.message.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    rows={4}
                    maxLength={MAX_MESSAGE}
                    placeholder="How can we help you? Write your message here..."
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    className={`${inputBase} resize-none ${errors.message ? inputBad : inputOk}`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>

        {/* Map */}
        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 shadow-xl">
            <iframe
              title="Tastora location map"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-72 w-full border-0 sm:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:inset-x-auto sm:left-4 sm:max-w-xs">
              <div className="pointer-events-auto rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                <p className="flex items-center gap-1.5 text-sm font-black text-zinc-900">
                  <MapPin className="h-4 w-4 text-rose-600" />
                  Tastora Pure Veg Restaurant
                </p>
                <p className="mt-1 text-xs text-zinc-500">{RESTAURANT.address}</p>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800"
                >
                  <Navigation className="h-3.5 w-3.5 text-amber-400" />
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <div className="mx-auto mt-14 max-w-3xl">
          <Reveal className="mb-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
              <HelpCircle className="h-4 w-4" />
              Quick Answers
            </div>
            <h3 className="text-2xl font-black text-zinc-900 sm:text-3xl">
              Frequently Asked Questions
            </h3>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 70}>
                <details className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs transition-shadow open:border-rose-200 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-bold text-zinc-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-rose-600 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-600">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contactus;