"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export function Contactus() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <section id="contact-section" className="py-12 sm:py-16 bg-white relative overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
            Contact <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">Us</span>
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-rose-600 to-amber-500 rounded-full mx-auto mt-4 mb-4" />
          <p className="text-zinc-600 text-base sm:text-lg">
            Have a question, catering request, or feedback? We’d love to connect with you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-8 sm:p-10 border border-zinc-800 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Let's Talk</h3>
              <p className="text-zinc-400 text-sm">
                We typically respond within 2 hours during active business hours.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  label: "Address",
                  val: "42 Flavor Street, Manhattan, New York, NY 10001",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  val: "+1 (800) 123-4567",
                  href: "tel:+18001234567",
                },
                {
                  icon: Mail,
                  label: "Email",
                  val: "hello@tastorafood.com",
                  href: "mailto:hello@tastorafood.com",
                },
                {
                  icon: Clock,
                  label: "Working Hours",
                  val: "Wed - Sun: 9:00 AM – 11:00 PM",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                        {item.label}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-medium text-zinc-200 hover:text-rose-400 transition-colors"
                        >
                          {item.val}
                        </a>
                      ) : (
                        <div className="text-sm font-medium text-zinc-200">
                          {item.val}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-4">
                Follow Us
              </div>
              <div className="flex items-center gap-3">
                {[
                  { icon: FaFacebookF, href: "#" },
                  { icon: FaInstagram, href: "#" },
                  { icon: FaXTwitter, href: "#" },
                  { icon: FaYoutube, href: "#" },
                ].map((social, i) => {
                  const SIcon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
                    >
                      <SIcon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-xl">
            <h3 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-rose-600" />
              <span>Send Us a Message</span>
            </h3>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Thank you! Message Sent Successfully.</p>
                  <p className="text-xs text-emerald-700">We will get back to you within 2 hours.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (800) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                  >
                    <option>General Inquiry</option>
                    <option>Catering &amp; Events</option>
                    <option>Feedback &amp; Suggestions</option>
                    <option>Partnership &amp; Franchise</option>
                    <option>Media &amp; Press</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you? Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contactus;
