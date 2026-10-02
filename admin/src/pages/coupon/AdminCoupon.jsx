// ─── AdminCoupon.jsx ────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCoupon,
  deleteCoupon,
  updateCoupon,
} from "../../Redux/ActionCreators/CouponActionCreators";

export default function AdminCoupon() {
  const CouponStateData = useSelector((state) => state.CouponStateData);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");

  const totalCount = CouponStateData?.length ?? 0;
  const activeCount = CouponStateData?.filter((i) => i.active).length ?? 0;
  const inactiveCount = totalCount - activeCount;

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      dispatch(deleteCoupon({ _id }));
      setFlag((f) => !f);
    }
  }

  function updateRecord(_id) {
    const item = CouponStateData.find((c) => c._id === _id);
    if (!item) return;
    dispatch(updateCoupon({ ...item, active: !item.active }));
    setFlag((f) => !f);
  }

  useEffect(() => {
    dispatch(getCoupon());
  }, [dispatch, flag]);

  const filteredData =
    CouponStateData?.filter(
      (item) =>
        item.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

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
        .act-btn-edit:hover  { background: #cfe2ff; color: #0d6efd; }
        .act-btn-on:hover    { background: #d1e7dd; color: #198754; }
        .act-btn-off:hover   { background: #fff3cd; color: #856404; }
        .act-btn-del:hover   { background: #f8d7da; color: #dc3545; }
        .act-sep { width: 1px; height: 16px; background: var(--bs-border-color, #dee2e6); flex-shrink: 0; }
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
        .coupon-code-badge {
          font-family: monospace;
          font-size: 0.84rem;
          font-weight: 700;
          background: rgba(67, 97, 238, 0.08);
          border: 1px dashed #4361ee;
          color: #4361ee;
          padding: 3px 9px;
          border-radius: 6px;
          letter-spacing: 0.8px;
        }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-ticket-perforated" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Coupons</h1>
                <p className="text-muted mb-0">Search, review, and manage coupons.</p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/coupon/create">
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add Coupon
              </Link>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Coupon summary">
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon">
                    <i className="bi bi-ticket-perforated-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta">
                  <span>all</span>
                  <span>coupons</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta">
                  <span>published</span>
                  <span>on site</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Inactive</span>
                  <span className="metric-icon">
                    <i className="bi bi-eye-slash-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta">
                  <span>hidden</span>
                  <span>from site</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Coupon List</span>
                </h2>
                <p className="text-muted mb-0">Search, review, and manage coupons.</p>
              </div>
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search coupons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearch("")}
                    >
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
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Valid Till</th>
                    <th>Usage / Limit</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          <span className="coupon-code-badge">{item.code}</span>
                          {item.description && (
                            <div className="text-muted small mt-1" style={{ maxWidth: 180 }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {item.discountType === "percentage"
                              ? `${item.discountValue}%`
                              : `₹${item.discountValue}`}
                          </span>
                          <span className={`badge ms-2 ${item.discountType === "percentage" ? "text-bg-info" : "text-bg-warning"}`}>
                            {item.discountType === "percentage" ? "%" : "Flat"}
                          </span>
                          {item.discountType === "percentage" && item.maxDiscountAmount > 0 && (
                            <div className="text-muted small">Max ₹{item.maxDiscountAmount}</div>
                          )}
                        </td>
                        <td>₹{item.minOrderValue ?? 0}</td>
                        <td>{formatDate(item.validTill)}</td>
                        <td>
                          <span className="fw-semibold">{item.totalUsedCount ?? 0}</span>
                          <span className="text-muted"> / {item.totalUsageLimit > 0 ? item.totalUsageLimit : "∞"}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="act-strip">
                            <Link
                              className="act-btn act-btn-edit"
                              to={`/coupon/update/${item._id}`}
                              data-tip="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Link>
                            <span className="act-sep"></span>
                            <button
                              className={`act-btn ${item.active ? "act-btn-off" : "act-btn-on"}`}
                              onClick={() => updateRecord(item._id)}
                              data-tip={item.active ? "Deactivate" : "Activate"}
                            >
                              <i
                                className={`bi ${item.active ? "bi-pause-fill" : "bi-play-fill"}`}
                              ></i>
                            </button>
                            <span className="act-sep"></span>
                            <button
                              className="act-btn act-btn-del"
                              onClick={() => deleteRecord(item._id)}
                              data-tip="Delete"
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        {search
                          ? `No coupons found for "${search}"`
                          : "No coupons available."}
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
