// ─── AdminProduct.jsx ────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProduct, deleteProduct, updateProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";

export default function AdminProduct() {
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const dispatch = useDispatch();

  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const products = Array.isArray(ProductStateData) ? ProductStateData : [];
  const maincategories = Array.isArray(MaincategoryStateData) ? MaincategoryStateData : [];

  const totalCount = products.length;
  const activeCount = products.filter((i) => i.active).length;
  const inactiveCount = totalCount - activeCount;
  const availableCount = products.filter((i) => i.availability).length;

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch, maincategories.length]);

  useEffect(() => {
    dispatch(getProduct());
  }, [dispatch, flag]);

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      dispatch(deleteProduct({ _id }));
      setFlag((f) => !f);
    }
  }

  function toggleAvailability(item) {
    const formData = new FormData();
    formData.append("_id", item._id);
    formData.append("name", item.name);
    formData.append("availability", !item.availability);
    dispatch(updateProduct(formData));
    setFlag((f) => !f);
  }

  function toggleActive(item) {
    const formData = new FormData();
    formData.append("_id", item._id);
    formData.append("name", item.name);
    formData.append("active", !item.active);
    dispatch(updateProduct(formData));
    setFlag((f) => !f);
  }

  const filteredData =
    products.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.ingredient?.toLowerCase().includes(q) ||
        item.maincategory?.name?.toLowerCase().includes(q) ||
        item.subcategory?.name?.toLowerCase().includes(q);

      const itemMainId =
        typeof item.maincategory === "object" && item.maincategory !== null
          ? item.maincategory._id
          : item.maincategory;
      const matchesCategory =
        categoryFilter === "all" || itemMainId === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = item.active;
      else if (statusFilter === "inactive") matchesStatus = !item.active;
      else if (statusFilter === "available") matchesStatus = item.availability;
      else if (statusFilter === "unavailable") matchesStatus = !item.availability;

      return matchesSearch && matchesCategory && matchesStatus;
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
        .badge-portion {
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 4px;
        }
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
                <i className="bi bi-egg-fried" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Catalogue Management</p>
                <h1 className="h3 mb-1">Dishes & Menu</h1>
                <p className="text-muted mb-0">
                  Manage menu catalogue, ingredients, portion pricing, and availability.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm px-3 shadow-xs" to="/product/create">
                <i className="bi bi-plus-circle me-1" aria-hidden="true"></i> Add New Dish
              </Link>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <section className="row g-3 mb-4" aria-label="Dish statistics">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-primary">
                <div className="metric-top">
                  <span className="metric-label">Total Dishes</span>
                  <span className="metric-icon">
                    <i className="bi bi-egg-fried"></i>
                  </span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta">
                  <span>catalogue items</span>
                </div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-success">
                <div className="metric-top">
                  <span className="metric-label">Published</span>
                  <span className="metric-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta">
                  <span>active on menu</span>
                </div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-danger">
                <div className="metric-top">
                  <span className="metric-label">Hidden</span>
                  <span className="metric-icon">
                    <i className="bi bi-eye-slash-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta">
                  <span>hidden / drafts</span>
                </div>
              </article>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-warning">
                <div className="metric-top">
                  <span className="metric-label">In Stock</span>
                  <span className="metric-icon">
                    <i className="bi bi-bag-check-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{availableCount}</div>
                <div className="metric-meta">
                  <span>ready to order</span>
                </div>
              </article>
            </div>
          </section>

          {/* Catalogue Table Panel */}
          <section className="panel">
            <div className="panel-header d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Dish Catalogue</span>
                </h2>
                <p className="text-muted mb-0">
                  Search by dish name, ingredients, or category.
                </p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="d-flex align-items-center flex-wrap gap-2 ms-auto">
                {/* Category Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", minWidth: 150 }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {maincategories.filter((m) => m.active).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", minWidth: 140 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="available">In Stock</option>
                  <option value="unavailable">Out of Stock</option>
                </select>

                {/* Search Bar */}
                <div className="input-group input-group-sm" style={{ width: 240 }}>
                  <span className="input-group-text">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search name or ingredient..."
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
                    <th style={{ width: 45 }}>#</th>
                    <th style={{ width: 75 }}>Photo</th>
                    <th>Dish Details & Ingredients</th>
                    <th>Category</th>
                    <th>Portions & Pricing</th>
                    <th>Customer Rating</th>
                    <th>Kitchen Stock</th>
                    <th>Catalogue</th>
                    <th className="text-end" style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const mainName = item.maincategory?.name ?? "—";
                      const subName = item.subcategory?.name;
                      const hasReviews = item.reviews && item.reviews.length > 0;
                      const ratingScore = item.rating > 0 ? item.rating.toFixed(1) : null;

                      return (
                        <tr key={item._id}>
                          {/* Row Index */}
                          <td className="text-muted small">{index + 1}</td>

                          {/* Image */}
                          <td>
                            {item.pic ? (
                              <a href={item.pic} target="_blank" rel="noreferrer">
                                <img
                                  src={item.pic}
                                  className="product-thumb"
                                  alt={item.name}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
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

                          {/* Name & Ingredients */}
                          <td>
                            <div className="fw-bold">{item.name}</div>
                            <div
                              className="text-muted small text-truncate mt-1"
                              style={{ maxWidth: 260 }}
                              title={item.ingredient || "No ingredients listed"}
                            >
                              <i className="bi bi-basket2 text-primary me-1"></i>
                              {item.ingredient ? (
                                <span>{item.ingredient}</span>
                              ) : (
                                <span className="fst-italic text-secondary">
                                  No ingredients specified
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: "var(--admin-surface-soft)",
                                color: "var(--admin-text)",
                                border: "1px solid var(--admin-border)",
                              }}
                            >
                              {mainName}
                            </span>
                            {subName && (
                              <div className="text-muted mt-1" style={{ fontSize: "0.78rem" }}>
                                <i className="bi bi-arrow-return-right me-1"></i>
                                {subName}
                              </div>
                            )}
                          </td>

                          {/* Portions & Variant Pricing */}
                          <td>
                            {(item.variants || []).filter((v) => v.available).length > 0 ? (
                              <div>
                                {(item.variants || [])
                                  .filter((v) => v.available)
                                  .map((v) => (
                                    <div key={v.name} className="d-flex align-items-center gap-1 mb-1">
                                      <span
                                        className="badge badge-portion"
                                        style={{
                                          background: "var(--admin-surface-soft)",
                                          color: "var(--admin-muted)",
                                          border: "1px solid var(--admin-border)",
                                        }}
                                      >
                                        {v.name}
                                      </span>
                                      <span className="price-final">
                                        ₹{v.finalPrice ?? v.price}
                                      </span>
                                      {item.discount > 0 && v.finalPrice !== v.price && (
                                        <span className="price-strike">₹{v.price}</span>
                                      )}
                                    </div>
                                  ))}
                                {item.discount > 0 && (
                                  <span
                                    className="badge bg-danger-subtle text-danger border border-danger-subtle"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    <i className="bi bi-tag-fill me-1"></i>{item.discount}% OFF
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic">No pricing</span>
                            )}
                          </td>

                          {/* Rating & Reviews */}
                          <td>
                            {ratingScore ? (
                              <div>
                                <span className="fw-semibold small">
                                  <i className="bi bi-star-fill text-warning me-1"></i>
                                  {ratingScore}
                                </span>
                                <div className="text-muted" style={{ fontSize: "0.74rem" }}>
                                  ({item.reviews?.length ?? 0} {hasReviews && item.reviews.length === 1 ? "review" : "reviews"})
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic">No ratings</span>
                            )}
                          </td>

                          {/* Kitchen Order Availability Toggle */}
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm py-1 px-2.5 border-0 badge ${
                                item.availability
                                  ? "bg-success-subtle text-success border border-success-subtle"
                                  : "bg-warning-subtle text-warning border border-warning-subtle"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleAvailability(item)}
                              title="Click to toggle order availability"
                            >
                              <i
                                className={`bi me-1 ${
                                  item.availability ? "bi-check-circle-fill" : "bi-slash-circle-fill"
                                }`}
                              ></i>
                              {item.availability ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>

                          {/* Catalogue Status Toggle */}
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm py-1 px-2.5 border-0 badge ${
                                item.active
                                  ? "bg-primary-subtle text-primary border border-primary-subtle"
                                  : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleActive(item)}
                              title="Click to toggle catalogue status"
                            >
                              <i
                                className={`bi me-1 ${
                                  item.active ? "bi-eye-fill" : "bi-eye-slash-fill"
                                }`}
                              ></i>
                              {item.active ? "Published" : "Hidden"}
                            </button>
                          </td>

                          {/* Actions Strip */}
                          <td className="text-end">
                            <div className="act-strip">
                              <Link
                                className="act-btn act-btn-edit"
                                to={`/product/update/${item._id}`}
                                data-tip="Edit Dish"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Link>

                              <span className="act-sep"></span>

                              <button
                                type="button"
                                className={`act-btn ${
                                  item.availability ? "act-btn-off" : "act-btn-on"
                                }`}
                                onClick={() => toggleAvailability(item)}
                                data-tip={item.availability ? "Mark Out of Stock" : "Mark In Stock"}
                              >
                                <i
                                  className={`bi ${
                                    item.availability ? "bi-bag-x" : "bi-bag-check"
                                  }`}
                                ></i>
                              </button>

                              {localStorage.getItem("role") === "Admin" && (
                                <>
                                  <span className="act-sep"></span>
                                  <button
                                    type="button"
                                    className="act-btn act-btn-del"
                                    onClick={() => deleteRecord(item._id)}
                                    data-tip="Delete Dish"
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
                      <td colSpan="9" className="text-center text-muted py-5">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          <i className="bi bi-search fs-2 text-muted mb-2"></i>
                          <p className="mb-1 fw-semibold">No dishes found</p>
                          <span className="small text-muted">
                            {search || categoryFilter !== "all" || statusFilter !== "all"
                              ? "Try adjusting your search query or filters."
                              : "No dishes added to catalogue yet."}
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