import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthUser, clearAuthCookies } from "../util/cookie";

// Normalizes whatever casing the URL's :role param arrives in to the
// canonical role strings used across the app: "Admin", "Staff", "DeliveryBoy", "Buyer".
function normalizeRole(role) {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "Admin";
    case "buyer":
    case "customer":
      return "Buyer";
    case "deliveryboy":
      return "DeliveryBoy";
    case "staff":
      return "Staff";
    default:
      return "";
  }
}

// All user-collection roles (Admin / Staff / DeliveryBoy / Buyer) live at /api/user.
function apiPathForRole(role) {
  const normalizedRole = normalizeRole(role);
  switch (normalizedRole) {
    case "DeliveryBoy":
      // DeliveryBoy records are also in the User collection (registered via /api/user)
      return "user";
    case "Admin":
    case "Staff":
    case "Buyer":
    default:
      return "user";
  }
}

export default function ProfilePage() {
  const { role, _id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // FIX: this was referenced in four places below but never declared,
  // which is a ReferenceError that crashes this component on render.
  const normalizedRole = normalizeRole(role);

  useEffect(() => {
    if (!_id) return;

    setLoading(true);

    const api = apiPathForRole(role);

    (async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${api}/${_id}`,
          {
            credentials: "include", // sends the HTTP-only token cookie automatically
            headers: {
              authorization: getAuthUser().token || localStorage.getItem("token") || "", // explicit header for non-cookie flow
            },
          }
        );

        const json = await response.json();

        if (json.result === "Done") {
          setData(json.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [_id, role, navigate]);

  const isStaff = normalizedRole === "Staff";
  const isDeliveryBoy = normalizedRole === "DeliveryBoy";
  const isAdmin = normalizedRole === "Admin";
  // Keep isResturent as an alias for backward compat with any JSX below that still uses it
  const isResturent = isStaff;

  const name = data.name || "";
  const pic = data.pic || "";
  const phone = data.phone || "";
  const email = data.email || "";
  const createdAt = data.createdAt;
  const isActive = !!data.active;

  // ── Resturent-schema-specific derived values ─────────────────────────────
  // Mirrors the fields actually defined on ResturentSchema: ownerName,
  // isreservation, isOpen, status, reviews (rating is auto-computed from
  // reviews on the backend, so we just read it, not recompute it).
  const isReservationEnabled = !!data.isreservation;
  const isOpenNow = !!data.isOpen;
  const reviewCount = Array.isArray(data.reviews) ? data.reviews.length : 0;
  const ratingDisplay =
    data.rating != null
      ? `${data.rating} / 5${reviewCount ? ` (${reviewCount} review${reviewCount === 1 ? "" : "s"})` : " (no reviews yet)"}`
      : "—";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "—";

  // FIX: keys now match the real normalized role values instead of
  // display strings ("Resturent", "Delivery Boy", "User") that never
  // occurred anywhere else in the app, which meant this always fell
  // back to the default gray badge regardless of actual role.
  const roleBadgeColor =
    {
      resturent: "text-bg-primary",
      DeliveryBoy: "text-bg-warning",
      Admin: "text-bg-danger",
      "Super Admin": "text-bg-danger",
      Buyer: "text-bg-secondary",
    }[normalizedRole] || "text-bg-secondary";

  const roleDisplayName = isResturent
    ? "Restaurant"
    : isDeliveryBoy
      ? "Delivery Partner"
      : isAdmin
        ? normalizedRole // "Admin" or "Super Admin"
        : "Buyer";

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-badge" aria-hidden="true"></i>
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-1">My Profile</h1>
            <p className="text-muted mb-0">
              View your account details and role information.
            </p>
          </div>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/${role}/${_id}/update-profile`)}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i> Edit Profile
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* ── Left card ── */}
        <div className="col-12 col-xl-4">
          <div className="panel h-100 text-center profile-card">
            <div className="profile-cover">
              <img
                src="/images/png/dasher-ui-bootstrap-5.jpg"
                alt="cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {pic ? (
              <img
                className="avatar-img avatar-xl profile-photo"
                src={pic}
                alt={name}
              />
            ) : (
              <div
                className="avatar-img avatar-xl profile-photo d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{
                  background: "var(--bs-primary)",
                  color: "#fff",
                  userSelect: "none",
                }}
              >
                {initials}
              </div>
            )}

            <h2 className="h5 mt-3 mb-1">{name || "—"}</h2>
            <p className="text-muted mb-3">
              {isResturent && data.ownerName ? `Owned by ${data.ownerName}` : roleDisplayName}
            </p>

            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {normalizedRole && <span className={`badge ${roleBadgeColor}`}>{normalizedRole}</span>}
              <span className={`badge ${isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                <i className="bi bi-patch-check-fill me-1"></i>
                {isActive ? "Active" : "Inactive"}
              </span>
              {isResturent && (
                <span className={`badge ${isOpenNow ? "text-bg-success" : "text-bg-secondary"}`}>
                  <i className={`bi ${isOpenNow ? "bi-door-open-fill" : "bi-door-closed-fill"} me-1`}></i>
                  {isOpenNow ? "Open Now" : "Closed"}
                </span>
              )}
            </div>

            <div className="info-list mt-4 text-start">
              {email && (
                <div>
                  <span><i className="bi bi-envelope me-1"></i>Email</span>
                  <strong className="text-truncate" style={{ maxWidth: "180px" }}>
                    {email}
                  </strong>
                </div>
              )}
              {isResturent && data.ownerName && (
                <div>
                  <span><i className="bi bi-person-badge me-1"></i>Owner</span>
                  <strong>{data.ownerName}</strong>
                </div>
              )}
              {phone && (
                <div>
                  <span><i className="bi bi-telephone me-1"></i>Phone</span>
                  <strong>{phone}</strong>
                </div>
              )}
              {isResturent && (
                <div>
                  <span><i className="bi bi-star me-1"></i>Rating</span>
                  <strong>{data.rating != null ? `${data.rating} / 5` : "—"}</strong>
                </div>
              )}
              <div>
                <span><i className="bi bi-calendar3 me-1"></i>Joined</span>
                <strong>{joinedDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: account summary ── */}
        <div className="col-12 col-xl-8 d-flex flex-column gap-3">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-lines-fill" aria-hidden="true"></i>
                  <span>Account Overview</span>
                </h2>
                <p className="text-muted mb-0">
                  A summary of your profile and access level.
                </p>
              </div>
            </div>

            {isResturent ? (
              <div className="row g-3 mt-1">
                <InfoRow icon="bi-shop" label="Restaurant Name" value={data.name || "—"} />
                <InfoRow icon="bi-person-badge" label="Owner Name" value={data.ownerName || "—"} />
                <InfoRow icon="bi-envelope" label="Email" value={data.email || "—"} />
                <InfoRow icon="bi-telephone" label="Phone" value={data.phone || "—"} />
                <InfoRow icon="bi-star" label="Rating" value={ratingDisplay} />
                <InfoRow
                  icon={isOpenNow ? "bi-door-open" : "bi-door-closed"}
                  label="Currently"
                  value={isOpenNow ? "Open" : "Closed"}
                />
                <InfoRow icon="bi-clock" label="Opens At" value={data.openTime || "—"} />
                <InfoRow icon="bi-clock-history" label="Closes At" value={data.closeTime || "—"} />
                <InfoRow
                  icon="bi-toggle-on"
                  label="Reservations"
                  value={isReservationEnabled ? "Enabled" : "Disabled"}
                />

                {/* Reservation pricing/capacity only makes sense while
                    reservations are actually turned on for this restaurant. */}
                {isReservationEnabled && (
                  <>
                    <InfoRow icon="bi-people" label="Seats Available" value={data.seatAvailable ?? "—"} />
                    <InfoRow
                      icon="bi-tag"
                      label="Reservation Price"
                      value={data.reservationPrice != null ? `₹${data.reservationPrice}` : "—"}
                    />
                    <InfoRow
                      icon="bi-percent"
                      label="Discount"
                      value={data.discount != null ? `${data.discount}%` : "—"}
                    />
                    <InfoRow
                      icon="bi-cash-coin"
                      label="Final Price"
                      value={data.finalPrice != null ? `₹${data.finalPrice}` : "—"}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="row g-3 mt-1">
                <InfoRow icon="bi-person" label="Full Name" value={data.name || "—"} />
                <InfoRow icon="bi-envelope" label="Email" value={data.email || "—"} />
                <InfoRow icon="bi-telephone" label="Phone" value={data.phone || "—"} />
                <InfoRow icon="bi-shield-check" label="Role" value={normalizedRole || "—"} />
                <InfoRow icon="bi-toggle-on" label="Status" value={isActive ? "Active" : "Inactive"} />
                {(data.openTime || data.closeTime) && (
                  <>
                    <InfoRow icon="bi-clock" label="Opens At" value={data.openTime || "—"} />
                    <InfoRow icon="bi-clock-history" label="Closes At" value={data.closeTime || "—"} />
                  </>
                )}
                {data.isreservation !== undefined && (
                  <InfoRow
                    icon="bi-toggle-on"
                    label="Reservations"
                    value={isReservationEnabled ? "Enabled" : "Disabled"}
                  />
                )}
                {isReservationEnabled && (
                  <>
                    <InfoRow icon="bi-people" label="Seats Available" value={data.seatAvailable ?? "—"} />
                    <InfoRow
                      icon="bi-tag"
                      label="Reservation Price"
                      value={data.reservationPrice != null ? `₹${data.reservationPrice}` : "—"}
                    />
                    <InfoRow
                      icon="bi-percent"
                      label="Discount"
                      value={data.discount != null ? `${data.discount}%` : "—"}
                    />
                    <InfoRow
                      icon="bi-cash-coin"
                      label="Final Price"
                      value={data.finalPrice != null ? `₹${data.finalPrice}` : "—"}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {isDeliveryBoy && data.permanentLocation?.address && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-geo-alt" aria-hidden="true"></i>
                    <span>Base Location</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Where you're registered as operating from.
                  </p>
                </div>
              </div>
              <div className="row g-3 mt-1">
                <InfoRow icon="bi-house" label="Address" value={data.permanentLocation.address} />
                <InfoRow icon="bi-buildings" label="City" value={data.permanentLocation.city || "—"} />
                <InfoRow icon="bi-map" label="State" value={data.permanentLocation.state || "—"} />
                <InfoRow icon="bi-mailbox" label="PIN" value={data.permanentLocation.pin || "—"} />
              </div>
            </div>
          )}

          {isResturent && data.permanentLocation?.address && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-geo-alt" aria-hidden="true"></i>
                    <span>Location Details</span>
                  </h2>
                </div>
              </div>
              <div className="row g-3 mt-1">
                <InfoRow icon="bi-house" label="Address" value={data.permanentLocation.address} />
                <InfoRow icon="bi-buildings" label="City" value={data.permanentLocation.city || "—"} />
                <InfoRow icon="bi-map" label="State" value={data.permanentLocation.state || "—"} />
                <InfoRow icon="bi-mailbox" label="PIN" value={data.permanentLocation.pin || "—"} />
              </div>
            </div>
          )}

          {isResturent && reviewCount > 0 && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-chat-square-text" aria-hidden="true"></i>
                    <span>Recent Reviews</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Latest feedback from customers ({reviewCount} total).
                  </p>
                </div>
              </div>
              <div className="d-flex flex-column gap-2 mt-2">
                {data.reviews
                  .slice()
                  .reverse()
                  .slice(0, 3)
                  .map((review, i) => (
                    <div
                      key={review._id || i}
                      className="d-flex align-items-start gap-2 pb-2"
                      style={{ borderBottom: i < 2 ? "1px solid var(--bs-border-color, #eee)" : "none" }}
                    >
                      <span className="badge text-bg-warning flex-shrink-0">
                        <i className="bi bi-star-fill me-1"></i>
                        {review.rating}
                      </span>
                      <div>
                        <div className="fw-semibold small">{review.name || "Anonymous"}</div>
                        <div className="text-muted small">{review.comment}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-lightning" aria-hidden="true"></i>
                  <span>Quick Actions</span>
                </h2>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(`/forgot-password`)}
              >
                <i className="bi bi-pencil me-1"></i>Forget Password
              </button>
              {!isResturent && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/forgot-password")}
                >
                  <i className="bi bi-key me-1"></i>Change Password
                </button>
              )}
              <button
                className="btn btn-outline-danger"
                onClick={async () => {
                  try {
                    await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/logout`, {
                      method: "POST",
                      credentials: "include",
                    });
                  } catch (e) {
                    console.error("Logout error:", e);
                  }
                  clearAuthCookies();
                  navigate("/login");
                }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="col-12 col-sm-6">
      <div className="d-flex align-items-start gap-2">
        <span
          className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "var(--bs-primary-bg-subtle, rgba(var(--bs-primary-rgb),.1))",
            color: "var(--bs-primary)",
          }}
        >
          <i className={`bi ${icon}`} aria-hidden="true"></i>
        </span>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}