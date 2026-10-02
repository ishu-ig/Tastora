import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getAuthUser, clearAuthCookies } from "../util/cookie";

// Which API paths to try, in order, for a given role (same mapping as Navbar.jsx).
//   restaurant   -> /api/resturent
//   delivery boy -> /api/deliveryBoy (DeliveryBoy collection), then /api/user
//   admin/staff  -> /api/user
function apiPathsForRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "deliveryboy") return ["deliveryBoy", "user"];
  return ["user"];
}

export default function Sidebar({ onLinkClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [openGroups, setOpenGroups] = useState({});

  const auth = getAuthUser();
  const rawRole = auth.role;
  const userId = auth.userId;
  const token = auth.token;

  const role = (rawRole || "").toLowerCase();

  const adminLinks = [
    { to: "/", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/banner", icon: "bi-images", label: "Banners" },
    {
      label: "Products",
      icon: "bi-box-seam",
      children: [
        { to: "/maincategory", icon: "bi-grid-3x3-gap", label: "Main Categories" },
        { to: "/subcategory", icon: "bi-diagram-3", label: "Sub Categories" },
        { to: "/product", icon: "bi-box-seam", label: "Products" },
        { to: "/combo", icon: "bi-collection", label: "Combos" },
        { to: "/thali", icon: "bi-collection", label: "Thali" },
      ],
    },
    {
      label: "Memberships",
      icon: "bi-award",
      children: [
        { to: "/membershipplan", icon: "bi-collection", label: "Plans" },
        { to: "/membership", icon: "bi-collection", label: "Members" },
      ],
    },
    { to: "/checkout", icon: "bi-cart-check", label: "Orders" },
    { to: "/booking", icon: "bi-calendar-check", label: "Bookings" },
    { to: "/coupon", icon: "bi-ticket-perforated", label: "Coupons" },
    {
      label: "People",
      icon: "bi-people",
      children: [
        { to: "/user", icon: "bi-people", label: "Users" },
        { to: "/deliveryBoy", icon: "bi-people", label: "Delivery Boy" },
      ],
    },
    { to: "/testimonial", icon: "bi-chat-square-quote", label: "Testimonials" },
    { to: "/newsletter", icon: "bi-envelope-paper", label: "Newsletter" },
    { to: "/contactUs", icon: "bi-headset", label: "Contact Queries" },
  ];

  const navLinksByRole = {
    admin: adminLinks,
    "super admin": adminLinks,
    staff: adminLinks,

    deliveryboy: [
      { to: `/deliveryBoy/${userId}/dashboard`, icon: "bi-speedometer2", label: "Dashboard" },
      { to: `/deliveryBoy/${userId}/orders`, icon: "bi-bag-check", label: "Assigned Orders" },
      { to: `/deliveryBoy/${userId}/history`, icon: "bi-clock-history", label: "Order History" },
      // Was /resturent/setting, which is the restaurant's page. Delivery boys
      // use their own profile page (same path the Navbar's Profile link uses).
      { to: `/deliveryBoy/${userId}/profile`, icon: "bi-person-circle", label: "Account Setting" },
    ],
  };

  const navLinks = navLinksByRole[role] || [];

  useEffect(() => {
    (async () => {
      if (!rawRole || !userId) {
        navigate("/login");
        return;
      }

      const paths = apiPathsForRole(rawRole);
      let sessionRejected = false;

      for (const apiPath of paths) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_SERVER}/api/${apiPath}/${userId}`,
            {
              credentials: "include",
              headers: { Authorization: token || "" },
            }
          );

          // 401/403 means the session itself is not valid
          if (response.status === 401 || response.status === 403) {
            sessionRejected = true;
            continue;
          }

          const result = await response.json();
          if (response.ok && result.data) {
            setData(result.data);
            return;
          }
          // 404 / empty data: try the next path
        } catch (error) {
          console.error(`Sidebar profile fetch error (${apiPath}):`, error);
        }
      }

      // Only sign out when the server rejected the session. A missing profile
      // record should not bounce a signed-in user back to login.
      if (sessionRejected) {
        clearAuthCookies();
        navigate("/login");
      }
    })();
  }, [navigate, rawRole, userId, token]);

  const name = data?.name || auth.name || "Admin";

  // ---- Group helpers ----
  const isActivePath = (to) =>
    to === "/"
      ? location.pathname === "/"
      : location.pathname === to || location.pathname.startsWith(to + "/");

  const isGroupActive = (g) => g.children.some((c) => isActivePath(c.to));
  // Open if the user toggled it manually, otherwise open when a child page is active.
  const isOpen = (g) => openGroups[g.label] ?? isGroupActive(g);
  const toggleGroup = (g) =>
    setOpenGroups((prev) => ({ ...prev, [g.label]: !isOpen(g) }));

  const handleLinkClick = () => {
    if (!window.matchMedia("(min-width: 992px)").matches) {
      onLinkClick?.();
    }
  };

  const renderLink = ({ to, icon, label }, isChild = false) => (
    <NavLink
      key={to + label}
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `nav-link${isChild ? " nav-sub-link" : ""}${isActive ? " active" : ""}`
      }
      onClick={handleLinkClick}
    >
      <span className="nav-icon">
        <i className={`bi ${icon}`} aria-hidden="true"></i>
      </span>
      <span className="nav-text">{label}</span>
    </NavLink>
  );

  return (
    <aside className="admin-sidebar" id="adminSidebar" aria-label="Main navigation">
      <div className="sidebar-header">
        <NavLink className="brand-mark" to="/" aria-label="Dashboard">
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
          <span className="brand-copy">
            <span
              className="brand-title"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              TAST<span style={{ color: "#E11D48" }}>ORA</span>
            </span>
            <span
              className="brand-subtitle"
              style={{
                fontSize: "0.72rem",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              Admin Portal
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((item) =>
          item.children ? (
            <div key={item.label} className="nav-group">
              <button
                type="button"
                className={`nav-link nav-group-toggle${isGroupActive(item) ? " active" : ""}`}
                onClick={() => toggleGroup(item)}
                aria-expanded={isOpen(item)}
                style={{ width: "100%", background: "none", border: 0, textAlign: "left" }}
              >
                <span className="nav-icon">
                  <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                </span>
                <span className="nav-text">{item.label}</span>
                <i
                  className={`bi bi-chevron-${isOpen(item) ? "up" : "down"} ms-auto`}
                  style={{ fontSize: "0.7rem" }}
                  aria-hidden="true"
                ></i>
              </button>
              {isOpen(item) && (
                <div className="nav-sub" style={{ paddingLeft: "1rem" }}>
                  {item.children.map((child) => renderLink(child, true))}
                </div>
              )}
            </div>
          ) : (
            renderLink(item)
          )
        )}
      </nav>

      {/* <div className="sidebar-user">
        <img
          className="avatar-img avatar-md sidebar-user-avatar"
          src={data?.pic ? `${data.pic}` : "https://i.pravatar.cc/100"}
          alt={name}
        />
        <strong>{name}</strong>
        <small>Active Workspace</small>
      </div>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        <span className="sidebar-footer-text">System running smoothly</span>
      </div> */}
    </aside>
  );
}