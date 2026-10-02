import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const THEME_KEY = "adminHMD.colorTheme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

// The two roles this app supports at signup.
//
// NOTE: `value` is the internal UI role used for conditional logic in this
// component. `dbRole` is the literal string sent to the backend in the
// payload's `role` field.
//
// Staff accounts use User; delivery partners use the dedicated DeliveryBoy model.
const ROLE_OPTIONS = [
  {
    value: "staff",
    label: "Staff Member",
    icon: "bi-person-workspace",
    apiPath: "user",
    // Must match ALLOWED_ROLES in UserController.js exactly (capital S)
    dbRole: "staff",
  },
  {
    value: "deliveryBoy",
    label: "Delivery Partner",
    icon: "bi-bicycle",
    apiPath: "deliveryBoy",
    dbRole: "DeliveryBoy",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");

  // "idle" | "checking" | "available" | "taken" | "error"
  const [emailStatus, setEmailStatus] = useState("idle");
  const emailTimer = useRef(null);

  // "idle" | "checking" | "available" | "taken" | "error"
  const [phoneStatus, setPhoneStatus] = useState("idle");
  const phoneTimer = useRef(null);

  // ── Theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    applyTheme(getPreferredTheme());
    document.body.classList.add("auth-body");
    return () => document.body.classList.remove("auth-body");
  }, []);

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function handleThemeToggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  // ── Phone availability check (debounced 600 ms) ───────────────────────────
  function handlePhoneChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(raw);
    setError("");
    setPhoneStatus("idle");

    clearTimeout(phoneTimer.current);
    if (raw.length !== 10) return;

    setPhoneStatus("checking");
    phoneTimer.current = setTimeout(async () => {
      try {
        const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);
        const phoneField = selectedRole.value === "deliveryBoy" ? "phone" : "phoneNo";
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/check-phone?${phoneField}=${encodeURIComponent(raw)}&role=${encodeURIComponent(selectedRole.dbRole)}`
        );
        const data = await res.json();
        // Expects: { available: true } or { available: false }
        setPhoneStatus(data.available ? "available" : "taken");
      } catch {
        setPhoneStatus("error");
      }
    }, 600);
  }

  // ── Email availability check (debounced 600 ms) ───────────────────────────
  // Email is unique across both User records on the backend, so hitting the
  // user check-email endpoint is sufficient for all roles.
  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);
    setError("");
    setEmailStatus("idle");

    clearTimeout(emailTimer.current);
    if (!EMAIL_RE.test(value)) return;

    setEmailStatus("checking");
    emailTimer.current = setTimeout(async () => {
      try {
        const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/check-email?email=${encodeURIComponent(value)}&role=${encodeURIComponent(selectedRole.dbRole)}`
        );
        const data = await res.json();
        // Expects: { available: true } or { available: false }
        setEmailStatus(data.available ? "available" : "taken");
      } catch {
        setEmailStatus("error");
      }
    }, 600);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (emailStatus === "taken") {
      setError("An account with this email address already exists.");
      return;
    }
    if (emailStatus === "checking") {
      setError("Please wait while we check email availability.");
      return;
    }

    if (phoneStatus === "taken") {
      setError("An account with this phone number already exists.");
      return;
    }
    if (phoneStatus === "checking") {
      setError("Please wait while we check phone number availability.");
      return;
    }

    const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);

    const phoneField = selectedRole.value === "deliveryBoy" ? "phone" : "phoneNo";
    const payload = { name, email, [phoneField]: phone, password, role: selectedRole.dbRole, active: true };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const response = await res.json();
      if (response.result === "Done") {
        navigate("/login");
      } else {
        setError(
          response.reason?.email ||
          response.reason?.phone ||
          response.message ||
          "Registration failed."
        );
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    }
  }

  // ── Email feedback helpers ────────────────────────────────────────────────
  const emailFeedback = {
    idle: null,
    checking: { cls: "text-muted", icon: "bi-arrow-repeat spin", msg: "Checking availability…" },
    // available: { cls: "text-success", icon: "bi-check-circle-fill", msg: "Email is available!" },
    // taken:     { cls: "text-danger",  icon: "bi-x-circle-fill",     msg: "An account with this email already exists." },
    error: { cls: "text-warning", icon: "bi-exclamation-circle", msg: "Could not verify. Try again." },
  }[emailStatus];

  const emailInputClass = [
    "form-control",
    validated && !email ? "is-invalid" : "",
    emailStatus === "taken" ? "is-invalid" : "",
    emailStatus === "available" ? "is-valid" : "",
  ].filter(Boolean).join(" ");

  // ── Phone feedback helpers ────────────────────────────────────────────────
  const phoneFeedback = {
    idle: null,
    checking: { cls: "text-muted", icon: "bi-arrow-repeat spin", msg: "Checking availability…" },
    error: { cls: "text-warning", icon: "bi-exclamation-circle", msg: "Could not verify. Try again." },
  }[phoneStatus];

  const phoneInputClass = [
    "form-control",
    validated && phone.length !== 10 ? "is-invalid" : "",
    phoneStatus === "taken" ? "is-invalid" : "",
    phoneStatus === "available" ? "is-valid" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`.spin { animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Floating theme toggle */}
      <button
        className="icon-button theme-toggle auth-theme-toggle"
        type="button"
        onClick={handleThemeToggle}
        aria-label="Switch color theme"
        title="Switch color theme"
      >
        <i
          className={theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"}
          aria-hidden="true"
        />
      </button>

      <main className="auth-page">
        {/* auth-card--wide gives this form (many more fields than login)
            extra breathing room, which the two-column field grid below
            actually puts to use instead of leaving empty space. */}
        <section className="auth-card auth-card--wide">

          {/* Brand */}
          <Link className="auth-brand" to="/">
            <span
              className="brand-icon"
              style={{
                background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
                boxShadow: "0 4px 14px rgba(225,29,72,0.35)",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
              }}
            >
              <img
                src="/images/brand/logo/tastora-logo.png"
                alt="Tastora"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </span>
            <span>
              <strong style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
                TAST<span style={{ color: "#E11D48" }}>ORA</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-muted)", marginLeft: "6px" }}>Admin</span>
              </strong>
              <small>Register your staff member or partner account.</small>
            </span>
          </Link>

          {/* Form */}
          <form
            className={`needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <p className="eyebrow mb-1">Join the Network</p>
              <h1 className="h3 mb-1">Create Account</h1>
              <p className="text-muted mb-0">Get started with your Tastora management portal.</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="role-select-section">
              <div className="role-select-header">
                <label className="form-label mb-0 fw-semibold">I am signing up as</label>
                <span className="role-select-badge">
                  {ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role}
                </span>
              </div>
              <div className="role-select-grid role-select-grid-2" role="radiogroup" aria-label="Account type">
                {ROLE_OPTIONS.map((opt) => (
                  <div key={opt.value} className="position-relative">
                    <input
                      type="radio"
                      className="btn-check"
                      name="role"
                      id={`role-${opt.value}`}
                      autoComplete="off"
                      checked={role === opt.value}
                      onChange={() => {
                        setRole(opt.value);
                        setPhoneStatus("idle");
                        setEmailStatus("idle");
                      }}
                    />
                    <label className="role-card-label w-100" htmlFor={`role-${opt.value}`}>
                      <span className="role-card-check">
                        <i className="bi bi-check-lg" aria-hidden="true"></i>
                      </span>
                      <span className="role-card-icon">
                        <i className={`bi ${opt.icon}`} aria-hidden="true"></i>
                      </span>
                      <span className="role-card-title">{opt.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {role === "staff" && (
                <div className="form-text mt-2 text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Register as a staff member for Tastora kitchen, menu & order operations.
                </div>
              )}
            </div>

            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerName">
                Full name
              </label>
              <input
                className="form-control"
                id="registerName"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                required
              />
              <div className="invalid-feedback">Please enter your full name.</div>
            </div>

            {/* Email + Phone — two columns on wider viewports */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerEmail">Email address</label>
                <input
                  className={emailInputClass}
                  id="registerEmail"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  required
                />
                <div className="invalid-feedback">
                  {emailStatus === "taken"
                    ? "An account with this email already exists."
                    : "Enter a valid email."}
                </div>
                {emailStatus === "available" && (
                  <div className="valid-feedback">Email is available!</div>
                )}
                {/* Live status badge (below the input) */}
                {emailFeedback && (
                  <div className={`d-flex align-items-center gap-1 mt-1 small ${emailFeedback.cls}`}>
                    <i className={`bi ${emailFeedback.icon}`}></i>
                    {emailFeedback.msg}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="registerPhone">Phone number</label>
                <input
                  className={phoneInputClass}
                  id="registerPhone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit mobile number"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                />
                <div className="invalid-feedback">
                  {phoneStatus === "taken"
                    ? "An account with this phone number already exists."
                    : "Enter a valid 10-digit phone number."}
                </div>
                {phoneStatus === "available" && (
                  <div className="valid-feedback">Phone number is available!</div>
                )}
                {/* Live status badge (below the input) */}
                {phoneFeedback && (
                  <div className={`d-flex align-items-center gap-1 mt-1 small ${phoneFeedback.cls}`}>
                    <i className={`bi ${phoneFeedback.icon}`}></i>
                    {phoneFeedback.msg}
                  </div>
                )}
              </div>
            </div>

            {/* Password + Confirm Password — two columns on wider viewports */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerPassword">Password</label>
                <input
                  className="form-control"
                  id="registerPassword"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Min. 8 characters"
                  required
                />
                <div className="invalid-feedback">Min 8 chars, include uppercase, lowercase and a number.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="registerConfirmPassword">Confirm Password</label>
                <input
                  className={`form-control${validated && confirmPassword && password !== confirmPassword ? " is-invalid" : ""}`}
                  id="registerConfirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Repeat your password"
                  required
                />
                <div className="invalid-feedback">Passwords do not match.</div>
              </div>
            </div>

            {/* Terms */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                required
              />
              <label className="form-check-label" htmlFor="terms">
                I agree to the terms
              </label>
              <div className="invalid-feedback">You must agree before continuing.</div>
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={
                emailStatus === "checking" ||
                emailStatus === "taken" ||
                phoneStatus === "checking" ||
                phoneStatus === "taken"
              }
            >
              <i className="bi bi-person-plus" aria-hidden="true"></i> Create Account
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>

        </section>
      </main>
    </>
  );
}