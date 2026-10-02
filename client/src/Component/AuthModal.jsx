"use client";

import React, { useState, useEffect } from "react";
import api from "../lib/axiosInstance"; // fixed typo: axiosIntance → axiosInstance
import { useAuth } from "../context/AuthContext";
import {
  X,
  Phone,
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  RotateCcw,
} from "lucide-react";

export function AuthModal({ isOpen, onClose, initialMode = "login", onAuthSuccess }) {
  const { loginUser, checkAuth } = useAuth() || {};
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState(null); // shown in dev mode only

  // Form Fields
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setAuthSuccess(false);
    setDevOtp(null);
  }, [initialMode, isOpen]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  if (!isOpen) return null;

  // Handle OTP inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Submit Phone (Login or Signup) to Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (mode === "signup" && !agreedTerms) {
      alert("Please agree to the Terms & Conditions to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = { phoneNo: phone };

      if (mode === "signup") {
        payload.name = fullName;
        payload.email = email;
      }

      const res = await api.post("/user/send-otp", payload);

      // In development, backend returns devOtp for easy testing
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }

      setOtpSent(true);
      setTimer(30);
    } catch (error) {
      const reason = error.response?.data?.reason;
      const message =
        typeof reason === "string"
          ? reason
          : typeof reason === "object" && reason !== null
            ? Object.values(reason).flat().join(", ")
            : "Failed to send OTP. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join("");

    if (enteredCode.length < 6) {
      alert("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/user/verify-otp", {
        phoneNo: phone,
        otp: enteredCode,
      });

      // Save token + user info so the axios interceptor can use it
      // and the Navbar updates instantly without waiting for cookie parsing
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data?.userid) {
        localStorage.setItem("userid", String(res.data.userid));
      }
      if (res.data?.data?.role) {
        localStorage.setItem("role", res.data.data.role);
      }

      // ✅ KEY FIX: Immediately update AuthContext with the full user object
      // from the OTP response. This triggers CartContext's useEffect to sync
      // creditCoinsBalance and useCreditCoins hook to read the real value.
      // Without this, user stays null in AuthContext until page reload.
      if (loginUser && res.data?.data) {
        loginUser(res.data.data);
      }

      setAuthSuccess(true);

      if (onAuthSuccess) {
        onAuthSuccess(res.data.data);
      }

      // Close modal after brief success animation, then re-fetch from server
      // as a safety net to get latest DB state (e.g. updated coins balance)
      setTimeout(() => {
        onClose();
        setAuthSuccess(false);
        setOtpSent(false);
        setDevOtp(null);
        // Re-fetch fresh user data from server after modal closes
        if (checkAuth) checkAuth();
      }, 1200);
    } catch (error) {
      const reason = error.response?.data?.reason;
      const message =
        typeof reason === "string"
          ? reason
          : "Invalid or expired OTP. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post("/user/send-otp", { phoneNo: phone });
      setTimer(30);
    } catch (error) {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Banner */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Tastora Gourmet Experience</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">
            {authSuccess
              ? "Welcome to Tastora!"
              : mode === "login"
                ? "Login to Your Account"
                : "Create New Account"}
          </h3>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {authSuccess
              ? "You have been successfully authenticated."
              : mode === "login"
                ? "Enter your phone number to login and track live orders."
                : "Sign up with your complete name, phone number, and email."}
          </p>

          {!otpSent && !authSuccess && (
            <div className="mt-5 grid grid-cols-2 p-1 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setOtpSent(false);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === "login"
                  ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                Login (Phone)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setOtpSent(false);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === "signup"
                  ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6">
          {authSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-zinc-900">
                Authentication Successful!
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Welcome back, {fullName || "Foodie"}! Redirecting to your menu...
              </p>
            </div>
          ) : otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-2.5 rounded-full bg-rose-100 text-rose-600 mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-900">
                  Verify Phone Number
                </h4>
                <p className="text-xs text-zinc-500">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-zinc-800">
                    {countryCode} {phone}
                  </strong>
                </p>
              </div>

              {/* Dev OTP hint banner */}
              {devOtp && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🔧 Dev Mode OTP</p>
                    <p className="text-2xl font-black font-mono tracking-[0.3em] text-amber-900 mt-0.5">{devOtp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = devOtp.split("");
                      setOtp(digits);
                      // auto-focus last input
                      setTimeout(() => document.getElementById(`otp-5`)?.focus(), 50);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-black font-mono rounded-xl bg-zinc-50 border-2 border-zinc-200 focus:border-rose-500 focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-zinc-500">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Change phone number
                </button>

                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : mode === "login" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center rounded-2xl border border-zinc-300 bg-zinc-50 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all overflow-hidden">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent pl-3 pr-2 py-3 text-xs font-bold text-zinc-700 border-r border-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                  </select>

                  <div className="relative flex-1 flex items-center">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3" />
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-9 pr-3 py-3 text-sm font-semibold text-zinc-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>We&apos;ll send a one-time password (OTP) via SMS.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Continue with Phone</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-zinc-100 text-xs text-zinc-500">
                New to Tastora?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                >
                  Create an Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Complete Name
                </label>
                <div className="relative flex items-center rounded-2xl border border-zinc-300 bg-zinc-50 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all overflow-hidden">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-zinc-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="flex items-center rounded-2xl border border-zinc-300 bg-zinc-50 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all overflow-hidden">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent pl-3 pr-2 py-2.5 text-xs font-bold text-zinc-700 border-r border-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>

                  <div className="relative flex-1 flex items-center">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3" />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold text-zinc-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center rounded-2xl border border-zinc-300 bg-zinc-50 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all overflow-hidden">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-zinc-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-zinc-500">
                  I agree to Tastora&apos;s{" "}
                  <span className="text-zinc-800 font-semibold underline cursor-pointer">
                    Terms &amp; Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-zinc-800 font-semibold underline cursor-pointer">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1.5 border-t border-zinc-100 text-xs text-zinc-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}