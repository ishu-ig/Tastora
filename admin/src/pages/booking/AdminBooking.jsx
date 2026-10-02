import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBooking } from "../../Redux/ActionCreators/BookingActionCreators";

export default function AdminBooking() {
  const BookingStateData = useSelector((state) => state.BookingStateData);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const bookings = Array.isArray(BookingStateData) ? BookingStateData : BookingStateData?.data ?? [];

  const totalCount          = bookings.length;
  const confirmedCount      = bookings.filter((b) => b.bookingStatus === "true").length;
  const pendingPaymentCount = bookings.filter((b) => b.paymentStatus === "Pending").length;
  const cancelledCount      = bookings.filter((b) => b.bookingStatus !== "true").length;

  useEffect(() => { dispatch(getBooking()); }, [dispatch]);

  const filteredData = bookings.filter((booking) =>
    booking._id?.toLowerCase().includes(search.toLowerCase()) ||
    (booking.user?.name || booking.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    booking.resturent?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (booking.bookingStatus === "true" ? "confirmed" : "cancelled").includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .act-strip {
          display: inline-flex; align-items: center; gap: 2px;
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 8px; padding: 3px;
        }
        .act-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 6px;
          border: none; background: transparent; cursor: pointer;
          font-size: 0.88rem; color: #6c757d;
          transition: background .13s, color .13s, transform .1s;
          text-decoration: none; position: relative;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn-view:hover { background: #cfe2ff; color: #0d6efd; }
        .act-btn::after {
          content: attr(data-tip);
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: #212529; color: #fff;
          font-size: 0.67rem; font-weight: 600;
          padding: 3px 7px; border-radius: 4px; white-space: nowrap;
          pointer-events: none; z-index: 20;
          opacity: 0; transition: opacity .12s;
        }
        .act-btn:hover::after { opacity: 1; }
        .booking-id-cell {
          font-family: monospace; font-size: 0.78rem; color: #6c757d;
          max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .total-cell { font-weight: 600; color: #198754; }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">

          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-calendar-check" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Table Bookings</h1>
                <p className="text-muted mb-0">Review and manage restaurant reservations.</p>
              </div>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Booking summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon"><i className="bi bi-calendar3"></i></span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta"><span>all</span><span>bookings</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Confirmed</span>
                  <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                </div>
                <div className="metric-value">{confirmedCount}</div>
                <div className="metric-meta"><span>active</span><span>reservations</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Payment Pending</span>
                  <span className="metric-icon"><i className="bi bi-hourglass-split"></i></span>
                </div>
                <div className="metric-value">{pendingPaymentCount}</div>
                <div className="metric-meta"><span>awaiting</span><span>payment</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Cancelled</span>
                  <span className="metric-icon"><i className="bi bi-x-circle-fill"></i></span>
                </div>
                <div className="metric-value">{cancelledCount}</div>
                <div className="metric-meta"><span>not</span><span>fulfilled</span></div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Booking List</span>
                </h2>
                <p className="text-muted mb-0">Search, review, and manage reservations.</p>
              </div>
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0"
                    placeholder="Search bookings..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button"
                      onClick={() => setSearch("")}>
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Booking ID</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Date &amp; Time</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td><span className="booking-id-cell" title={item._id}>{item._id}</span></td>
                        <td className="fw-semibold">{item.resturent?.name ?? "N/A"}</td>
                        <td>{item.user?.name || item.user?.email || "N/A"}</td>
                        <td className="text-muted small">
                          {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                          {item.time ? ` · ${item.time}` : ""}
                        </td>
                        <td>{item.seats}</td>
                        <td className="total-cell">₹{item.finalReservationPrice ?? item.total}</td>
                        <td>
                          <span className={`badge ${item.bookingStatus === "true" ? "text-bg-success" : "text-bg-danger"}`}>
                            {item.bookingStatus === "true" ? "Confirmed" : "Cancelled"}
                          </span>
                        </td>
                        <td>
                          <div className="small text-muted">{item.paymentMode}</div>
                          <span className={`badge ${item.paymentStatus === "Pending" ? "text-bg-danger" : "text-bg-success"}`}>
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="act-strip">
                            <Link className="act-btn act-btn-view"
                              to={`/booking/view/${item._id}`} data-tip="View">
                              <i className="bi bi-eye"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted py-4">
                        {search ? `No bookings found for "${search}"` : "No bookings available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}