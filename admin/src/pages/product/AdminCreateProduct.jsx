// ─── AdminCreateProduct.jsx ──────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { createProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";

const POPULAR_INGREDIENTS = [
  "Paneer", "Butter", "Cheese", "Tomato Gravy", "Garlic", "Spices", 
  "Fresh Cream", "Onions", "Capsicum", "Cashew Paste", "Green Chillies", "Coriander"
];

const DEFAULT_VARIANTS = [
  { name: "Half", price: "", available: true },
  { name: "Full", price: "", available: true },
];

export default function AdminCreateProduct() {
  const [data, setData] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    ingredient: "",
    variants: DEFAULT_VARIANTS,
    discount: 0,
    description: "",
    pic: null,
    availability: true,
    active: true,
  });

  const [imageMode, setImageMode] = useState("file"); // "file" | "url"
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState({
    name: "Name Field is Mandatory",
    maincategory: "Select a Main Category",
    subcategory: "Select a Sub Category",
    ingredient: "Ingredient Field is Mandatory",
    variants: "At Least One Variant Price Is Mandatory",
    pic: "Product Image is Mandatory",
    description: "",
  });

  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch, MaincategoryStateData.length]);

  useEffect(() => {
    dispatch(getSubcategory());
  }, [dispatch, SubcategoryStateData.length]);

  function getInputData(e) {
    const { name, value } = e.target;

    if (name === "name") {
      setError((old) => ({ ...old, name: formValidator(e) }));
    } else if (name === "ingredient") {
      setError((old) => ({
        ...old,
        ingredient: value.trim() ? "" : "Ingredient Field is Mandatory",
      }));
    } else if (name === "maincategory" || name === "subcategory") {
      const label = name === "maincategory" ? "Main Category" : "Sub Category";
      setError((old) => ({ ...old, [name]: value ? "" : `Select a ${label}` }));
    }

    setData((old) => ({
      ...old,
      [name]:
        name === "active" || name === "availability"
          ? value === "1"
          : name === "discount"
          ? Math.max(0, Math.min(100, Number(value) || 0))
          : value,
      ...(name === "maincategory" ? { subcategory: "" } : {}),
    }));
  }

  function handleAddIngredientChip(chip) {
    setData((old) => {
      const current = old.ingredient.trim();
      let updated = "";
      if (!current) {
        updated = chip;
      } else {
        const parts = current.split(",").map((p) => p.trim().toLowerCase());
        if (parts.includes(chip.toLowerCase())) {
          return old; // already exists
        }
        updated = `${current}, ${chip}`;
      }
      setError((prev) => ({ ...prev, ingredient: "" }));
      return { ...old, ingredient: updated };
    });
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const err = imageValidator(e);
      setError((old) => ({ ...old, pic: err || "" }));
      setData((old) => ({ ...old, pic: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setError((old) => ({ ...old, pic: "Product Image is Mandatory" }));
      setData((old) => ({ ...old, pic: null }));
      setImagePreview(null);
    }
  }

  function handleUrlChange(e) {
    const url = e.target.value;
    setImageUrl(url);
    if (!url.trim()) {
      setError((old) => ({ ...old, pic: "Image URL is required" }));
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
    if (mode === "file") {
      if (data.pic && data.pic instanceof File) {
        setError((old) => ({ ...old, pic: "" }));
        setImagePreview(URL.createObjectURL(data.pic));
      } else {
        setError((old) => ({ ...old, pic: "Please upload an image file" }));
        setImagePreview(null);
      }
    } else {
      if (imageUrl.trim() && /^https?:\/\//i.test(imageUrl.trim())) {
        setError((old) => ({ ...old, pic: "" }));
        setImagePreview(imageUrl.trim());
      } else {
        setError((old) => ({ ...old, pic: "Please paste a valid image URL" }));
        setImagePreview(null);
      }
    }
  }

  function getVariantData(index, field, value) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      );

      const hasValidVariant = variants.some(
        (v) => v.available && parseFloat(v.price) > 0
      );
      setError((oldError) => ({
        ...oldError,
        variants: hasValidVariant ? "" : "At Least One Variant Price Is Mandatory",
      }));

      return { ...old, variants };
    });
  }

  function postSubmit(e) {
    e.preventDefault();

    let picErr = "";
    if (imageMode === "file") {
      if (!data.pic || !(data.pic instanceof File)) {
        picErr = "Please upload an image file.";
      }
    } else {
      if (!imageUrl.trim()) {
        picErr = "Please paste an image URL.";
      } else if (!/^https?:\/\//i.test(imageUrl.trim())) {
        picErr = "Please enter a valid HTTP or HTTPS image URL.";
      }
    }

    const nameErr = data.name.trim() === "" ? "Dish Name is Mandatory" : "";
    const mainErr = !data.maincategory ? "Select a Main Category" : "";
    const subErr = !data.subcategory ? "Select a Sub Category" : "";
    const ingErr = data.ingredient.trim() === "" ? "Ingredient Field is Mandatory" : "";
    const descErr =
      data.description.trim() === "" || data.description === "<p><br></p>"
        ? "Description is Mandatory"
        : "";

    const hasValidVariant = data.variants.some((v) => v.available && parseFloat(v.price) > 0);
    const varErr = hasValidVariant ? "" : "At Least One Variant Price Is Mandatory";

    if (nameErr || mainErr || subErr || ingErr || varErr || picErr || descErr) {
      setError({
        name: nameErr,
        maincategory: mainErr,
        subcategory: subErr,
        ingredient: ingErr,
        variants: varErr,
        pic: picErr,
        description: descErr,
      });
      setShow(true);
      return;
    }

    const cleanedVariants = data.variants
      .filter((v) => v.available && parseFloat(v.price) > 0)
      .map((v) => {
        const p = parseFloat(v.price);
        const finalP = Math.round(p - (p * (data.discount || 0)) / 100);
        return {
          name: v.name,
          price: p,
          finalPrice: finalP,
          available: true,
        };
      });

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("maincategory", data.maincategory);
    formData.append("subcategory", data.subcategory);
    formData.append("ingredient", data.ingredient.trim());
    formData.append("variants", JSON.stringify(cleanedVariants));
    formData.append("discount", data.discount || 0);
    formData.append("description", data.description);
    formData.append("availability", data.availability);
    formData.append("active", data.active);

    if (imageMode === "file" && data.pic) {
      formData.append("pic", data.pic);
    } else if (imageMode === "url" && imageUrl.trim()) {
      formData.append("pic", imageUrl.trim());
      formData.append("picUrl", imageUrl.trim());
    }

    dispatch(createProduct(formData));
    navigate("/product");
  }

  // Calculate completeness score (0 to 100%)
  const steps = [
    { title: "Dish Name", done: Boolean(data.name.trim()) },
    { title: "Category", done: Boolean(data.maincategory && data.subcategory) },
    { title: "Ingredients", done: Boolean(data.ingredient.trim()) },
    {
      title: "Portion Pricing",
      done: data.variants.some((v) => v.available && parseFloat(v.price) > 0),
    },
    { title: "Dish Photo", done: Boolean(imagePreview) },
    {
      title: "Description",
      done: Boolean(data.description && data.description !== "<p><br></p>"),
    },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  const selectedMain = MaincategoryStateData?.find((m) => m._id === data.maincategory)?.name;
  const selectedSub = SubcategoryStateData?.find((s) => s._id === data.subcategory)?.name;

  return (
    <>
      <style>{`
        .chip-btn {
          font-size: 0.76rem;
          padding: 3px 8px;
          border-radius: 20px;
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-soft);
          color: var(--admin-text);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chip-btn:hover {
          background: var(--admin-primary);
          color: #ffffff;
          border-color: var(--admin-primary);
          transform: translateY(-1px);
        }
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
        /* ── Variant Pricing Cards ── */
        .variant-card {
          border-radius: 14px;
          border: 2px solid var(--admin-border);
          overflow: hidden;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .variant-card.is-active {
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-primary) 12%, transparent);
        }
        .variant-card.is-disabled {
          opacity: 0.55;
          border-color: var(--admin-border);
        }
        .variant-card-header {
          padding: 0.7rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .variant-card-header.half-header {
          background: linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%);
        }
        html[data-theme="dark"] .variant-card-header.half-header {
          background: linear-gradient(135deg, #1e2340 0%, #252b50 100%);
        }
        .variant-card-header.full-header {
          background: linear-gradient(135deg, #fff5eb 0%, #ffebd4 100%);
        }
        html[data-theme="dark"] .variant-card-header.full-header {
          background: linear-gradient(135deg, #2a1f0e 0%, #30250e 100%);
        }
        .variant-card-body {
          padding: 0.85rem 1rem;
          background: var(--admin-surface);
        }
        .variant-badge {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 3px 9px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .variant-badge.half { background: #dde4ff; color: #3451b2; }
        html[data-theme="dark"] .variant-badge.half { background: #2a3166; color: #a5b4fc; }
        .variant-badge.full { background: #fde8cc; color: #b45309; }
        html[data-theme="dark"] .variant-badge.full { background: #3a2310; color: #fbbf24; }
        .savings-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        html[data-theme="dark"] .savings-pill {
          background: #14532d;
          color: #86efac;
          border-color: #166534;
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
        .discount-quick-btn:hover {
          background: var(--admin-primary);
          color: #fff;
          border-color: var(--admin-primary);
        }
        .discount-quick-btn.active {
          background: var(--admin-primary);
          color: #fff;
          border-color: var(--admin-primary);
        }
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
                <h1 className="h3 mb-1">Add New Dish</h1>
                <p className="text-muted mb-0">
                  Quickly build, price, and publish a new item to your restaurant menu.
                </p>
              </div>
            </div>
            <div className="heading-actions d-flex gap-2">
              <Link className="btn btn-outline-secondary btn-sm" to="/product">
                <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back
              </Link>
              <button
                className="btn btn-primary btn-sm px-3 shadow-xs"
                type="button"
                onClick={postSubmit}
              >
                <i className="bi bi-check-circle me-1" aria-hidden="true"></i> Save Dish
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
              <button
                type="button"
                className="btn-close"
                onClick={() => setShow(false)}
                aria-label="Close"
              />
            </div>
          )}

          <section className="row g-4">
            {/* Form Column */}
            <div className="col-12 col-xl-8">
              <div className="d-flex flex-column gap-3">
                {/* 1. Basic Details */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">1</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Dish Essentials</h2>
                      <span className="text-muted small">Name, category assignment, and ingredients</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold" htmlFor="name">
                        Dish Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-tag text-muted"></i>
                        </span>
                        <input
                          className={`form-control ${show && error.name ? "is-invalid" : ""}`}
                          id="name"
                          type="text"
                          name="name"
                          value={data.name}
                          onChange={getInputData}
                          placeholder="e.g. Paneer Butter Masala, Schezwan Fried Rice"
                        />
                      </div>
                      {show && error.name && (
                        <div className="text-danger small mt-1">{error.name}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="maincategory">
                        Main Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${show && error.maincategory ? "is-invalid" : ""}`}
                        id="maincategory"
                        name="maincategory"
                        value={data.maincategory}
                        onChange={getInputData}
                      >
                        <option value="" disabled>Select Category</option>
                        {MaincategoryStateData?.filter((x) => x.active).map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {show && error.maincategory && (
                        <div className="text-danger small mt-1">{error.maincategory}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="subcategory">
                        Sub Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${show && error.subcategory ? "is-invalid" : ""}`}
                        id="subcategory"
                        name="subcategory"
                        value={data.subcategory}
                        onChange={getInputData}
                        disabled={!data.maincategory}
                      >
                        <option value="" disabled>
                          {data.maincategory ? "Select Sub Category" : "Pick Main Category first"}
                        </option>
                        {SubcategoryStateData?.filter(
                          (x) =>
                            x.active &&
                            (x.maincategory?._id ?? x.maincategory) === data.maincategory
                        ).map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {show && error.subcategory && (
                        <div className="text-danger small mt-1">{error.subcategory}</div>
                      )}
                    </div>

                    {/* Ingredients with quick-add pills */}
                    <div className="col-12">
                      <label className="form-label fw-semibold" htmlFor="ingredient">
                        Ingredients List <span className="text-danger">*</span>
                      </label>
                      <div className="input-group mb-2">
                        <span className="input-group-text">
                          <i className="bi bi-basket2 text-muted"></i>
                        </span>
                        <input
                          className={`form-control ${show && error.ingredient ? "is-invalid" : ""}`}
                          id="ingredient"
                          type="text"
                          name="ingredient"
                          value={data.ingredient}
                          onChange={getInputData}
                          placeholder="e.g. Cottage cheese, Cashew gravy, Cream, Butter, Fenugreek"
                        />
                      </div>

                      {/* Quick Add Suggestion Chips */}
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <span className="text-muted small me-1">
                          <i className="bi bi-lightning-charge me-1"></i>Quick add:
                        </span>
                        {POPULAR_INGREDIENTS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="chip-btn"
                            onClick={() => handleAddIngredientChip(item)}
                          >
                            + {item}
                          </button>
                        ))}
                      </div>

                      {show && error.ingredient && (
                        <div className="text-danger small mt-1">{error.ingredient}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Portions & Pricing */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">2</span>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <h2 className="h6 mb-0 fw-bold">Portions &amp; Variant Pricing</h2>
                          <span className="text-muted small">Configure Half / Full prices and optional dish discounts</span>
                        </div>
                        {data.discount > 0 && (
                          <span className="badge fs-6" style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 12px" }}>
                            <i className="bi bi-tag-fill me-1"></i>{data.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variant Cards */}
                  <div className="row g-3 mb-3">
                    {data.variants.map((variant, index) => {
                      const priceNum = parseFloat(variant.price) || 0;
                      const finalNum = Math.round(priceNum - (priceNum * (data.discount || 0)) / 100);
                      const savedAmt = priceNum - finalNum;
                      const isHalf = variant.name === "Half";

                      return (
                        <div className="col-md-6" key={variant.name}>
                          <div className={`variant-card ${variant.available ? "is-active" : "is-disabled"}`}>
                            {/* Card Header */}
                            <div className={`variant-card-header ${isHalf ? "half-header" : "full-header"}`}>
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${isHalf ? "bi-pie-chart-fill" : "bi-circle-fill"} fs-5`}
                                   style={{ color: isHalf ? "#4f46e5" : "#d97706" }}></i>
                                <div>
                                  <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{variant.name} Portion</div>
                                  <span className={`variant-badge ${isHalf ? "half" : "full"}`}>
                                    {isHalf ? "Small" : "Regular"}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {variant.available && priceNum > 0 && (
                                  <span className="savings-pill">
                                    <i className="bi bi-check-circle-fill"></i>
                                    {data.discount > 0 ? `Save ₹${savedAmt}` : `₹${finalNum}`}
                                  </span>
                                )}
                                <div className="form-check form-switch mb-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={`variant-switch-${index}`}
                                    checked={variant.available}
                                    onChange={(e) => getVariantData(index, "available", e.target.checked)}
                                  />
                                  <label className="form-check-label small fw-semibold" htmlFor={`variant-switch-${index}`}>
                                    {variant.available ? "On" : "Off"}
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="variant-card-body">
                              <label className="form-label small fw-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>
                                Base Price (MRP)
                              </label>
                              <div className="input-group">
                                <span className="input-group-text fw-bold">₹</span>
                                <input
                                  className={`form-control form-control-lg ${
                                    show && error.variants && variant.available && !priceNum ? "is-invalid" : ""
                                  }`}
                                  type="number"
                                  min="0"
                                  placeholder={isHalf ? "e.g. 180" : "e.g. 320"}
                                  value={variant.price}
                                  disabled={!variant.available}
                                  onChange={(e) => getVariantData(index, "price", e.target.value)}
                                  style={{ fontSize: "1.05rem", fontWeight: 600 }}
                                />
                              </div>

                              {/* Live price breakdown */}
                              {variant.available && priceNum > 0 && (
                                <div className="mt-2 p-2 rounded-2 d-flex align-items-center justify-content-between"
                                     style={{ background: "var(--admin-surface-soft)", border: "1px solid var(--admin-border)" }}>
                                  <div className="d-flex flex-column">
                                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>CUSTOMER PAYS</span>
                                    <div className="d-flex align-items-baseline gap-2">
                                      {data.discount > 0 && (
                                        <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.85rem" }}>₹{priceNum}</span>
                                      )}
                                      <span className="fw-bold text-success" style={{ fontSize: "1.2rem" }}>₹{finalNum}</span>
                                    </div>
                                  </div>
                                  {data.discount > 0 && (
                                    <div className="text-end">
                                      <span className="text-muted" style={{ fontSize: "0.7rem" }}>YOU SAVE</span>
                                      <div className="fw-bold text-danger" style={{ fontSize: "0.9rem" }}>₹{savedAmt}</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {!variant.available && (
                                <div className="mt-2 text-center text-muted small py-1" style={{ background: "var(--admin-surface-soft)", borderRadius: 8 }}>
                                  <i className="bi bi-dash-circle me-1"></i>This portion is disabled
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {show && error.variants && (
                      <div className="col-12">
                        <div className="alert alert-danger py-2 px-3 mb-0 small">
                          <i className="bi bi-exclamation-circle me-1"></i>{error.variants}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount Section */}
                  <div className="p-3 rounded-3" style={{ background: "var(--admin-surface-soft)", border: "1px dashed var(--admin-border)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                      <div>
                        <label className="fw-semibold mb-0" htmlFor="discount" style={{ fontSize: "0.9rem" }}>
                          <i className="bi bi-percent me-1 text-primary"></i> Special Discount
                        </label>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>Applied globally across all active portions</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ width: 120 }}>
                          <input
                            className="form-control fw-bold text-center"
                            id="discount"
                            type="number"
                            name="discount"
                            min="0"
                            max="100"
                            value={data.discount}
                            onChange={getInputData}
                          />
                          <span className="input-group-text fw-bold">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual meter */}
                    <div className="discount-meter-track mb-2">
                      <div className="discount-meter-fill" style={{ width: `${data.discount}%` }}></div>
                    </div>

                    {/* Quick-pick buttons */}
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <span className="text-muted me-1" style={{ fontSize: "0.75rem" }}>Quick:</span>
                      {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          className={`discount-quick-btn ${data.discount === pct ? "active" : ""}`}
                          onClick={() => setData((old) => ({ ...old, discount: pct }))}
                        >
                          {pct === 0 ? "None" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Media & Description */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">3</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Dish Media & Description</h2>
                      <span className="text-muted small">Upload cover photo and write description</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">
                          Dish Photo <span className="text-danger">*</span>
                        </label>
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
                            id="pic"
                            type="file"
                            name="pic"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                          />
                          <div className="form-text">Choose a high-res photo (JPG, PNG, WEBP). Max 5MB.</div>
                        </div>
                      ) : (
                        <div>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-link-45deg text-muted"></i>
                            </span>
                            <input
                              id="picUrl"
                              type="url"
                              name="picUrl"
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
                          className="mt-3 p-2.5 rounded-3 border d-inline-flex flex-column align-items-start"
                          style={{
                            background: "var(--admin-surface-soft)",
                            borderColor: "var(--admin-border)",
                          }}
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
                            alt="Dish Preview"
                            className="rounded border"
                            style={{
                              height: 110,
                              width: 180,
                              objectFit: "cover",
                              borderColor: "var(--admin-border)",
                            }}
                            onError={() => {
                              if (imageMode === "url") {
                                setError((old) => ({
                                  ...old,
                                  pic: "Failed to load image from URL. Check link.",
                                }));
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quill Description */}
                    <div className="col-12 mt-3">
                      <label className="form-label fw-semibold">
                        Detailed Description <span className="text-danger">*</span>
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={data.description}
                        onChange={(value) => {
                          setData((old) => ({ ...old, description: value }));
                          if (value && value !== "<p><br></p>") {
                            setError((old) => ({ ...old, description: "" }));
                          }
                        }}
                        className="quill-editor rounded"
                        placeholder="Describe flavor notes, special spices, preparation method, and serving recommendations..."
                      />
                      {show && error.description && (
                        <div className="text-danger small mt-1">{error.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Visibility & Kitchen Status */}
                <div className="panel">
                  <div className="section-header-user">
                    <span className="section-number-pill">4</span>
                    <div>
                      <h2 className="h6 mb-0 fw-bold">Publishing & Availability</h2>
                      <span className="text-muted small">Control instant order acceptance and customer visibility</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="availability">
                        Order Availability
                      </label>
                      <select
                        className="form-select"
                        id="availability"
                        name="availability"
                        value={data.availability ? "1" : "0"}
                        onChange={getInputData}
                      >
                        <option value="1">In Stock (Accept Orders)</option>
                        <option value="0">Out of Stock (Temporarily Unavailable)</option>
                      </select>
                      <div className="form-text">Toggle off when kitchen runs out of key ingredients.</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="active">
                        Catalogue Visibility
                      </label>
                      <select
                        className="form-select"
                        id="active"
                        name="active"
                        value={data.active ? "1" : "0"}
                        onChange={getInputData}
                      >
                        <option value="1">Published (Visible to All Customers)</option>
                        <option value="0">Hidden / Draft (Hidden from Menu)</option>
                      </select>
                      <div className="form-text">Keep hidden while testing prices or recipes.</div>
                    </div>
                  </div>
                </div>

                {/* Form Bottom Actions */}
                <div className="d-flex flex-wrap justify-content-end gap-2 my-2">
                  <Link className="btn btn-outline-secondary px-4" to="/product">
                    Cancel
                  </Link>
                  <button
                    className="btn btn-primary px-4 shadow-xs"
                    type="button"
                    onClick={postSubmit}
                  >
                    <i className="bi bi-check-circle me-1" aria-hidden="true"></i> Create & Publish Dish
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Live Preview & Completeness Checklist */}
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
                    <span
                      className={`badge ${data.active ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}
                    >
                      {data.active ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Customer Menu Card Simulation */}
                  <div
                    className="card shadow-sm border overflow-hidden"
                    style={{
                      background: "var(--admin-surface)",
                      borderColor: "var(--admin-border)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      className="position-relative"
                      style={{ height: 160, background: "var(--admin-surface-soft)" }}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                          <i className="bi bi-image fs-1 mb-1"></i>
                          <span className="small">No image chosen yet</span>
                        </div>
                      )}

                      {data.discount > 0 && (
                        <span className="position-absolute top-0 start-0 m-2 badge bg-danger shadow-sm">
                          {data.discount}% OFF
                        </span>
                      )}

                      <span
                        className={`position-absolute bottom-0 end-0 m-2 badge ${
                          data.availability ? "bg-success" : "bg-warning text-dark"
                        }`}
                      >
                        {data.availability ? "In Stock" : "Unavailable"}
                      </span>
                    </div>

                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span
                          className="badge small"
                          style={{
                            background: "var(--admin-surface-soft)",
                            color: "var(--admin-text)",
                            border: "1px solid var(--admin-border)",
                          }}
                        >
                          {selectedMain || "Category"} {selectedSub ? `• ${selectedSub}` : ""}
                        </span>
                        <span className="small text-warning fw-bold">
                          <i className="bi bi-star-fill me-1"></i>5.0
                        </span>
                      </div>

                      <h5
                        className="card-title mb-1 fw-bold text-truncate"
                        style={{ color: "var(--admin-text)" }}
                        title={data.name}
                      >
                        {data.name || "Untitled Dish Name"}
                      </h5>

                      <p
                        className="card-text text-muted small text-truncate mb-2"
                        title={data.ingredient}
                      >
                        <i className="bi bi-basket2 me-1 text-primary"></i>
                        {data.ingredient || "Ingredients will appear here..."}
                      </p>

                      <hr
                        style={{ borderColor: "var(--admin-border)" }}
                        className="my-2"
                      />

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="small">
                          {data.variants.filter((v) => v.available && parseFloat(v.price) > 0).length > 0 ? (
                            data.variants
                              .filter((v) => v.available && parseFloat(v.price) > 0)
                              .map((v) => {
                                const p = parseFloat(v.price);
                                const f = Math.round(p - (p * (data.discount || 0)) / 100);
                                return (
                                  <span key={v.name} className="me-2">
                                    <span className="text-muted">{v.name}: </span>
                                    <strong className="text-success">₹{f}</strong>
                                  </span>
                                );
                              })
                          ) : (
                            <span className="text-muted fst-italic">Price pending...</span>
                          )}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-primary py-0 px-2" disabled>
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress & Checklist */}
                <div className="panel">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h2 className="h6 mb-0 section-title">
                      <i className="bi bi-list-check" aria-hidden="true"></i>
                      <span>Dish Completeness</span>
                    </h2>
                    <span className="badge bg-primary-subtle text-primary fw-bold">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
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
                        <span
                          className={`activity-dot ${done ? "bg-success" : "bg-secondary"}`}
                        />
                        <div className="w-100 d-flex align-items-center justify-content-between">
                          <span
                            className="small"
                            style={{
                              color: done ? "var(--admin-text)" : "var(--admin-muted)",
                              fontWeight: done ? 600 : 400,
                            }}
                          >
                            {title}
                          </span>
                          <span className="small text-muted">
                            {done ? (
                              <i className="bi bi-check text-success fs-6"></i>
                            ) : (
                              <i className="bi bi-dash text-muted"></i>
                            )}
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