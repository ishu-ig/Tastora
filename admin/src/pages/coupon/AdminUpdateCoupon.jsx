// ─── AdminUpdateCoupon.jsx ──────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCoupon,
  updateCoupon,
} from "../../Redux/ActionCreators/CouponActionCreators";

const checklist = [
  { dot: "bg-primary", title: "Review Code", body: "Check coupon code and description." },
  { dot: "bg-info",    title: "Discount & Caps", body: "Update percentage or flat discounts and caps." },
  { dot: "bg-success", title: "Validity Period", body: "Adjust the start and expiry dates as needed." },
  { dot: "bg-warning", title: "Save Changes",   body: "Changes take effect immediately on the site." },
];

export default function AdminUpdateCoupon() {
  const { _id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CouponStateData = useSelector((state) => state.CouponStateData);

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!CouponStateData || CouponStateData.length === 0) {
      dispatch(getCoupon());
    }
  }, [dispatch, CouponStateData]);

  useEffect(() => {
    if (CouponStateData && CouponStateData.length > 0) {
      const found = CouponStateData.find((c) => c._id === _id);
      if (found) {
        setFormData({
          ...found,
          validFrom: found.validFrom ? found.validFrom.split("T")[0] : "",
          validTill: found.validTill ? found.validTill.split("T")[0] : "",
          maxDiscountAmount: found.maxDiscountAmount ?? "",
          minOrderValue: found.minOrderValue ?? "",
          totalUsageLimit: found.totalUsageLimit ?? "",
          usageLimitPerUser: found.usageLimitPerUser ?? 1,
        });
      }
    }
  }, [CouponStateData, _id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!formData.code?.trim()) errs.code = "Coupon Code is Mandatory";
    if (!formData.discountValue) errs.discountValue = "Discount Value is Mandatory";
    if (Number(formData.discountValue) <= 0) errs.discountValue = "Must be greater than 0";
    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100)
      errs.discountValue = "Percentage cannot exceed 100";
    if (!formData.validTill) errs.validTill = "Expiry Date is Mandatory";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    dispatch(
      updateCoupon({
        _id: formData._id,
        code: formData.code.trim().toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
        minOrderValue: Number(formData.minOrderValue) || 0,
        validFrom: formData.validFrom,
        validTill: formData.validTill,
        totalUsageLimit: Number(formData.totalUsageLimit) || 0,
        usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
        active: formData.active,
      })
    );
    setTimeout(() => {
      navigate("/coupon");
    }, 400);
  }

  if (!formData) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-5 text-center text-muted">
          <div className="spinner-border" role="status" />
          <p className="mt-2">Loading coupon…</p>
        </div>
      </main>
    );
  }

  const isPercent = formData.discountType === "percentage";

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Coupon</h1>
              <p className="text-muted mb-0">
                Editing: <span className="fw-bold font-monospace text-primary">{formData.code}</span>
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/coupon">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back
            </Link>
          </div>
        </div>

        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-ticket-perforated" aria-hidden="true"></i>
                    <span>Coupon Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the coupon settings and availability.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Coupon Code */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="code">
                      Coupon Code <span className="text-danger">*</span>
                    </label>
                    <input
                      id="code"
                      type="text"
                      name="code"
                      className={`form-control text-uppercase ${errors.code ? "is-invalid" : ""}`}
                      value={formData.code}
                      onChange={handleChange}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                  </div>

                  {/* Description */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="description">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      name="description"
                      className="form-control"
                      value={formData.description ?? ""}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Discount Type */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="discountType">
                      Discount Type <span className="text-danger">*</span>
                    </label>
                    <select
                      id="discountType"
                      name="discountType"
                      className="form-select"
                      value={formData.discountType}
                      onChange={handleChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="discountValue">
                      Discount Value <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">{isPercent ? "%" : "₹"}</span>
                      <input
                        id="discountValue"
                        type="number"
                        name="discountValue"
                        className={`form-control ${errors.discountValue ? "is-invalid" : ""}`}
                        min="0"
                        max={isPercent ? "100" : undefined}
                        value={formData.discountValue}
                        onChange={handleChange}
                      />
                      {errors.discountValue && (
                        <div className="invalid-feedback">{errors.discountValue}</div>
                      )}
                    </div>
                  </div>

                  {/* Max Discount Amount */}
                  {isPercent && (
                    <div className="col-12 col-md-6">
                      <label className="form-label" htmlFor="maxDiscountAmount">
                        Max Discount Cap (₹)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          id="maxDiscountAmount"
                          type="number"
                          name="maxDiscountAmount"
                          className="form-control"
                          min="0"
                          value={formData.maxDiscountAmount}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* Min Order Value */}
                  <div className={`col-12 ${isPercent ? "col-md-6" : "col-md-12"}`}>
                    <label className="form-label" htmlFor="minOrderValue">
                      Min Order Value (₹)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        id="minOrderValue"
                        type="number"
                        name="minOrderValue"
                        className="form-control"
                        min="0"
                        value={formData.minOrderValue}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Valid From */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="validFrom">
                      Valid From
                    </label>
                    <input
                      id="validFrom"
                      type="date"
                      name="validFrom"
                      className="form-control"
                      value={formData.validFrom}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Valid Till */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="validTill">
                      Valid Till <span className="text-danger">*</span>
                    </label>
                    <input
                      id="validTill"
                      type="date"
                      name="validTill"
                      className={`form-control ${errors.validTill ? "is-invalid" : ""}`}
                      value={formData.validTill}
                      onChange={handleChange}
                    />
                    {errors.validTill && (
                      <div className="invalid-feedback">{errors.validTill}</div>
                    )}
                  </div>

                  {/* Total Used Count (Read-only) */}
                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="totalUsed">
                      Total Used Count
                    </label>
                    <input
                      id="totalUsed"
                      className="form-control bg-light"
                      type="number"
                      readOnly
                      value={formData.totalUsedCount ?? 0}
                    />
                    <div className="form-text">Auto-tracked when orders are placed.</div>
                  </div>

                  {/* Total Usage Limit */}
                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="totalUsageLimit">
                      Total Usage Limit
                    </label>
                    <input
                      id="totalUsageLimit"
                      type="number"
                      name="totalUsageLimit"
                      className="form-control"
                      min="0"
                      value={formData.totalUsageLimit}
                      onChange={handleChange}
                    />
                    <div className="form-text">0 = unlimited redemptions.</div>
                  </div>

                  {/* Per User Limit */}
                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="usageLimitPerUser">
                      Per-User Limit
                    </label>
                    <input
                      id="usageLimitPerUser"
                      type="number"
                      name="usageLimitPerUser"
                      className="form-control"
                      min="1"
                      value={formData.usageLimitPerUser}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Status */}
                  <div className="col-12">
                    <label className="form-label" htmlFor="active">
                      Status
                    </label>
                    <select
                      id="active"
                      name="active"
                      className="form-select"
                      value={formData.active ? "1" : "0"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          active: e.target.value === "1",
                        }))
                      }
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                  <Link className="btn btn-outline-secondary" to="/coupon">
                    Cancel
                  </Link>
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle" aria-hidden="true"></i> Update Coupon
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Setup Checklist */}
          <div className="col-12 col-xl-4">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-list-check" aria-hidden="true"></i>
                <span>Setup Checklist</span>
              </h2>
              <div className="activity-list">
                {checklist.map(({ dot, title, body }) => (
                  <div key={title} className="activity-item">
                    <span className={`activity-dot ${dot}`}></span>
                    <div>
                      <p className="mb-1 fw-semibold">{title}</p>
                      <p className="text-muted small mb-0">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
