import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBooking, updateBooking } from "../../Redux/ActionCreators/BookingActionCreators";

export default function AdminBookingShow() {
  const { _id } = useParams();
  const BookingStateData = useSelector((state) => state.BookingStateData);
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { dispatch(getBooking()); }, [dispatch]);

  useEffect(() => {
    const list = Array.isArray(BookingStateData) ? BookingStateData : BookingStateData?.data || [];
    if (list.length) {
      const item = list.find((x) => x._id === _id);
      if (item) {
        setData({ ...item });
        setPaymentStatus(item.paymentStatus || "Pending");
      } else {
        alert("Invalid Booking ID");
      }
    }
  }, [_id, BookingStateData]);

  function updateRecord() {
    if (window.confirm("Are you sure you want to update the payment status?")) {
      const updatedData = { ...data, paymentStatus };
      dispatch(updateBooking(updatedData));
      setData(updatedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (!data) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4 d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted">Loading booking…</p>
          </div>
        </div>
      </main>
    );
  }

  const isConfirmed = data.bookingStatus === "true";
  const isCancelled = !isConfirmed;
  const isCompleted = isConfirmed && data.paymentStatus === "Done";
  const canUpdate    = isConfirmed && data.paymentStatus !== "Done";

  return (
    <main className="dashboard-content">
      <style>{`
        .detail-row { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: #495057; }
        .summary-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; color: #495057; }
        .summary-row.total { font-size: 1rem; font-weight: 700; color: #212529; }
        .summary-row.total span:last-child { color: #0d6efd; }
      `}</style>

      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-calendar-check" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Booking Details</h1>
              <p className="text-muted mb-0">ID: {data._id}</p>
            </div>
          </div>
          <div className="heading-actions d-flex flex-wrap gap-2 align-items-center">
            <span className={`badge ${isConfirmed ? "text-bg-success" : "text-bg-danger"}`}>
              {isConfirmed ? "Confirmed" : "Cancelled"}
            </span>
            <span className={`badge ${data.paymentStatus === "Done" ? "text-bg-success" : "text-bg-warning"}`}>
              {data.paymentStatus}
            </span>
            <Link className="btn btn-outline-secondary btn-sm" to="/booking">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Bookings
            </Link>
          </div>
        </div>

        {saved && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2"></i>Payment status updated successfully
          </div>
        )}

        <section className="row g-3">

          {isCancelled && (
            <div className="col-12">
              <div className="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">
                <i className="bi bi-x-circle fs-3"></i>
                <div>
                  <div className="fw-bold">Booking Cancelled</div>
                  <div className="small">This reservation has been cancelled.</div>
                </div>
              </div>
            </div>
          )}

          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-person" aria-hidden="true"></i>
                <span>Customer</span>
              </h2>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: "bi-person",    val: data.user?.name || data.user?.email },
                  { icon: "bi-envelope",  val: data.user?.email },
                  { icon: "bi-telephone", val: data.user?.phone },
                  { icon: "bi-geo-alt",   val: [data.user?.city, data.user?.state, data.user?.pin].filter(Boolean).join(", ") },
                ].filter((r) => r.val).map(({ icon, val }) => (
                  <div key={icon} className="detail-row">
                    <i className={`bi ${icon} text-primary`}></i>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                <span>Booking Summary</span>
              </h2>
              <div className="summary-row"><span>Restaurant</span><span>{data.resturent?.name ?? "—"}</span></div>
              <div className="summary-row">
                <span>Date</span>
                <span>{data.date ? new Date(data.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              </div>
              <div className="summary-row"><span>Time Slot</span><span>{data.time ?? "—"}</span></div>
              <div className="summary-row"><span>Seats</span><span>{data.seats ?? "—"}</span></div>
              <hr className="my-2" />
              <div className="summary-row total"><span>Total</span><span>₹{data.finalReservationPrice ?? data.total ?? 0}</span></div>
              <div className="summary-row"><span>Payment Mode</span><span>{data.paymentMode ?? "—"}</span></div>
              <div className="summary-row">
                <span>Payment Status</span>
                <span className={`badge ${data.paymentStatus === "Done" ? "text-bg-success" : "text-bg-warning"}`}>
                  {data.paymentStatus}
                </span>
              </div>
              <div className="summary-row">
                <span>Booked On</span>
                <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              </div>
            </div>
          </div>

          {canUpdate && (
            <div className="col-12">
              <div className="panel">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  <span>Update Payment Status</span>
                </h2>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-primary" onClick={updateRecord}>
                    <i className="bi bi-check-circle" aria-hidden="true"></i> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="col-12">
              <div className="alert alert-success d-flex align-items-center gap-3 mb-0" role="alert">
                <i className="bi bi-check-circle fs-3"></i>
                <div>
                  <div className="fw-bold">Booking Completed</div>
                  <div className="small">This reservation is confirmed and payment has been received.</div>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}