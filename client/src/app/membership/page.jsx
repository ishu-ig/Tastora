"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/axiosInstance";

// ── Helpers ─────────────────────────────────────────────────────────────
// Replace with your real auth helper if you already have one.
function getUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function reasonText(reason, fallback) {
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") {
    return Object.values(reason)[0] || fallback;
  }
  return fallback;
}

const emptyProfile = { name: "", email: "", phone: "" };

export default function MembershipPage() {
  const userId = useMemo(() => getUserId(), []);

  // Profile
  const [profile, setProfile] = useState(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Membership
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [membership, setMembership] = useState(null); // active membership or null
  const [buyingId, setBuyingId] = useState(null);
  const [planMsg, setPlanMsg] = useState({ type: "", text: "" });

  const planSectionRef = useRef(null);

  // ── Load data ─────────────────────────────────────────────────────────
  async function fetchProfile() {
    setProfileLoading(true);
    try {
      const res = await api.get(`/api/user/${userId}`);
      const u = res.data?.data || res.data?.user || {};
      setProfile({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
      });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: reasonText(err.response?.data?.reason, "Could not load your profile."),
      });
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchPlans() {
    setPlansLoading(true);
    try {
      const res = await api.get("/api/membership/plans");
      setPlans(res.data?.data || []);
    } catch (err) {
      setPlanMsg({
        type: "error",
        text: reasonText(err.response?.data?.reason, "Could not load membership plans."),
      });
    } finally {
      setPlansLoading(false);
    }
  }

  async function fetchMembership() {
    try {
      const res = await api.get(`/api/membership/status/${userId}`);
      setMembership(res.data?.data || null);
    } catch {
      setMembership(null);
    }
  }

  useEffect(() => {
    if (!userId) {
      setProfileLoading(false);
      setPlansLoading(false);
      return;
    }
    fetchProfile();
    fetchPlans();
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Update profile ────────────────────────────────────────────────────
  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });

    if (!profile.name.trim()) {
      setProfileMsg({ type: "error", text: "Enter your name." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setProfileMsg({ type: "error", text: "Enter a valid email address." });
      return;
    }
    if (profile.phone && !/^\d{10}$/.test(profile.phone.replace(/\s/g, ""))) {
      setProfileMsg({ type: "error", text: "Enter a 10-digit phone number." });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put(`/api/user/${userId}`, {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.replace(/\s/g, ""),
      });

      if (res.data?.result === "Done") {
        setProfileMsg({ type: "success", text: "Profile updated." });
      } else {
        setProfileMsg({
          type: "error",
          text: reasonText(res.data?.reason, "Could not update your profile."),
        });
      }
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: reasonText(
          err.response?.data?.reason,
          "Internal Server Error. Please try again."
        ),
      });
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Buy membership (Razorpay) ─────────────────────────────────────────
  async function handleBuy(plan) {
    setPlanMsg({ type: "", text: "" });
    setBuyingId(plan._id);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPlanMsg({
          type: "error",
          text: "Could not load the payment window. Check your connection and try again.",
        });
        setBuyingId(null);
        return;
      }

      // 1. Ask the server to create an order for this plan
      const orderRes = await api.post("/api/membership/order", {
        user: userId,
        planId: plan._id,
      });

      if (orderRes.data?.result !== "Done") {
        setPlanMsg({
          type: "error",
          text: reasonText(orderRes.data?.reason, "Could not start the payment."),
        });
        setBuyingId(null);
        return;
      }

      const order = orderRes.data.data; // { orderId, amount (paise), currency, key }

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Your Store",
        description: `${plan.name} membership`,
        order_id: order.orderId,
        prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone,
        },
        theme: { color: "#0f766e" },
        modal: {
          ondismiss: () => setBuyingId(null),
        },
        handler: async (response) => {
          // 3. Verify the payment on the server before activating
          try {
            const verifyRes = await api.post("/api/membership/verify", {
              user: userId,
              planId: plan._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.result === "Done") {
              setPlanMsg({
                type: "success",
                text: `You're now a ${plan.name} member.`,
              });
              fetchMembership();
            } else {
              setPlanMsg({
                type: "error",
                text: reasonText(
                  verifyRes.data?.reason,
                  "Payment received, but we couldn't activate your membership. Contact support."
                ),
              });
            }
          } catch (err) {
            setPlanMsg({
              type: "error",
              text: reasonText(
                err.response?.data?.reason,
                "Payment received, but we couldn't activate your membership. Contact support."
              ),
            });
          } finally {
            setBuyingId(null);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        setPlanMsg({
          type: "error",
          text: resp?.error?.description || "Payment failed. You were not charged.",
        });
        setBuyingId(null);
      });

      rzp.open();
    } catch (err) {
      setPlanMsg({
        type: "error",
        text: reasonText(
          err.response?.data?.reason,
          "Internal Server Error. Please try again."
        ),
      });
      setBuyingId(null);
    }
  }

  const isActive =
    membership &&
    (!membership.expiresAt || new Date(membership.expiresAt) > new Date());

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (!userId) {
    return (
      <main className="mp">
        <style>{css}</style>
        <div className="mp-wrap">
          <h1>Membership</h1>
          <p className="mp-muted">Log in to buy a membership and manage your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mp">
      <style>{css}</style>

      <div className="mp-wrap">
        <header className="mp-head">
          <h1>Membership &amp; profile</h1>
          {isActive ? (
            <p className="mp-status mp-status--on">
              {membership.planName || "Member"}
              {membership.expiresAt && <> · renews or ends {formatDate(membership.expiresAt)}</>}
            </p>
          ) : (
            <p className="mp-status">
              You don't have an active membership.{" "}
              <button
                type="button"
                className="mp-link"
                onClick={() => planSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                See plans
              </button>
            </p>
          )}
        </header>

        {/* ── Plans ─────────────────────────────────────────────── */}
        <section ref={planSectionRef} aria-labelledby="plans-h">
          <h2 id="plans-h">Choose a plan</h2>

          {planMsg.text && (
            <p role="status" className={`mp-msg mp-msg--${planMsg.type}`}>
              {planMsg.text}
            </p>
          )}

          {plansLoading ? (
            <p className="mp-muted">Loading plans…</p>
          ) : plans.length === 0 ? (
            <p className="mp-muted">No plans are available right now. Check back soon.</p>
          ) : (
            <div className="mp-plans">
              {plans.map((plan) => {
                const current = isActive && membership.planId === plan._id;
                return (
                  <article
                    key={plan._id}
                    className={`mp-plan ${plan.popular ? "mp-plan--pop" : ""}`}
                  >
                    <h3>{plan.name}</h3>
                    <p className="mp-price">
                      ₹{plan.price}
                      <span> / {plan.durationDays ? `${plan.durationDays} days` : "plan"}</span>
                    </p>
                    {plan.description && <p className="mp-muted">{plan.description}</p>}
                    <ul>
                      {(plan.features || []).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mp-btn"
                      disabled={buyingId !== null || current}
                      onClick={() => handleBuy(plan)}
                    >
                      {current
                        ? "Current plan"
                        : buyingId === plan._id
                        ? "Opening payment…"
                        : isActive
                        ? "Switch to this plan"
                        : "Buy membership"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Profile ───────────────────────────────────────────── */}
        <section aria-labelledby="profile-h" className="mp-profile">
          <h2 id="profile-h">Your details</h2>

          {profileMsg.text && (
            <p role="status" className={`mp-msg mp-msg--${profileMsg.type}`}>
              {profileMsg.text}
            </p>
          )}

          {profileLoading ? (
            <p className="mp-muted">Loading your profile…</p>
          ) : (
            <form onSubmit={handleProfileSubmit} noValidate>
              <label>
                Full name
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  autoComplete="email"
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  autoComplete="tel"
                  placeholder="10-digit number"
                />
              </label>
              <button type="submit" className="mp-btn" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

const css = `
.mp { background:#f4f7f7; min-height:100vh; color:#14232b; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.mp-wrap { max-width: 920px; margin: 0 auto; padding: 32px 20px 64px; }
.mp h1 { font-size: 1.9rem; margin: 0 0 6px; letter-spacing: -0.01em; }
.mp h2 { font-size: 1.2rem; margin: 40px 0 14px; }
.mp h3 { margin: 0 0 4px; font-size: 1.05rem; }
.mp-muted { color:#5b6b73; margin: 0 0 12px; max-width: 60ch; }
.mp-status { margin: 0; color:#5b6b73; }
.mp-status--on { color:#0f766e; font-weight: 600; }
.mp-link { background:none; border:0; padding:0; color:#0f766e; text-decoration: underline; cursor:pointer; font: inherit; }
.mp-msg { padding: 10px 12px; border-radius: 6px; margin: 0 0 14px; font-size: .95rem; }
.mp-msg--success { background:#e2f4ee; color:#0b5a50; }
.mp-msg--error { background:#fdeaea; color:#9b1c1c; }
.mp-plans { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.mp-plan { background:#fff; border:1px solid #d6e0e3; border-radius: 10px; padding: 20px; display:flex; flex-direction:column; }
.mp-plan--pop { border:2px solid #0f766e; }
.mp-price { font-size: 1.7rem; font-weight: 700; margin: 4px 0 10px; }
.mp-price span { font-size: .9rem; font-weight: 400; color:#5b6b73; }
.mp-plan ul { padding-left: 18px; margin: 0 0 18px; flex:1; line-height: 1.6; }
.mp-profile form { background:#fff; border:1px solid #d6e0e3; border-radius: 10px; padding: 20px; display:grid; gap: 14px; max-width: 480px; }
.mp-profile label { display:grid; gap: 6px; font-size: .9rem; font-weight: 600; }
.mp-profile input { font: inherit; font-weight: 400; padding: 10px 12px; border:1px solid #b9c7cc; border-radius: 6px; background:#fff; }
.mp-profile input:focus-visible, .mp-btn:focus-visible, .mp-link:focus-visible { outline: 2px solid #0f766e; outline-offset: 2px; }
.mp-btn { background:#0f766e; color:#fff; border:0; border-radius: 6px; padding: 11px 16px; font: inherit; font-weight: 600; cursor:pointer; }
.mp-btn:disabled { background:#8fb5b0; cursor:not-allowed; }
@media (max-width: 480px) { .mp-wrap { padding: 24px 14px 48px; } }
`;
