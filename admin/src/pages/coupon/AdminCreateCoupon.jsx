// ─── AdminCreateCoupon.jsx ──────────────────────────────────────────────
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createCoupon } from "../../Redux/ActionCreators/CouponActionCreators";

const checklist = [
  { dot: "bg-primary", title: "Coupon Code", body: "Unique uppercase code buyers use at checkout (e.g. TASTORA50)." },
  { dot: "bg-info",    title: "Discount Value", body: "Choose percentage (%) with optional cap or flat amount (₹)." },
  { dot: "bg-success", title: "Validity Period", body: "Set active start date and expiration date." },
  { dot: "bg-warning", title: "Usage Limits", body: "Control total redemption capacity and per-user limits." },
];

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minOrderValue: "",
  validFrom: new Date().toISOString().split("T")[0],
  validTill: "",
  totalUsageLimit: "",
  usageLimitPerUser: "1",
  active: true,
};

export default function AdminCreateCoupon() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    if (!formData.code.trim()) errs.code = "Coupon Code is Mandatory";
    if (!formData.discountValue) errs.discountValue = "Discount Value is Mandatory";
    if (Number(formData.discountValue) <= 0) errs.discountValue = "Must be greater than 0";
    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100)
      errs.discountValue = "Percentage cannot exceed 100";
    if (!formData.validTill) errs.validTill = "Expiry Date is Mandatory";
    if (formData.validTill && formData.validFrom > formData.validTill)
      errs.validTill = "Expiry date must be after valid from date";
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
    const payload = {
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
    };
    dispatch(createCoupon(payload));
    setTimeout(() => {
      navigate("/coupon");
    }, 400);
  }

  const isPercent = formData.discountType === "percentage";

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-plus-circle" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Add Coupon</h1>
              <p className="text-muted mb-0">Create a new discount coupon.</p>
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
                  <p className="text-muted mb-0">Fill in the details to create a new coupon.</p>
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
                      placeholder="e.g. FESTIVE20"
                      value={formData.code}
                      onChange={handleChange}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                    <div className="form-text">Will be auto-uppercased.</div>
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
                      placeholder="e.g. 20% off on festive orders"
                      value={formData.description}
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
                        placeholder={isPercent ? "e.g. 20" : "e.g. 50"}
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

                  {/* Max Discount Amount (Percentage Only) */}
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
                          placeholder="0 = no cap"
                          min="0"
                          value={formData.maxDiscountAmount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-text">Maximum discount limit in Rupees.</div>
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
                        placeholder="0 = no minimum required"
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

                  {/* Total Usage Limit */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="totalUsageLimit">
                      Total Usage Limit
                    </label>
                    <input
                      id="totalUsageLimit"
                      type="number"
                      name="totalUsageLimit"
                      className="form-control"
                      placeholder="0 = unlimited"
                      min="0"
                      value={formData.totalUsageLimit}
                      onChange={handleChange}
                    />
                    <div className="form-text">0 means unlimited redemptions.</div>
                  </div>

                  {/* Usage Limit Per User */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="usageLimitPerUser">
                      Per-User Limit
                    </label>
                    <input
                      id="usageLimitPerUser"
                      type="number"
                      name="usageLimitPerUser"
                      className="form-control"
                      placeholder="1"
                      min="1"
                      value={formData.usageLimitPerUser}
                      onChange={handleChange}
                    />
                    <div className="form-text">How many times each buyer can use it.</div>
                  </div>

                  {/* Active Status */}
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
                        <i className="bi bi-check-circle" aria-hidden="true"></i> Create Coupon
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
