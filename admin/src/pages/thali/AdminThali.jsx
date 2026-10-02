// ─── AdminThali.jsx ──────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getThali, deleteThali, updateThali } from "../../Redux/ActionCreators/ThaliActionCreators";
import { THALI_TYPES } from "./ThaliItemsEditor";

const MAX_ITEM_CHIPS = 4;

// Works whether `items.product` is populated or not
function itemName(it) {
  if (it.product && typeof it.product === "object" && it.product.name) return it.product.name;
  return it.customName || "Item";
}

function discountOf(item) {
  const p = Number(item.price) || 0;
  const o = Number(item.originalPrice) || 0;
  return o > p && o > 0 ? Math.round(((o - p) / o) * 100) : 0;
}

export default function AdminThali() {
  const ThaliStateData = useSelector((state) => state.ThaliStateData);
  const dispatch = useDispatch();

  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const thalis = Array.isArray(ThaliStateData) ? ThaliStateData : [];

  const totalCount = thalis.length;
  const availableCount = thalis.filter((i) => i.isAvailable).length;
  const unavailableCount = totalCount - availableCount;
  const offerCount = thalis.filter((i) => discountOf(i) > 0).length;

  useEffect(() => {
    dispatch(getThali());
  }, [dispatch, flag]);

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this thali?")) {
      dispatch(deleteThali({ _id }));
      setFlag((f) => !f);
    }
  }

  function toggleAvailability(item) {
    const formData = new FormData();
    formData.append("_id", item._id);
    formData.append("name", item.name);
    formData.append("isAvailable", !item.isAvailable);
    dispatch(updateThali(formData));
    setFlag((f) => !f);
  }

  const isAdmin = (localStorage.getItem("role") || "").toLowerCase() === "admin";

  const filteredData = thalis.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.thaliType?.toLowerCase().includes(q) ||
      (item.items || []).some((it) => itemName(it).toLowerCase().includes(q));

    const matchesType = typeFilter === "all" || item.thaliType === typeFilter;

    let matchesStatus = true;
    if (statusFilter === "available") matchesStatus = item.isAvailable;
    else if (statusFilter === "unavailable") matchesStatus = !item.isAvailable;
    else if (statusFilter === "offer") matchesStatus = discountOf(item) > 0;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <style>{`
        .product-thumb {
          width: 56px;
          height: 56px;
          object-fit: cover;
          border-radius: var(--radius-sm, 8px);
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-soft);
          flex-shrink: 0;
        }
        .price-strike {
          text-decoration: line-through;
          color: var(--admin-muted);
          font-size: 0.78rem;
        }
        .price-final {
          font-weight: 700;
          color: var(--admin-success);
        }
        .item-chip {
          display: inline-block;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-soft);
          color: var(--admin-text);
          margin: 0 4px 4px 0;
        }
        .item-chip.custom { border-style: dashed; }
        .item-chip.optional { opacity: 0.75; font-style: italic; }
        .act-sep {
          width: 1px;
          height: 18px;
          background: var(--admin-border);
          flex-shrink: 0;
        }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          {/* Page Heading */}
          <div className="page-heading mb-4">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-columns-gap" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Catalogue Management</p>
                <h1 className="h3 mb-1">Thalis</h1>
                <p className="text-muted mb-0">
                  Manage thali combos, their items, pricing, and availability.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm px-3 shadow-xs" to="/thali/create">
                <i className="bi bi-plus-circle me-1" aria-hidden="true"></i> Add New Thali
              </Link>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <section className="row g-3 mb-4" aria-label="Thali statistics">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-primary">
                <div className="metric-top">
                  <span className="metric-label">Total Thalis</span>
                  <span className="metric-icon"><i className="bi bi-columns-gap"></i></span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta"><span>thali combos</span></div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-success">
                <div className="metric-top">
                  <span className="metric-label">Available</span>
                  <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                </div>
                <div className="metric-value">{availableCount}</div>
                <div className="metric-meta"><span>ready to order</span></div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-danger">
                <div className="metric-top">
                  <span className="metric-label">Unavailable</span>
                  <span className="metric-icon"><i className="bi bi-slash-circle-fill"></i></span>
                </div>
                <div className="metric-value">{unavailableCount}</div>
                <div className="metric-meta"><span>currently off the menu</span></div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-warning">
                <div className="metric-top">
                  <span className="metric-label">On Offer</span>
                  <span className="metric-icon"><i className="bi bi-tag-fill"></i></span>
                </div>
                <div className="metric-value">{offerCount}</div>
                <div className="metric-meta"><span>discounted thalis</span></div>
              </article>
            </div>
          </section>

          {/* Table Panel */}
          <section className="panel">
            <div className="panel-header d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Thali Catalogue</span>
                </h2>
                <p className="text-muted mb-0">Search by thali name, type, or item.</p>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2 ms-auto">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", minWidth: 150 }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {THALI_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", minWidth: 140 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="offer">On Offer</option>
                </select>

                <div className="input-group input-group-sm" style={{ width: 240 }}>
                  <span className="input-group-text"><i className="bi bi-search text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search name or item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch("")}>
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
                    <th style={{ width: 45 }}>#</th>
                    <th style={{ width: 75 }}>Photo</th>
                    <th>Thali &amp; Items</th>
                    <th>Type</th>
                    <th>Serves</th>
                    <th>Pricing</th>
                    <th>Availability</th>
                    <th className="text-end" style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const discount = discountOf(item);
                      const list = item.items || [];
                      const shown = list.slice(0, MAX_ITEM_CHIPS);
                      const extra = list.length - shown.length;

                      return (
                        <tr key={item._id}>
                          <td className="text-muted small">{index + 1}</td>

                          <td>
                            {item.image ? (
                              <a href={item.image} target="_blank" rel="noreferrer">
                                <img
                                  src={item.image}
                                  className="product-thumb"
                                  alt={item.name}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              </a>
                            ) : (
                              <div
                                className="product-thumb d-flex align-items-center justify-content-center text-muted"
                                style={{ background: "var(--admin-surface-soft)" }}
                              >
                                <i className="bi bi-image fs-5"></i>
                              </div>
                            )}
                          </td>

                          <td>
                            <div className="fw-bold">{item.name}</div>
                            <div className="mt-1" style={{ maxWidth: 320 }}>
                              {shown.length > 0 ? (
                                <>
                                  {shown.map((it, i) => {
                                    const isCustom = !it.product;
                                    return (
                                      <span
                                        key={i}
                                        className={`item-chip ${isCustom ? "custom" : ""} ${it.isOptional ? "optional" : ""}`}
                                        title={[
                                          isCustom ? "Custom item" : "Menu product",
                                          it.isOptional ? "optional" : "",
                                          it.note || "",
                                        ].filter(Boolean).join(" · ")}
                                      >
                                        {itemName(it)}
                                        {it.quantity > 1 ? ` ×${it.quantity}` : ""}
                                      </span>
                                    );
                                  })}
                                  {extra > 0 && <span className="item-chip">+{extra} more</span>}
                                </>
                              ) : (
                                <span className="text-muted small fst-italic">No items listed</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className="badge"
                              style={{
                                background: "var(--admin-surface-soft)",
                                color: "var(--admin-text)",
                                border: "1px solid var(--admin-border)",
                              }}
                            >
                              {item.thaliType || "Special"}
                            </span>
                          </td>

                          <td className="small">
                            <i className="bi bi-people me-1 text-muted"></i>
                            {item.servingFor ?? 1}
                          </td>

                          <td>
                            <div className="d-flex align-items-baseline gap-2">
                              <span className="price-final">₹{item.price}</span>
                              {discount > 0 && <span className="price-strike">₹{item.originalPrice}</span>}
                            </div>
                            {discount > 0 && (
                              <span
                                className="badge bg-danger-subtle text-danger border border-danger-subtle"
                                style={{ fontSize: "0.7rem" }}
                              >
                                <i className="bi bi-tag-fill me-1"></i>{discount}% OFF
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm py-1 px-2.5 border-0 badge ${
                                item.isAvailable
                                  ? "bg-success-subtle text-success border border-success-subtle"
                                  : "bg-warning-subtle text-warning border border-warning-subtle"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleAvailability(item)}
                              title="Click to toggle availability"
                            >
                              <i
                                className={`bi me-1 ${
                                  item.isAvailable ? "bi-check-circle-fill" : "bi-slash-circle-fill"
                                }`}
                              ></i>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </button>
                          </td>

                          <td className="text-end">
                            <div className="act-strip">
                              <Link
                                className="act-btn act-btn-edit"
                                to={`/thali/update/${item._id}`}
                                data-tip="Edit Thali"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Link>

                              <span className="act-sep"></span>

                              <button
                                type="button"
                                className={`act-btn ${item.isAvailable ? "act-btn-off" : "act-btn-on"}`}
                                onClick={() => toggleAvailability(item)}
                                data-tip={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                              >
                                <i className={`bi ${item.isAvailable ? "bi-bag-x" : "bi-bag-check"}`}></i>
                              </button>

                              {isAdmin && (
                                <>
                                  <span className="act-sep"></span>
                                  <button
                                    type="button"
                                    className="act-btn act-btn-del"
                                    onClick={() => deleteRecord(item._id)}
                                    data-tip="Delete Thali"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-5">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          <i className="bi bi-search fs-2 text-muted mb-2"></i>
                          <p className="mb-1 fw-semibold">No thalis found</p>
                          <span className="small text-muted">
                            {search || typeFilter !== "all" || statusFilter !== "all"
                              ? "Try adjusting your search query or filters."
                              : "No thalis added yet."}
                          </span>
                        </div>
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