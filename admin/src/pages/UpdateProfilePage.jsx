import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthUser, setAuthCookies } from "../util/cookie";

// Maps the role to the actual API collection it lives in:
// "resturent" / "restaurant" -> /api/resturent
// All other roles ("admin", "staff", "deliveryBoy", "buyer") -> /api/user
function apiPathForRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "resturent" || r === "restaurant") {
    return "resturent";
  }
  return "user";
}

export default function UpdateProfilePage() {
  const navigate = useNavigate();
  const { role: paramRole, _id: paramId } = useParams();

  const auth = getAuthUser();
  const rawRole = paramRole || auth.role || localStorage.getItem("role") || "";
  const role = rawRole.toLowerCase();
  const userId = paramId || auth.userId || localStorage.getItem("userid") || "";
  const api = apiPathForRole(rawRole);

  // ── Data state ────────────────────────────────────────────────────────────
  const [data, setData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    pic: "",

    seatAvailable: "",
    reservationPrice: "",
    discount: "",
    finalPrice: "",
    isreservation: true,

    openTime: "",
    closeTime: "",
    active: true,

    address: "",
    city: "",
    state: "",
    pin: "",
    lat: "",
    lng: "",
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picFile, setPicFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fileRef = useRef();

  // ── Derived ───────────────────────────────────────────────────────────────
  const initials =
    (data.name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  // ── Load profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if (!userId) {
          navigate("/login");
          return;
        }

        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${api}/${userId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "content-type": "application/json",
              authorization: auth.token || localStorage.getItem("token") || "",
            },
          },
        );
        response = await response.json();
        if (response.result === "Done" && response.data) {
          setData({
            name: response.data.name || "",
            ownerName: response.data.ownerName || "",
            email: response.data.email || "",
            phone: response.data.phone || (response.data.phoneNo != null ? String(response.data.phoneNo) : ""),
            pic: response.data.pic || "",

            seatAvailable: response.data.seatAvailable ?? "",
            reservationPrice: response.data.reservationPrice ?? "",
            discount: response.data.discount ?? "",
            finalPrice: response.data.finalPrice ?? "",
            isreservation:
              response.data.isreservation === undefined
                ? true
                : Boolean(response.data.isreservation),

            openTime: response.data.openTime || "",
            closeTime: response.data.closeTime || "",
            active: response.data.active === undefined ? true : Boolean(response.data.active),

            address: response.data.permanentLocation?.address || "",
            city: response.data.permanentLocation?.city || "",
            state: response.data.permanentLocation?.state || "",
            pin: response.data.permanentLocation?.pin || "",
            lat: response.data.permanentLocation?.lat ?? "",
            lng: response.data.permanentLocation?.lng ?? "",
          });
          if (response.data.pic) setPreviewUrl(response.data.pic);
        }
      } catch {
        setError("Internal Server Error. Could not load profile.");
      }
    })();
  }, [api, role, userId, navigate, auth.token]);

  // ── Generic field handler ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setData((old) => ({
      ...old,
      [name]: name === "active" ? (value === "1") : value,
    }));
  }
  const getInputData = handleChange;

  // ── Reservation toggle ────────────────────────────────────────────────────
  function toggleReservationField() {
    setData((old) => ({ ...old, isreservation: !old.isreservation }));
  }

  // ── Auto-calculate finalPrice whenever basePrice or discount change ────────
  useEffect(() => {
    if (!data.isreservation) return; // no reservation pricing to calculate when disabled

    const bp = parseInt(data.reservationPrice, 10);
    const d = parseInt(data.discount, 10);

    if (Number.isNaN(bp)) {
      setData((old) => (old.finalPrice === "" ? old : { ...old, finalPrice: "" }));
      return;
    }

    const discountPct = Number.isNaN(d) ? 0 : d;
    const fp = parseInt(bp - (bp * discountPct) / 100, 10);

    setData((old) => (old.finalPrice === fp ? old : { ...old, finalPrice: fp }));
  }, [data.reservationPrice, data.discount, data.isreservation]);

  // ── Reverse geocode via Geoapify ───────────────────────────────────────────
  const GEOAPIFY_API_KEY = "e04b543b846f4fb187b19c00fe5a29af";
  async function getLocation() {
    setError("");
    setSuccess("");

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`,
          );
          const result = await response.json();

          if (result.features?.length > 0) {
            const place = result.features[0].properties;
            setData((prev) => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              address: place.address_line1 || "",
              city: place.city || place.town || place.village || "",
              state: place.state || "",
              pin: place.postcode || "",
            }));
          } else {
            setError("Could not determine an address from your location.");
          }
        } catch {
          setError("Failed to fetch address from location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Location permission denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // ── Avatar pick ───────────────────────────────────────────────────────────
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function postData(e) {
    e.preventDefault();
    setValidated(true);
    setError("");
    setSuccess("");

    if (!e.target.checkValidity()) return;

    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      if (data.ownerName) {
        formData.append("ownerName", data.ownerName);
      }

      formData.append("isreservation", data.isreservation);
      if (data.isreservation) {
        formData.append("seatAvailable", data.seatAvailable || 0);
        formData.append("reservationPrice", data.reservationPrice || 0);
        formData.append("discount", data.discount || 0);
        const calculatedFinal = data.reservationPrice
          ? Math.round(data.reservationPrice - (data.reservationPrice * (data.discount || 0)) / 100)
          : 0;
        formData.append("finalPrice", calculatedFinal);
      }

      formData.append("openTime", data.openTime || "");
      formData.append("closeTime", data.closeTime || "");
      formData.append("active", data.active ? "1" : "0");

      formData.append(
        "permanentLocation",
        JSON.stringify({
          lat: data.lat,
          lng: data.lng,
          address: data.address,
          city: data.city,
          state: data.state,
          pin: data.pin,
        }),
      );

      if (picFile) {
        formData.append("pic", picFile);
      }

      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${api}/${userId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            authorization: auth.token || localStorage.getItem("token") || "",
          },
          body: formData,
        },
      );

      response = await response.json();

      if (response.result === "Done") {
        setAuthCookies(response.data, auth.token);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);
        if (response.data.phone || response.data.phoneNo) {
          localStorage.setItem("phone", response.data.phone || response.data.phoneNo);
        }

        if (response.data.pic) {
          localStorage.setItem("pic", response.data.pic);
        }

        setSuccess("Profile updated successfully.");

        setTimeout(() => {
          navigate(`/${role}/${userId}/profile`);
        }, 1200);
      } else {
        setError(
          response.reason?.name ||
            response.reason?.ownerName ||
            response.reason?.email ||
            response.reason?.phoneNo ||
            response.reason?.phone ||
            "Update failed. Please try again.",
        );
      }
    } catch (error) {
      console.log(error);
      setError("Internal Server Error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Scoped styles for clearer section grouping. Safe to move into a
          stylesheet — kept inline here so the component is drop-in. */}
      <style>{`
        .form-section {
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 14px;
          padding: 1.25rem 1.5rem 1.5rem;
          margin-bottom: 1.5rem;
          background: var(--bs-body-bg, #fff);
          position: relative;
        }
        .form-section:last-of-type { margin-bottom: 0; }
        .form-section-header {
          display: flex;
          align-items: center;
          gap: .65rem;
          margin: -0.25rem 0 1.1rem;
          padding-bottom: .75rem;
          border-bottom: 1px solid var(--bs-border-color, #eee);
        }
        .form-section-header .icon-badge {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1rem;
        }
        .form-section-header h3 {
          margin: 0;
          font-size: .95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: var(--bs-body-color, #212529);
        }
        .form-section-header p {
          margin: 0;
          font-size: .8rem;
        }
        .form-section--personal .icon-badge { background: var(--bs-primary, #0d6efd); }
        .form-section--reservation .icon-badge { background: #b8860b; }
        .form-section--address .icon-badge { background: #198754; }
        .form-section--reservation {
          background: rgba(184, 134, 11, 0.05);
          border-color: rgba(184, 134, 11, 0.25);
        }
        .form-section--address {
          background: rgba(25, 135, 84, 0.04);
          border-color: rgba(25, 135, 84, 0.2);
        }
      `}</style>

      {/* Page heading */}
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-gear" aria-hidden="true"></i>
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-1">Update Profile</h1>
            <p className="text-muted mb-0">
              Edit your personal details and save changes.
            </p>
          </div>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate(`/${role}/${userId}/profile`)}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Profile
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* ── Avatar sidebar ── */}
        <div className="col-12 col-xl-4">
          <div className="panel h-100 text-center profile-card">
            <div className="profile-cover">
              <img
                src="/images/png/dasher-ui-bootstrap-5.jpg"
                alt="cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {previewUrl ? (
              <img
                className="avatar-img avatar-xl profile-photo"
                src={previewUrl}
                alt={data.name}
                style={{ objectFit: "cover" }}
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

            <h2 className="h5 mt-3 mb-1">{data.name || "Your Name"}</h2>
            <p className="text-muted mb-3">{rawRole || "User"}</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => fileRef.current.click()}
            >
              <i className="bi bi-camera me-1"></i> Change Photo
            </button>

            {picFile && (
              <p className="text-muted small mt-2 mb-0">
                <i className="bi bi-check-circle-fill text-success me-1"></i>
                {picFile.name}
              </p>
            )}

            <div className="info-list mt-4 text-start">
              <div>
                <span>
                  <i className="bi bi-envelope me-1"></i>Email
                </span>
                <strong className="text-truncate" style={{ maxWidth: 180 }}>
                  {data.email || "—"}
                </strong>
              </div>
              <div>
                <span>
                  <i className="bi bi-telephone me-1"></i>Phone
                </span>
                <strong>{data.phone || "—"}</strong>
              </div>
              {(role === "resturent" || role === "admin") && (
                <div>
                  <span>
                    <i className="bi bi-toggle-on me-1"></i>Reservations
                  </span>
                  <strong className={data.isreservation ? "text-success" : "text-muted"}>
                    {data.isreservation ? "Enabled" : "Disabled"}
                  </strong>
                </div>
              )}
              {data.city && (
                <div>
                  <span>
                    <i className="bi bi-geo-alt me-1"></i>City
                  </span>
                  <strong>{data.city}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Edit form ── */}
        <div className="col-12 col-xl-8">
          <form
            className={`panel needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={postData}
          >
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-gear" aria-hidden="true"></i>
                  <span>Profile Settings</span>
                </h2>
                <p className="text-muted mb-0">
                  Update your account profile and contact details.
                </p>
              </div>
            </div>

            {success && (
              <div
                className="alert alert-success py-2 d-flex align-items-center gap-2 mt-3"
                role="alert"
              >
                <i className="bi bi-check-circle-fill"></i> {success}
              </div>
            )}
            {error && (
              <div
                className="alert alert-danger py-2 d-flex align-items-center gap-2 mt-3"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            {/* ── Section: Personal Info ── */}
            <div className="form-section form-section--personal mt-3">
              <div className="form-section-header">
                <span className="icon-badge">
                  <i className="bi bi-person" aria-hidden="true"></i>
                </span>
                <div>
                  <h3>Personal Info</h3>
                  <p className="text-muted">Name, contact details, and how people reach you.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="upName">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upName"
                      name="name"
                      type="text"
                      value={data.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                    <div className="invalid-feedback">Full name is required.</div>
                  </div>
                </div>

                {role === "resturent" && (
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="upOwnerName">
                      Owner Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        className="form-control"
                        id="upOwnerName"
                        name="ownerName"
                        type="text"
                        value={data.ownerName}
                        onChange={handleChange}
                        placeholder="Owner's full name"
                        required
                      />
                      <div className="invalid-feedback">
                        Owner name is required.
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <label className="form-label" htmlFor="upEmail">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upEmail"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                    <div className="invalid-feedback">
                      Enter a valid email address.
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="upPhone">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upPhone"
                      name="phone"
                      type="tel"
                      value={data.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Reservation & Capacity and Hours & Status panels ── */}
            {(role === "admin" || role === "resturent") && (
              <>
                <div className="panel mt-3">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-cash-coin" aria-hidden="true"></i>
                        <span>Reservation & Capacity</span>
                      </h2>
                      <p className="text-muted mb-0">Table booking price and seating capacity.</p>
                    </div>
                    <div className="ms-auto">
                      <button
                        type="button"
                        className={`btn btn-sm ${data.isreservation ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={toggleReservationField}
                      >
                        <i className={`bi ${data.isreservation ? "bi-toggle-on" : "bi-toggle-off"}`} aria-hidden="true"></i>{" "}
                        {data.isreservation ? "Reservations Enabled" : "Reservations Disabled"}
                      </button>
                    </div>
                  </div>
                  {data.isreservation && (
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="reservationPrice">Reservation Price (₹)</label>
                        <input id="reservationPrice" type="number" name="reservationPrice" className="form-control"
                          value={data.reservationPrice} onChange={getInputData} placeholder="Enter Price" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="discount">Discount (%)</label>
                        <input id="discount" type="number" name="discount" min="0" max="100" className="form-control"
                          value={data.discount} onChange={getInputData} placeholder="Enter Discount" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Final Price (₹)</label>
                        <input className="form-control bg-light text-dark" type="number" readOnly
                          value={
                            data.reservationPrice
                              ? Math.round(data.reservationPrice - (data.reservationPrice * (data.discount || 0)) / 100)
                              : 0
                          } />
                        <div className="text-muted small mt-1">Calculated automatically</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="seatAvailable">Seats Available</label>
                        <input id="seatAvailable" type="number" name="seatAvailable" className="form-control"
                          value={data.seatAvailable} onChange={getInputData} placeholder="Enter Seat Count" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="panel mt-3">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-clock" aria-hidden="true"></i>
                        <span>Hours & Status</span>
                      </h2>
                      <p className="text-muted mb-0">Operating hours and platform visibility.</p>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="openTime">Opening Time</label>
                      <input id="openTime" type="time" name="openTime" className="form-control"
                        value={data.openTime} onChange={getInputData} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="closeTime">Closing Time</label>
                      <input id="closeTime" type="time" name="closeTime" className="form-control"
                        value={data.closeTime} onChange={getInputData} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="active">Active</label>
                      <select id="active" name="active" className="form-select"
                        value={data.active ? "1" : "0"} onChange={getInputData}>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Section: Address Details ── */}
            <div className="form-section form-section--address">
              <div className="form-section-header">
                <span className="icon-badge">
                  <i className="bi bi-geo-alt" aria-hidden="true"></i>
                </span>
                <div>
                  <h3>Address Details</h3>
                  <p className="text-muted">Where you're located, or auto-fill from GPS.</p>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={getLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Locating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-crosshair me-1"></i> Use Current
                      Location
                    </>
                  )}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="upAddress">
                    Street Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-house"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upAddress"
                      name="address"
                      type="text"
                      value={data.address}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upCity">
                    City
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-building"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upCity"
                      name="city"
                      type="text"
                      value={data.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upState">
                    State
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-map"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upState"
                      name="state"
                      type="text"
                      value={data.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upPin">
                    PIN Code
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-pin-map"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upPin"
                      name="pin"
                      type="text"
                      value={data.pin}
                      onChange={handleChange}
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/${role}/${userId}/profile`)}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}