import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthCookies, clearAuthCookies } from "../util/cookie";

const THEME_KEY = "adminHMD.colorTheme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

// Admin and staff use User; delivery partners use the dedicated DeliveryBoy route.
const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Admin",
    icon: "bi-shield-lock",
    apiPath: "user"
  },
  {
    value: "deliveryBoy",
    label: "Delivery Boy",
    icon: "bi-bicycle",
    // Delivery Boy accounts authenticate against the dedicated DeliveryBoy route.
    apiPath: "deliveryBoy",
  },
  {
    value: "staff",
    label: "Staff Member",
    icon: "bi-person-workspace",
    apiPath: "user",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [data, setData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(getPreferredTheme());
    document.body.classList.add("auth-body");
    return () => document.body.classList.remove("auth-body");
  }, []);

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light",
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function handleThemeToggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  function getInputData(e) {
    const { name, value } = e.target;
    setError("");
    setData((old) => ({ ...old, [name]: value }));
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);

    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/login`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        },
      );
      response = await response.json();

      if (response.result === "Done" && response.data.active === false) {
        setError("Your account is inactive. Please contact support.");
      } else if (response.result === "Done") {
        if (
          selectedRole.apiPath === "user" ||
          selectedRole.apiPath === "deliveryBoy"
        ) {
          const normalizedRole = String(response.data.role || "").toLowerCase();
          const isDeliveryBoy = selectedRole.value === "deliveryBoy";
          const isAuthorized = isDeliveryBoy
            ? normalizedRole === "deliveryboy"
            : ["admin", "staff", "deliveryboy"].includes(normalizedRole);

          if (isAuthorized) {
            const authenticatedData = { ...response.data, role: normalizedRole };
            // Store auth in cookies (HTTP and client-readable) & localStorage
            setAuthCookies(authenticatedData, response.token);
            localStorage.setItem("login", true);
            localStorage.setItem("name", authenticatedData.name);
            localStorage.setItem("userid", authenticatedData._id);
            localStorage.setItem("role", normalizedRole);
            localStorage.setItem("token", response.token);

            if (isDeliveryBoy) {
              navigate(`/deliveryBoy/${authenticatedData._id}/dashboard`);
              return;
            }

            const incomplete = [
              "address",
              "state",
              "pin",
              "phone",
              "name",
              "city",
            ].some((f) => !response.data[f]);

            navigate(
              incomplete
                ? `/${response.data.role.toLowerCase()}/${response.data._id}/profile`
                : "/",
            );
          } else {
            setError("You are not authorized to access this panel.");
            clearAuthCookies();
            localStorage.setItem("login", false);
          }
        } else {
          // Restaurant login
          setAuthCookies({ ...response.data, role: selectedRole.value }, response.token);
          localStorage.setItem("login", true);
          localStorage.setItem("name", response.data.name);
          localStorage.setItem("userid", response.data._id);
          localStorage.setItem("role", selectedRole.value);
          localStorage.setItem("token", response.token);
          navigate("/");
        }
      } else {
        setError("Invalid email address or password.");
      }
    } catch {
      alert("Internal Server Error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
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
        <section className="auth-card">
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
              <small>Sign in to your staff, delivery & admin workspace.</small>
            </span>
          </Link>

          {/* Form */}
          <form
            className={`needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <p className="eyebrow mb-1">Secure Portal Access</p>
              <h1 className="h3 mb-1">Sign In</h1>
              <p className="text-muted mb-0">
                Welcome back! Please enter your credentials.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="role-select-section">
              <div className="role-select-header">
                <label className="form-label mb-0 fw-semibold">I am signing in as</label>
                <span className="role-select-badge">
                  {role === "user" ? "Administrator" : role === "deliveryBoy" ? "Delivery Boy" : "Staff Member"}
                </span>
              </div>
              <div
                className="role-select-grid"
                role="radiogroup"
                aria-label="Account type"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <div key={opt.value} className="position-relative">
                    <input
                      type="radio"
                      className="btn-check"
                      name="loginRole"
                      id={`login-role-${opt.value}`}
                      autoComplete="off"
                      checked={role === opt.value}
                      onChange={() => handleRoleChange(opt.value)}
                    />
                    <label
                      className="role-card-label w-100"
                      htmlFor={`login-role-${opt.value}`}
                    >
                      <span className="role-card-check">
                        <i className="bi bi-check-lg" aria-hidden="true"></i>
                      </span>
                      <span className="role-card-icon">
                        <i
                          className={`bi ${opt.icon}`}
                          aria-hidden="true"
                        ></i>
                      </span>
                      <span className="role-card-title">{opt.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Address */}
            <div className="mb-3">
              <label className="form-label" htmlFor="loginEmail">
                Email Address
              </label>
              <input
                className="form-control"
                id="loginEmail"
                name="email"
                type="email"
                value={data.email}
                onChange={getInputData}
                placeholder={
                  role === "staff"
                    ? "staff@tastorafood.com"
                    : role === "deliveryBoy"
                      ? "delivery@tastorafood.com"
                      : "admin@tastorafood.com"
                }
                required
              />
              <div className="invalid-feedback">
                Please enter a valid email address.
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label" htmlFor="loginPassword">
                  Password
                </label>
                <Link className="small fw-semibold" to="/forgot-password">
                  Forgot?
                </Link>
              </div>
              <div className="position-relative">
                <input
                  className="form-control pe-5"
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={6}
                  value={data.password}
                  onChange={getInputData}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i
                    className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                    aria-hidden="true"
                  />
                </button>
                <div className="invalid-feedback">
                  Password must be at least 6 characters.
                </div>
              </div>
            </div>

            {/* Remember me */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />{" "}
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </section>
      </main>
    </>
  );
}
