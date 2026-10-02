import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser, clearAuthCookies } from "../util/cookie";

const notifications = [
  { to: "/users", title: "New user registered", time: "4 minutes ago" },
  { to: "/charts", title: "Revenue target reached", time: "32 minutes ago" },
  { to: "/settings", title: "Security review completed", time: "1 hour ago" },
];

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

// Which API paths to try, in order, for a given role.
//   restaurant   -> /api/resturent
//   delivery boy -> /api/deliveryBoy (DeliveryBoy collection), then /api/user
//                   (delivery accounts created through signup live in User)
//   admin/staff  -> /api/user
function apiPathsForRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "deliveryboy") return ["deliveryBoy", "user"];
  return ["user"];
}

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const auth = getAuthUser();

  useEffect(() => {
    (async () => {
      const { role, userId, token } = getAuthUser();

      if (!role || !userId) {
        navigate("/login");
        return;
      }

      const paths = apiPathsForRole(role);
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
          if (response.ok && result.result === "Done" && result.data) {
            setData(result.data);
            return;
          }
          // 404 / empty data: try the next path
        } catch (error) {
          console.error(`Navbar profile fetch error (${apiPath}):`, error);
        }
      }

      // Only sign the user out when the server rejected the session.
      // A missing profile record should not bounce a signed-in user to login;
      // the navbar falls back to the name saved at login.
      if (sessionRejected) {
        clearAuthCookies();
        navigate("/login");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  function handleThemeToggle() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  }

  async function logout() {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout API call error:", e);
    }
    clearAuthCookies();
    localStorage.removeItem("login");
    navigate("/login");
  }

  return (
    <nav className="navbar admin-navbar navbar-expand bg-white">
      <div className="container-fluid px-3 px-lg-4">

        <button
          className="sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-controls="adminSidebar"
          aria-label="Toggle sidebar"
        >
          <span /><span /><span />
        </button>

        <form className="d-none d-md-flex ms-3 flex-grow-1" role="search">
          <input
            className="form-control search-input"
            type="search"
            placeholder="Search users, orders, reports"
            aria-label="Search"
          />
        </form>

        <div className="navbar-actions ms-auto">

          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={handleThemeToggle}
            aria-label="Switch color theme"
            title="Switch color theme"
          >
            <ThemeIcon />
          </button>

          <div className="dropdown">
            <button
              className="icon-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
            >
              <span className="notification-dot"></span>
              <i className="bi bi-bell" aria-hidden="true"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu">
              <div className="dropdown-header fw-bold text-body">Notifications</div>
              {notifications.map(({ to, title, time }) => (
                <Link key={title} className="dropdown-item" to={to}>
                  <span className="notification-title">{title}</span>
                  <span className="notification-time">{time}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="dropdown">
            <button
              className="profile-button dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                className="avatar-img avatar-sm"
                src={data?.pic ? `${data.pic}` : "https://i.pravatar.cc/100"}
                alt="Profile"
              />
              <span className="profile-name d-none d-sm-inline">
                {data?.name || auth.name || "Admin"}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to={`/${auth.role}/${auth.userId}/profile`}>
                  Profile
                </Link>
              </li>
              <li><Link className="dropdown-item" to="/settings">Account settings</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger w-100 text-start border-0 bg-transparent"
                  onClick={logout}
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </nav>
  );
}

function ThemeIcon() {
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <i
      className={theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"}
      aria-hidden="true"
    />
  );
}