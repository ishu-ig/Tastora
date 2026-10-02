// ─── AdminCreateThali.jsx ────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { createThali } from "../../Redux/ActionCreators/ThaliActionCreators";
import { getProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import ThaliItemsEditor, {
  THALI_TYPES,
  serializeItems,
  validateItems,
  priceErrors,
  discountPercent,
  itemLabel,
} from "./ThaliItemsEditor";

const EMPTY_DESC = "<p><br></p>";

export default function AdminCreateThali() {
  const [data, setData] = useState({
    name: "",
    items: [],
    description: "",
    price: "",
    originalPrice: "",
    servingFor: 1,
    thaliType: "Special",
    isAvailable: true,
    pic: null,
  });

  const [imageMode, setImageMode] = useState("file"); // "file" | "url"
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState({
    name: "Thali Name is Mandatory",
    items: "Add at least one item to the thali",
    price: "Selling price is mandatory (0 or more)",
    originalPrice: "",
    description: "Description is Mandatory",
    pic: "",
  });

  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ProductStateData = useSelector((state) => state.ProductStateData);
  const products = Array.isArray(ProductStateData) ? ProductStateData : [];

  useEffect(() => {
    dispatch(getProduct());
  }, [dispatch]);

  const discount = discountPercent(data.price, data.originalPrice);

  function getInputData(e) {
    const { name, value } = e.target;

    if (name === "name") {
      setError((old) => ({ ...old, name: formValidator(e) }));
    }

    setData((old) => ({
      ...old,
      [name]: name === "isAvailable" ? value === "1" : value,
    }));
  }

  function setPrices(price, originalPrice) {
    const e = priceErrors(price, originalPrice);
    setError((old) => ({ ...old, price: e.price, originalPrice: e.originalPrice }));
    setData((old) => ({ ...old, price, originalPrice }));
  }

  function applyDiscount(pct) {
    const o = parseFloat(data.originalPrice);
    if (!(o > 0)) return;
    setPrices(String(Math.round(o - (o * pct) / 100)), data.originalPrice);
  }

  function setItems(items) {
    setError((old) => ({ ...old, items: validateItems(items) }));
    setData((old) => ({ ...old, items }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const err = imageValidator(e);
      setError((old) => ({ ...old, pic: err || "" }));
      setData((old) => ({ ...old, pic: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setError((old) => ({ ...old, pic: "" }));
      setData((old) => ({ ...old, pic: null }));
      setImagePreview(null);
    }
  }

  function handleUrlChange(e) {
    const url = e.target.value;
    setImageUrl(url);
    if (!url.trim()) {
      setError((old) => ({ ...old, pic: "" }));
      setImagePreview(null);
    } else if (!/^https?:\/\//i.test(url.trim())) {
      setError((old) => ({ ...old, pic: "Please enter a valid HTTP or HTTPS image URL" }));
      setImagePreview(null);
    } else {
      setError((old) => ({ ...old, pic: "" }));
      setImagePreview(url.trim());
    }
  }

  function handleModeChange(mode) {
    setImageMode(mode);
    setError((old) => ({ ...old, pic: "" }));
    if (mode === "file") {
      setImagePreview(data.pic instanceof File ? URL.createObjectURL(data.pic) : null);
    } else {
      setImagePreview(/^https?:\/\//i.test(imageUrl.trim()) ? imageUrl.trim() : null);
    }
  }

  function postSubmit(e) {
    e.preventDefault();

    const nameErr = data.name.trim() === "" ? "Thali Name is Mandatory" : "";
    const itemsErr = validateItems(data.items);
    const pe = priceErrors(data.price, data.originalPrice);
    const descErr =
      data.description.trim() === "" || data.description === EMPTY_DESC
        ? "Description is Mandatory"
        : "";

    let picErr = "";
    if (imageMode === "url" && imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim())) {
      picErr = "Please enter a valid HTTP or HTTPS image URL";
    }

    if (nameErr || itemsErr || pe.price || pe.originalPrice || descErr || picErr) {
      setError({
        name: nameErr,
        items: itemsErr,
        price: pe.price,
        originalPrice: pe.originalPrice,
        description: descErr,
        pic: picErr,
      });
      setShow(true);
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("items", JSON.stringify(serializeItems(data.items)));
    formData.append("description", data.description);
    formData.append("price", parseFloat(data.price));
    formData.append("originalPrice", data.originalPrice === "" ? 0 : parseFloat(data.originalPrice));
    formData.append("servingFor", Math.max(1, parseInt(data.servingFor, 10) || 1));
    formData.append("thaliType", data.thaliType);
    formData.append("isAvailable", data.isAvailable);

    if (imageMode === "file" && data.pic) {
      formData.append("image", data.pic);
    } else if (imageMode === "url" && imageUrl.trim()) {
      formData.append("image", imageUrl.trim());
      formData.append("imageUrl", imageUrl.trim());
    }

    dispatch(createThali(formData));
    navigate("/thali");
  }

  const steps = [
    { title: "Thali Name", done: Boolean(data.name.trim()) },
    { title: "Items", done: !validateItems(data.items) },
    { title: "Pricing", done: !priceErrors(data.price, data.originalPrice).price && !priceErrors(data.price, data.originalPrice).originalPrice },
    { title: "Description", done: Boolean(data.description && data.description !== EMPTY_DESC) },
    { title: "Thali Photo (recommended)", done: Boolean(imagePreview) },
  ];
  const progressPercent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  const previewItems = data.items.map((it) => itemLabel(it, products)).filter(Boolean);
  const hasPrice = parseFloat(data.price) >= 0;

  return (
    <>
      <style>{`
        .section-header-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--admin-border);
        }
        .section-number-pill {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          background: var(--admin-primary);
          color: #ffffff;
          flex-shrink: 0;
        }
        .discount-meter-track {
          height: 6px;
          border-radius: 6px;
          background: var(--admin-border);
          overflow: hidden;
        }
        .discount-meter-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #22c55e 0%, #f97316 60%, #ef4444 100%);
          transition: width 0.35s cubic-bezier(.4,0,.2,1);
        }
        .discount-quick-btn {
          font-size: 0.72rem;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1.5px solid var(--admin-border);
          background: var(--admin-surface-soft);
          color: var(--admin-text-muted);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        .discount-quick-btn:hover:not(:disabled),
        .discount-quick-btn.active {
          background: var(--admin-primary);
          color: #fff;
          border-color: var(--admin-primary);
        }
        .discount-quick-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          {/* Header */}
          <div className="page-heading mb-4">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-plus-circle" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Catalogue Management</p>
                <h1 className="h3 mb-1">Add New Thali</h1>
                <p className="text-muted mb-0">
                  Combine menu dishes and custom items into a priced thali combo.
                </p>
              </div>
            </div>
            <div className="heading-actions d-flex gap-2">
              <Link className="btn btn-outline-secondary btn-sm" to="/thali">
                <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back
              </Link>
              <button className="btn btn-primary btn-sm px-3 shadow-xs" type="button" onClick={postSubmit}>
                <i className="bi bi-check-circle me-1" aria-hidden="true"></i> Save Thali
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {show && Object.values(error).some(Boolean) && (
            <div className="alert alert-danger alert-dismissible shadow-sm mb-4" role="alert">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>
                  <strong>Please complete required fields:</strong>
                  <ul className="mb-0 mt-1 ps-3 small">
                    {Object.entries(error)
                      .filter(([, msg]) => Boolean(msg))
                      .map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                  </ul>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
            </div>
          )}

          <section className="row g-4">
            {/* Form Column */}
            <div className="col-12 col-xl-8">
              <div className="d-flex flex-column gap-3">
                {/* 1. Essentials */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">1</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Thali Essentials</h2>
                      <span className="text-muted small">Name, cuisine type, and how many it serves</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold" htmlFor="name">
                        Thali Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-tag text-muted"></i></span>
                        <input
                          className={`form-control ${show && error.name ? "is-invalid" : ""}`}
                          id="name"
                          type="text"
                          name="name"
                          value={data.name}
                          onChange={getInputData}
                          placeholder="e.g. Maharaja Thali, Punjabi Special Thali"
                        />
                      </div>
                      {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="thaliType">Thali Type</label>
                      <select
                        className="form-select"
                        id="thaliType"
                        name="thaliType"
                        value={data.thaliType}
                        onChange={getInputData}
                      >
                        {THALI_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="servingFor">Serves (people)</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-people text-muted"></i></span>
                        <input
                          className="form-control"
                          id="servingFor"
                          type="number"
                          min="1"
                          name="servingFor"
                          value={data.servingFor}
                          onChange={getInputData}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Items */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">2</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Thali Items <span className="text-danger">*</span></h2>
                      <span className="text-muted small">
                        Pick dishes from your menu, or add custom items that are not in the menu
                      </span>
                    </div>
                  </div>

                  <ThaliItemsEditor
                    items={data.items}
                    onChange={setItems}
                    products={products}
                    showError={show}
                    error={error.items}
                  />
                </div>

                {/* 3. Pricing */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">3</span>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <h2 className="h6 mb-0 fw-bold">Pricing</h2>
                          <span className="text-muted small">Selling price, original price, and discount</span>
                        </div>
                        {discount > 0 && (
                          <span className="badge fs-6" style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 12px" }}>
                            <i className="bi bi-tag-fill me-1"></i>{discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="originalPrice">
                        Original Price (MRP)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text fw-bold">₹</span>
                        <input
                          className={`form-control ${show && error.originalPrice ? "is-invalid" : ""}`}
                          id="originalPrice"
                          type="number"
                          min="0"
                          placeholder="e.g. 350 (optional)"
                          value={data.originalPrice}
                          onChange={(e) => setPrices(data.price, e.target.value)}
                        />
                      </div>
                      <div className="form-text">Leave empty if there is no discount.</div>
                      {show && error.originalPrice && (
                        <div className="text-danger small mt-1">{error.originalPrice}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="price">
                        Selling Price <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text fw-bold">₹</span>
                        <input
                          className={`form-control ${show && error.price ? "is-invalid" : ""}`}
                          id="price"
                          type="number"
                          min="0"
                          placeholder="e.g. 299"
                          value={data.price}
                          onChange={(e) => setPrices(e.target.value, data.originalPrice)}
                        />
                      </div>
                      <div className="form-text">What the customer pays.</div>
                      {show && error.price && <div className="text-danger small mt-1">{error.price}</div>}
                    </div>
                  </div>

                  <div className="p-3 rounded-3" style={{ background: "var(--admin-surface-soft)", border: "1px dashed var(--admin-border)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                      <div>
                        <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                          <i className="bi bi-percent me-1 text-primary"></i> Discount
                        </span>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Calculated from the two prices. Use a quick pick to set the selling price from the original price.
                        </div>
                      </div>
                      <span className="fw-bold">{discount}%</span>
                    </div>

                    <div className="discount-meter-track mb-2">
                      <div className="discount-meter-fill" style={{ width: `${Math.min(discount, 100)}%` }}></div>
                    </div>

                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <span className="text-muted me-1" style={{ fontSize: "0.75rem" }}>Quick:</span>
                      {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          disabled={!(parseFloat(data.originalPrice) > 0)}
                          className={`discount-quick-btn ${discount === pct ? "active" : ""}`}
                          onClick={() => applyDiscount(pct)}
                        >
                          {pct === 0 ? "None" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Media & Description */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">4</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Thali Media &amp; Description</h2>
                      <span className="text-muted small">Upload a photo and describe the thali</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">Thali Photo</label>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${imageMode === "file" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => handleModeChange("file")}
                          >
                            <i className="bi bi-upload me-1"></i> Upload File
                          </button>
                          <button
                            type="button"
                            className={`btn ${imageMode === "url" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => handleModeChange("url")}
                          >
                            <i className="bi bi-link-45deg me-1"></i> Paste Link
                          </button>
                        </div>
                      </div>

                      {imageMode === "file" ? (
                        <div>
                          <input
                            id="image"
                            type="file"
                            name="image"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                          />
                          <div className="form-text">Choose a high-res photo (JPG, PNG, WEBP). Max 5MB.</div>
                        </div>
                      ) : (
                        <div>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-link-45deg text-muted"></i></span>
                            <input
                              id="imageUrl"
                              type="url"
                              name="imageUrl"
                              className="form-control"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={imageUrl}
                              onChange={handleUrlChange}
                            />
                          </div>
                          <div className="form-text">Paste a direct image link (Unsplash, Cloudinary, etc.)</div>
                        </div>
                      )}

                      {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}

                      {imagePreview && (
                        <div
                          className="mt-3 p-2 rounded-3 border d-inline-flex flex-column align-items-start"
                          style={{ background: "var(--admin-surface-soft)", borderColor: "var(--admin-border)" }}
                        >
                          <div className="d-flex align-items-center justify-content-between w-100 mb-1">
                            <span className="text-muted small fw-semibold">Photo Preview:</span>
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-danger p-0 ms-3"
                              onClick={() => {
                                setImagePreview(null);
                                setData((old) => ({ ...old, pic: null }));
                                setImageUrl("");
                              }}
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </div>
                          <img
                            src={imagePreview}
                            alt="Thali Preview"
                            className="rounded border"
                            style={{ height: 110, width: 180, objectFit: "cover", borderColor: "var(--admin-border)" }}
                            onError={() => {
                              if (imageMode === "url") {
                                setError((old) => ({ ...old, pic: "Failed to load image from URL. Check link." }));
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-12 mt-3">
                      <label className="form-label fw-semibold">
                        Description <span className="text-danger">*</span>
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={data.description}
                        onChange={(value) => {
                          setData((old) => ({ ...old, description: value }));
                          setError((old) => ({
                            ...old,
                            description: value && value !== EMPTY_DESC ? "" : "Description is Mandatory",
                          }));
                        }}
                        className="quill-editor rounded"
                        placeholder="Describe what makes this thali special, portion sizes, and serving suggestions..."
                      />
                      {show && error.description && (
                        <div className="text-danger small mt-1">{error.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Availability */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">5</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Availability</h2>
                      <span className="text-muted small">Control whether customers can order this thali</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="isAvailable">Order Availability</label>
                      <select
                        className="form-select"
                        id="isAvailable"
                        name="isAvailable"
                        value={data.isAvailable ? "1" : "0"}
                        onChange={getInputData}
                      >
                        <option value="1">Available (Accept Orders)</option>
                        <option value="0">Unavailable (Temporarily Off the Menu)</option>
                      </select>
                      <div className="form-text">Turn off when the kitchen cannot prepare this thali.</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-end gap-2 my-2">
                  <Link className="btn btn-outline-secondary px-4" to="/thali">Cancel</Link>
                  <button className="btn btn-primary px-4 shadow-xs" type="button" onClick={postSubmit}>
                    <i className="bi bi-check-circle me-1" aria-hidden="true"></i> Create Thali
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-3 sticky-top" style={{ top: "1.5rem" }}>
                {/* Live Card Preview */}
                <div className="panel shadow-sm">
                  <div
                    className="panel-header border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <span className="badge bg-primary-subtle text-primary fw-semibold">
                      <i className="bi bi-eye me-1"></i> Live Card Preview
                    </span>
                    <span className={`badge ${data.isAvailable ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                      {data.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div
                    className="card shadow-sm border overflow-hidden"
                    style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)", borderRadius: "var(--radius)" }}
                  >
                    <div className="position-relative" style={{ height: 160, background: "var(--admin-surface-soft)" }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                          <i className="bi bi-image fs-1 mb-1"></i>
                          <span className="small">No image chosen yet</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="position-absolute top-0 start-0 m-2 badge bg-danger shadow-sm">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span
                          className="badge small"
                          style={{ background: "var(--admin-surface-soft)", color: "var(--admin-text)", border: "1px solid var(--admin-border)" }}
                        >
                          {data.thaliType}
                        </span>
                        <span className="small text-muted">
                          <i className="bi bi-people me-1"></i>Serves {Math.max(1, parseInt(data.servingFor, 10) || 1)}
                        </span>
                      </div>

                      <h5 className="card-title mb-1 fw-bold text-truncate" style={{ color: "var(--admin-text)" }} title={data.name}>
                        {data.name || "Untitled Thali Name"}
                      </h5>

                      <p className="card-text text-muted small mb-2" title={previewItems.join(", ")}>
                        <i className="bi bi-basket2 me-1 text-primary"></i>
                        {previewItems.length ? previewItems.join(", ") : "Items will appear here..."}
                      </p>

                      <hr style={{ borderColor: "var(--admin-border)" }} className="my-2" />

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {hasPrice ? (
                            <>
                              <strong className="text-success fs-5">₹{parseFloat(data.price)}</strong>
                              {discount > 0 && (
                                <span className="text-muted text-decoration-line-through ms-2 small">
                                  ₹{parseFloat(data.originalPrice)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted fst-italic small">Price pending...</span>
                          )}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-primary py-0 px-2" disabled>
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completeness */}
                <div className="panel">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h2 className="h6 mb-0 section-title">
                      <i className="bi bi-list-check" aria-hidden="true"></i>
                      <span>Thali Completeness</span>
                    </h2>
                    <span className="badge bg-primary-subtle text-primary fw-bold">{progressPercent}%</span>
                  </div>

                  <div className="progress mb-3" style={{ height: 6 }}>
                    <div
                      className={`progress-bar ${progressPercent === 100 ? "bg-success" : "bg-primary"}`}
                      role="progressbar"
                      style={{ width: `${progressPercent}%` }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="activity-list">
                    {steps.map(({ title, done }) => (
                      <div key={title} className="activity-item">
                        <span className={`activity-dot ${done ? "bg-success" : "bg-secondary"}`} />
                        <div className="w-100 d-flex align-items-center justify-content-between">
                          <span
                            className="small"
                            style={{ color: done ? "var(--admin-text)" : "var(--admin-muted)", fontWeight: done ? 600 : 400 }}
                          >
                            {title}
                          </span>
                          <span className="small text-muted">
                            {done ? <i className="bi bi-check text-success fs-6"></i> : <i className="bi bi-dash text-muted"></i>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}