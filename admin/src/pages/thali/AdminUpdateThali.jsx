// ─── AdminUpdateThali.jsx ────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { updateThali, getThali } from "../../Redux/ActionCreators/ThaliActionCreators";
import { getProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import ThaliItemsEditor, {
  THALI_TYPES,
  itemsFromServer,
  serializeItems,
  validateItems,
  priceErrors,
  discountPercent,
  itemLabel,
} from "./ThaliItemsEditor";

const EMPTY_DESC = "<p><br></p>";

export default function AdminUpdateThali() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const [existingImage, setExistingImage] = useState("");
  const [imageMode, setImageMode] = useState("keep"); // "keep" | "file" | "url"
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState({
    name: "",
    items: "",
    price: "",
    originalPrice: "",
    description: "",
    pic: "",
  });

  const [show, setShow] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const loadedRef = useRef(false); // fill the form once, so later store refreshes don't wipe edits

  const ThaliStateData = useSelector((state) => state.ThaliStateData);
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const products = Array.isArray(ProductStateData) ? ProductStateData : [];

  useEffect(() => {
    dispatch(getThali());
    dispatch(getProduct());
  }, [dispatch]);

  useEffect(() => {
    if (loadedRef.current || !Array.isArray(ThaliStateData) || !ThaliStateData.length) return;
    const item = ThaliStateData.find((x) => x._id === _id);
    if (!item) {
      setNotFound(true);
      return;
    }
    loadedRef.current = true;
    setNotFound(false);
    setData({
      name: item.name ?? "",
      items: itemsFromServer(item.items),
      description: item.description ?? "",
      price: item.price != null ? String(item.price) : "",
      originalPrice: item.originalPrice ? String(item.originalPrice) : "",
      servingFor: item.servingFor ?? 1,
      thaliType: item.thaliType ?? "Special",
      isAvailable: item.isAvailable ?? true,
      pic: null,
    });
    setExistingImage(item.image ?? "");
    setImagePreview(item.image ?? "");
  }, [ThaliStateData, _id]);

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
      setImagePreview(existingImage);
    }
  }

  function handleUrlChange(e) {
    const url = e.target.value;
    setImageUrl(url);
    if (!url.trim()) {
      setError((old) => ({ ...old, pic: "" }));
      setImagePreview(existingImage);
    } else if (!/^https?:\/\//i.test(url.trim())) {
      setError((old) => ({ ...old, pic: "Please enter a valid HTTP or HTTPS image URL" }));
      setImagePreview(existingImage);
    } else {
      setError((old) => ({ ...old, pic: "" }));
      setImagePreview(url.trim());
    }
  }

  function handleModeChange(mode) {
    setImageMode(mode);
    setError((old) => ({ ...old, pic: "" }));

    if (mode === "keep") {
      setImagePreview(existingImage);
      setData((old) => ({ ...old, pic: null }));
      setImageUrl("");
    } else if (mode === "file") {
      setImagePreview(data.pic instanceof File ? URL.createObjectURL(data.pic) : existingImage);
    } else {
      setImagePreview(/^https?:\/\//i.test(imageUrl.trim()) ? imageUrl.trim() : existingImage);
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
    formData.append("_id", _id);
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
    } else {
      formData.append("image", existingImage);
      formData.append("existingImage", existingImage);
    }

    dispatch(updateThali(formData));
    navigate("/thali");
  }

  const previewItems = data.items.map((it) => itemLabel(it, products)).filter(Boolean);
  const hasPrice = parseFloat(data.price) >= 0;
  const pe = priceErrors(data.price, data.originalPrice);

  const checklist = [
    { title: "Thali Name", done: Boolean(data.name.trim()) },
    { title: "Items", done: !validateItems(data.items) },
    { title: "Pricing", done: !pe.price && !pe.originalPrice },
    { title: "Description", done: Boolean(data.description && data.description !== EMPTY_DESC) },
    { title: "Thali Photo (recommended)", done: Boolean(imagePreview || existingImage) },
  ];

  if (notFound) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-5 text-center">
          <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
          <h1 className="h4 mt-2">Thali not found</h1>
          <Link className="btn btn-outline-secondary btn-sm mt-2" to="/thali">Back to Thalis</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
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
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Catalogue Management</p>
                <h1 className="h3 mb-1">Update Thali</h1>
                <p className="text-muted mb-0">
                  Modify thali items, pricing, media, and availability.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-outline-secondary btn-sm" to="/thali">
                <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back to Thalis
              </Link>
            </div>
          </div>

          {/* Global Error Banner */}
          {show && Object.values(error).some(Boolean) && (
            <div className="alert alert-danger alert-dismissible shadow-sm mb-4" role="alert">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>
                  <strong>Please correct the following errors:</strong>
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
            <div className="col-12 col-xl-8">
              <div className="d-flex flex-column gap-3">
                {/* Panel 1: General */}
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-columns-gap" aria-hidden="true"></i>
                        <span>General Information</span>
                      </h2>
                      <p className="text-muted mb-0">Thali name, cuisine type, and serving size.</p>
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
                          placeholder="e.g. Maharaja Thali"
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

                {/* Panel 2: Items */}
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-basket2" aria-hidden="true"></i>
                        <span>Thali Items</span>
                      </h2>
                      <p className="text-muted mb-0">
                        Menu products and custom items included in this thali.
                      </p>
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

                {/* Panel 3: Pricing */}
                <div className="panel">
                  <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-currency-rupee" aria-hidden="true"></i>
                        <span>Pricing</span>
                      </h2>
                      <p className="text-muted mb-0">
                        The discount is calculated from the original and selling prices.
                      </p>
                    </div>
                    {discount > 0 && (
                      <span className="badge fs-6" style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 12px" }}>
                        <i className="bi bi-tag-fill me-1"></i>{discount}% OFF Active
                      </span>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="originalPrice">Original Price (MRP)</label>
                      <div className="input-group">
                        <span className="input-group-text fw-bold">₹</span>
                        <input
                          className={`form-control ${show && error.originalPrice ? "is-invalid" : ""}`}
                          id="originalPrice"
                          type="number"
                          min="0"
                          placeholder="Optional"
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
                          placeholder="Enter selling price"
                          value={data.price}
                          onChange={(e) => setPrices(e.target.value, data.originalPrice)}
                        />
                      </div>
                      <div className="form-text">What the customer pays.</div>
                      {show && error.price && <div className="text-danger small mt-1">{error.price}</div>}
                    </div>
                  </div>

                  <div className="p-3 rounded-3" style={{ background: "var(--admin-surface-soft)", border: "1px dashed var(--admin-border)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        <i className="bi bi-percent me-1 text-primary"></i> Discount
                      </span>
                      <span className="fw-bold">{discount}%</span>
                    </div>
                    <div className="discount-meter-track mb-2">
                      <div className="discount-meter-fill" style={{ width: `${Math.min(discount, 100)}%` }}></div>
                    </div>
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <span className="text-muted me-1" style={{ fontSize: "0.75rem" }}>Set selling price from MRP:</span>
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

                {/* Panel 4: Media */}
                <div className="panel">
                  <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-image" aria-hidden="true"></i>
                        <span>Thali Image</span>
                      </h2>
                      <p className="text-muted mb-0">
                        Keep the existing photo or update via upload or external link.
                      </p>
                    </div>
                    <div className="btn-group btn-group-sm" role="group" aria-label="Image Source Mode">
                      {[
                        ["keep", "bi-shield-check", "Current"],
                        ["file", "bi-upload", "Upload"],
                        ["url", "bi-link-45deg", "Paste URL"],
                      ].map(([mode, icon, label]) => (
                        <button
                          key={mode}
                          type="button"
                          className={`btn ${imageMode === mode ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => handleModeChange(mode)}
                        >
                          <i className={`bi ${icon} me-1`}></i> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      {imageMode === "keep" && (
                        <div
                          className="p-3 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2"
                          style={{ background: "var(--admin-surface-soft)", borderColor: "var(--admin-border)" }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            {existingImage ? (
                              <img
                                src={existingImage}
                                alt="Current Thali"
                                className="rounded border"
                                style={{ width: 64, height: 64, objectFit: "cover", borderColor: "var(--admin-border)" }}
                              />
                            ) : (
                              <div
                                className="rounded border d-flex align-items-center justify-content-center text-muted"
                                style={{ width: 64, height: 64, background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
                              >
                                <i className="bi bi-image"></i>
                              </div>
                            )}
                            <div>
                              <div className="fw-semibold small">Current Photo In Use</div>
                              <div className="text-muted small text-truncate" style={{ maxWidth: 360 }}>
                                {existingImage || "No image currently on file"}
                              </div>
                            </div>
                          </div>
                          {existingImage && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                              <i className="bi bi-check-circle me-1"></i> Active Image Preserved
                            </span>
                          )}
                        </div>
                      )}

                      {imageMode === "file" && (
                        <div>
                          <input
                            id="image"
                            type="file"
                            name="image"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                          />
                          <div className="form-text">
                            JPG, PNG, WEBP, GIF. Max 5MB. Leave empty to keep the existing image.
                          </div>
                        </div>
                      )}

                      {imageMode === "url" && (
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
                          <div className="form-text">Paste a direct image URL (Unsplash, Cloudinary, etc.)</div>
                        </div>
                      )}

                      {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}

                      {imageMode !== "keep" && imagePreview && (
                        <div
                          className="mt-3 p-2 rounded-3 border d-inline-flex flex-column align-items-start"
                          style={{ background: "var(--admin-surface-soft)", borderColor: "var(--admin-border)" }}
                        >
                          <div className="d-flex align-items-center justify-content-between w-100 mb-1">
                            <span className="text-muted small fw-semibold">New Image Preview:</span>
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-secondary p-0 ms-3"
                              onClick={() => handleModeChange("keep")}
                            >
                              <i className="bi bi-arrow-counterclockwise"></i> Revert to Current
                            </button>
                          </div>
                          <img
                            src={imagePreview}
                            alt="New Thali Preview"
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
                  </div>
                </div>

                {/* Panel 5: Description */}
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-file-text" aria-hidden="true"></i>
                        <span>Description</span>
                      </h2>
                      <p className="text-muted mb-0">What makes this thali special, and serving suggestions.</p>
                    </div>
                  </div>
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
                    placeholder="Write an appealing description of this thali..."
                  />
                  {show && error.description && (
                    <div className="text-danger small mt-1">{error.description}</div>
                  )}
                </div>

                {/* Panel 6: Availability */}
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-sliders" aria-hidden="true"></i>
                        <span>Availability</span>
                      </h2>
                      <p className="text-muted mb-0">Control whether customers can order this thali.</p>
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
                      <div className="form-text">Turn off if the kitchen cannot prepare this thali today.</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-end gap-2 my-3">
                  <Link className="btn btn-outline-secondary px-4" to="/thali">Cancel</Link>
                  <button className="btn btn-primary px-4 shadow-xs" type="button" onClick={postSubmit}>
                    <i className="bi bi-check-circle me-1" aria-hidden="true"></i> Update Thali
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-3 sticky-top" style={{ top: "1.5rem" }}>
                <div className="panel border-primary-subtle shadow-sm">
                  <div className="panel-header border-bottom pb-2 mb-3" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <span className="badge bg-primary-subtle text-primary fw-semibold">
                        <i className="bi bi-eye me-1"></i> Live Card Preview
                      </span>
                      <span className={`badge ${data.isAvailable ? "bg-success" : "bg-secondary"}`}>
                        {data.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
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
                          <span className="small">No image</span>
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
                        {previewItems.length ? previewItems.join(", ") : "No items"}
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

                <div className="panel">
                  <h2 className="h6 mb-3 section-title">
                    <i className="bi bi-list-check" aria-hidden="true"></i>
                    <span>Thali Completeness Checklist</span>
                  </h2>
                  {checklist.map(({ title, done }) => (
                    <div key={title} className="d-flex align-items-center gap-2 mb-2">
                      <i className={`bi ${done ? "bi-check-circle-fill text-success" : "bi-circle text-muted"}`}></i>
                      <span
                        className="small"
                        style={{ color: done ? "var(--admin-text)" : "var(--admin-muted)", fontWeight: done ? 600 : 400 }}
                      >
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}