// ─── AdminCreateCombo.jsx ────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { createCombo, getCombo } from "../../Redux/ActionCreators/ComboActionCreators";
import { getProduct } from "../../Redux/ActionCreators/ProductActionCreators"; // assumed to exist, mirrors getMaincategory

const checklist = [
    { dot: "bg-primary", title: "Combo Name", body: "Give the bundle a clear, customer-facing name." },
    { dot: "bg-success", title: "Select Products", body: "Pick at least two products to make it a combo." },
    { dot: "bg-info", title: "Cost Floor Formula", body: "Combo Cost Floor = Total COGS + Desired Profit to avoid selling at a loss." },
    { dot: "bg-warning", title: "Combo Image", body: "Upload an image file or paste an image URL." },
];

export default function AdminCreateCombo() {
    const [data, setData] = useState({ name: "", description: "", price: "", pic: "" });
    const [error, setError] = useState({
        name: "Combo Name is Mandatory",
        description: "Description is Mandatory",
        price: "Price is Mandatory",
        pic: "Image is required",
        items: "Select at least two products",
    });
    const [imageMode, setImageMode] = useState("file"); // "file" | "url"
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]); // array of product _id
    const [productSearch, setProductSearch] = useState("");
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const ComboStateData = useSelector((state) => state.ComboStateData);
    const ProductStateData = useSelector((state) => state.ProductStateData);
    const dispatch = useDispatch();

    function getInputData(e) {
        const name = e.target.name;
        const value = e.target.value;
        setError((old) => ({ ...old, [name]: formValidator(e) }));
        setData((old) => ({ ...old, [name]: value }));
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            const err = imageValidator(e);
            setError((old) => ({ ...old, pic: err || "" }));
            setData((old) => ({ ...old, pic: file }));
            setImagePreview(URL.createObjectURL(file));
        } else {
            setError((old) => ({ ...old, pic: "Image is required" }));
            setData((old) => ({ ...old, pic: "" }));
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

    function toggleItem(productId) {
        setSelectedItems((old) => {
            const next = old.includes(productId)
                ? old.filter((id) => id !== productId)
                : [...old, productId];
            setError((oldErr) => ({
                ...oldErr,
                items: next.length < 2 ? "Select at least two products" : "",
            }));
            return next;
        });
    }

    // helper: get the lowest variant finalPrice (falls back to price, then 0)
    const getMinPrice = (p) => {
        if (!p.variants || p.variants.length === 0) return p.price || 0;
        return Math.min(...p.variants.map((v) => v.finalPrice ?? v.price ?? 0));
    };

    const selectedProducts = (ProductStateData ?? []).filter((p) => selectedItems.includes(p._id));
    const [cogsOverrides, setCogsOverrides] = useState({});
    const [cogsPercent, setCogsPercent] = useState(40);
    const [minProfit, setMinProfit] = useState(50);

    const getItemCogs = (p) => {
        if (cogsOverrides[p._id] !== undefined && cogsOverrides[p._id] !== "") {
            return Number(cogsOverrides[p._id]);
        }
        return Math.round((getMinPrice(p) * cogsPercent) / 100);
    };

    const updateItemCogs = (productId, val) => {
        setCogsOverrides((prev) => ({
            ...prev,
            [productId]: val === "" ? "" : Math.max(0, Number(val)),
        }));
    };

    const applyGlobalCogsPercent = (pct) => {
        setCogsPercent(pct);
        const newOverrides = {};
        selectedProducts.forEach((p) => {
            newOverrides[p._id] = Math.round((getMinPrice(p) * pct) / 100);
        });
        setCogsOverrides(newOverrides);
    };

    const totalCogs = selectedProducts.reduce((sum, p) => sum + getItemCogs(p), 0);
    const comboCostFloor = totalCogs + (Number(minProfit) || 0);
    const mainPrice = selectedProducts.reduce((sum, p) => sum + getMinPrice(p), 0);

    const [customDiscount, setCustomDiscount] = useState(10);
    const [showCogsDetails, setShowCogsDetails] = useState(false);

    const maxSafeDiscountAmount = Math.max(0, mainPrice - comboCostFloor);
    const maxSafeDiscountPercent = mainPrice > 0 ? Math.floor((maxSafeDiscountAmount / mainPrice) * 100) : 0;

    const applyCustomDiscount = (pct) => {
        const p = Math.max(0, Math.min(100, Number(pct) || 0));
        setCustomDiscount(p);
        const discountAmt = Math.round((mainPrice * p) / 100);
        const finalP = Math.max(0, mainPrice - discountAmt);
        setData((prev) => ({ ...prev, price: finalP }));
        setError((prev) => ({ ...prev, price: "" }));
    };

    function handlePriceChange(e) {
        const val = e.target.value;
        setData((prev) => ({ ...prev, price: val }));
        if (mainPrice > 0 && val !== "") {
            const num = Number(val);
            if (num <= mainPrice) {
                const derivedPct = Math.round(((mainPrice - num) / mainPrice) * 100);
                setCustomDiscount(Math.max(0, derivedPct));
            } else {
                setCustomDiscount(0);
            }
        }
        // Numeric validation for a price field — formValidator is built for
        // generic required-text inputs and doesn't understand "> 0" numbers.
        const priceErr = val === "" || Number(val) <= 0 ? "Price must be greater than 0" : "";
        setError((old) => ({ ...old, price: priceErr }));
    }

    const applyCostFloorAsPrice = () => {
        setData((prev) => ({ ...prev, price: comboCostFloor }));
        if (mainPrice > 0) {
            const derivedPct = Math.round(((mainPrice - comboCostFloor) / mainPrice) * 100);
            setCustomDiscount(Math.max(0, derivedPct));
        }
        setError((prev) => ({ ...prev, price: "" }));
    };

    const filteredProducts = (ProductStateData ?? []).filter((p) =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const [submitting, setSubmitting] = useState(false);

    async function postSubmit(e) {
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

        const nameErr = data.name.trim() === "" ? "Combo Name is Mandatory" : "";
        const descErr = data.description.trim() === "" ? "Description is Mandatory" : "";
        const priceErr = data.price === "" || Number(data.price) <= 0 ? "Price must be greater than 0" : "";
        const itemsErr = selectedItems.length < 2 ? "Select at least two products" : "";

        if (nameErr || descErr || priceErr || picErr || itemsErr) {
            setError((old) => ({
                ...old,
                ...(nameErr ? { name: nameErr } : {}),
                ...(descErr ? { description: descErr } : {}),
                ...(priceErr ? { price: priceErr } : {}),
                ...(picErr ? { pic: picErr } : {}),
                ...(itemsErr ? { items: itemsErr } : {}),
            }));
            setShow(true);
            return;
        }

        const duplicate = ComboStateData.find(
            (x) => x.name.toLowerCase() === data.name.trim().toLowerCase()
        );
        if (duplicate) {
            setShow(true);
            setError((old) => ({ ...old, name: "Combo Already Exists" }));
            return;
        }

        // Profit Guard: the UI warns when price < cost floor, but nothing
        // previously stopped the save itself. Require explicit confirmation
        // before submitting a loss-making price.
        if (Number(data.price) < comboCostFloor) {
            const proceed = window.confirm(
                `This combo price (₹${data.price}) is below the calculated cost floor (₹${comboCostFloor}). ` +
                `You may be selling at a loss. Continue anyway?`
            );
            if (!proceed) return;
        }

        const formData = new FormData();
        formData.append("name", data.name.trim());
        formData.append("description", data.description.trim());
        formData.append("price", Number(data.price));
        selectedItems.forEach((id) => formData.append("items", id));
        formData.append("costFloor", comboCostFloor);
        formData.append("minProfit", Number(minProfit) || 0);
        formData.append("originalPrice", mainPrice);
        formData.append("discount", Number(customDiscount) || 0);
        formData.append(
            "products",
            JSON.stringify(
                selectedProducts.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    price: getMinPrice(p),
                    cogs: getItemCogs(p),
                }))
            )
        );

        if (imageMode === "file" && data.pic) {
            // Only append as "pic" — multer expects exactly this field name
            formData.append("pic", data.pic);
        } else if (imageMode === "url" && imageUrl.trim()) {
            formData.append("image", imageUrl.trim());
            formData.append("imageUrl", imageUrl.trim());
        }

        try {
            setSubmitting(true);
            // dispatch(createCombo(...)) is expected to be a thunk that returns a
            // promise which rejects on failure. We await it so a failed request
            // surfaces an error here instead of silently navigating away as if
            // the combo had been saved.
            await dispatch(createCombo(formData));
            navigate("/combo");
        } catch (err) {
            setShow(true);
            setError((old) => ({
                ...old,
                name: old.name || err?.message || "Could not create combo. Please try again.",
            }));
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        dispatch(getCombo());
        dispatch(getProduct());
    }, [dispatch, ComboStateData.length]);

    return (
        <main className="dashboard-content">
            <style>{`
                .pe-panel {
                    border: 1px solid var(--admin-border);
                    border-radius: var(--radius);
                    background: var(--admin-surface);
                    box-shadow: var(--admin-shadow-sm);
                    padding: 1.4rem;
                    transition: var(--admin-transition);
                }
                .pe-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--admin-border);
                    margin-bottom: 1.25rem;
                }
                .pe-icon-badge {
                    width: 38px;
                    height: 38px;
                    border-radius: var(--radius-sm);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--admin-primary);
                    color: #ffffff;
                    box-shadow: var(--admin-shadow-sm);
                    flex-shrink: 0;
                }
                .pe-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.78rem;
                    font-weight: 600;
                }
                .pe-badge.success {
                    background: color-mix(in srgb, var(--admin-success) 12%, var(--admin-surface));
                    color: var(--admin-success);
                    border: 1px solid color-mix(in srgb, var(--admin-success) 30%, transparent);
                }
                .pe-badge.danger {
                    background: color-mix(in srgb, var(--admin-danger) 10%, var(--admin-surface));
                    color: var(--admin-danger);
                    border: 1px solid color-mix(in srgb, var(--admin-danger) 30%, transparent);
                }
                .pe-empty-state {
                    text-align: center;
                    padding: 2rem 1rem;
                    color: var(--admin-muted);
                    font-size: 0.85rem;
                }
                .pe-table th, .pe-table td {
                    font-size: 0.82rem;
                }
                .pe-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                @media (max-width: 768px) {
                    .pe-stat-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .pe-stat-card {
                    padding: 1.15rem 1.25rem;
                    border-radius: var(--radius-sm);
                    background: var(--admin-surface-soft);
                    border: 1px solid var(--admin-border);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    transition: var(--admin-transition);
                }
                .pe-stat-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3.5px;
                    background: var(--stat-bar-color, var(--admin-primary));
                }
                .pe-stat-card.main-price {
                    --stat-bar-color: #64748b;
                }
                .pe-stat-card.cost-floor {
                    --stat-bar-color: var(--admin-primary);
                }
                .pe-stat-card.selling-price {
                    --stat-bar-color: var(--admin-success);
                    background: color-mix(in srgb, var(--admin-success) 4%, var(--admin-surface));
                    border-color: color-mix(in srgb, var(--admin-success) 25%, var(--admin-border));
                }
                .pe-stat-card.selling-price.risk {
                    --stat-bar-color: var(--admin-danger);
                    background: color-mix(in srgb, var(--admin-danger) 5%, var(--admin-surface));
                    border-color: color-mix(in srgb, var(--admin-danger) 28%, var(--admin-border));
                }
                .pe-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--admin-shadow);
                }
                .pe-stat-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--admin-muted);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .pe-stat-value {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: var(--admin-text);
                    line-height: 1.1;
                    margin: 0.4rem 0;
                    letter-spacing: -0.02em;
                }
                .pe-stat-meta {
                    font-size: 0.76rem;
                    color: var(--admin-muted);
                    line-height: 1.3;
                }
                .pe-control-box {
                    padding: 1.15rem;
                    border-radius: var(--radius-sm);
                    background: var(--admin-surface-soft);
                    border: 1px solid var(--admin-border);
                    margin-bottom: 1.15rem;
                }
                .pe-chip {
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    border: 1px solid var(--admin-border);
                    background: var(--admin-surface);
                    color: var(--admin-text);
                    cursor: pointer;
                    transition: var(--admin-transition);
                }
                .pe-chip:hover {
                    border-color: var(--admin-primary);
                    color: var(--admin-primary);
                }
                .pe-chip.active {
                    background: var(--admin-primary);
                    color: #ffffff;
                    border-color: var(--admin-primary);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
                }
                .pe-chip.safe-pill {
                    background: color-mix(in srgb, var(--admin-success) 10%, var(--admin-surface));
                    color: var(--admin-success);
                    border-color: color-mix(in srgb, var(--admin-success) 25%, transparent);
                }
                .pe-chip.safe-pill:hover,
                .pe-chip.safe-pill.active {
                    background: var(--admin-success);
                    color: #ffffff;
                    border-color: var(--admin-success);
                }
                .pe-formula-strip {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 0.65rem 0.9rem;
                    border-radius: var(--radius-sm);
                    background: var(--admin-surface);
                    border: 1px solid var(--admin-border);
                    margin-top: 0.85rem;
                    font-size: 0.82rem;
                }
                .pe-alert-risk {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: var(--radius-sm);
                    background: color-mix(in srgb, var(--admin-danger) 8%, var(--admin-surface));
                    border: 1px solid color-mix(in srgb, var(--admin-danger) 25%, transparent);
                    color: var(--admin-danger);
                    margin-bottom: 1.15rem;
                    font-size: 0.84rem;
                }
                .pe-drawer-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.8rem 1rem;
                    border-radius: var(--radius-sm);
                    background: var(--admin-surface-soft);
                    border: 1px solid var(--admin-border);
                    color: var(--admin-text);
                    font-size: 0.84rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--admin-transition);
                }
                .pe-drawer-btn:hover {
                    background: var(--admin-surface);
                    border-color: var(--admin-primary);
                }
                .pe-drawer-body {
                    padding: 1.15rem;
                    background: var(--admin-surface);
                    border: 1px solid var(--admin-border);
                    border-top: none;
                    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
                }
            `}</style>
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon"><i className="bi bi-plus-circle" aria-hidden="true"></i></span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Add Combo</h1>
                            <p className="text-muted mb-0">Bundle products together into a combo offer.</p>
                        </div>
                    </div>
                    <div className="heading-actions">
                        <Link className="btn btn-outline-secondary btn-sm" to="/combo">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back
                        </Link>
                    </div>
                </div>

                {show && (
                    <div className="alert alert-danger alert-dismissible" role="alert">
                        {Object.values(error).find((x) => x !== "")}
                        <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
                    </div>
                )}

                <section className="row g-3">
                    <div className="col-12 col-xl-8">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-box-seam" aria-hidden="true"></i>
                                        <span>Combo Information</span>
                                    </h2>
                                    <p className="text-muted mb-0">Fill in the details to create a new combo.</p>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="name">
                                        Combo Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="e.g. Royal Punjabi Feast Combo"
                                        value={data.name}
                                        onChange={getInputData}
                                    />
                                    {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="description">
                                        Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="1"
                                        className="form-control"
                                        placeholder="What's included and why it's a good deal"
                                        value={data.description}
                                        onChange={getInputData}
                                    />
                                    {show && error.description && <div className="text-danger small mt-1">{error.description}</div>}
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">
                                            Combo Image <span className="text-danger">*</span>
                                        </label>
                                        <div className="btn-group btn-group-sm" role="group" aria-label="Image Mode">
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
                                                <i className="bi bi-link-45deg me-1"></i> Paste URL
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
                                            <div className="form-text">Choose an image file from your device (JPG, PNG, WEBP, GIF).</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="input-group">
                                                <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                                                <input
                                                    id="picUrl"
                                                    type="url"
                                                    name="picUrl"
                                                    className="form-control"
                                                    placeholder="https://example.com/images/combo.jpg"
                                                    value={imageUrl}
                                                    onChange={handleUrlChange}
                                                />
                                            </div>
                                            <div className="form-text">Paste a direct image link.</div>
                                        </div>
                                    )}

                                    {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}

                                    {imagePreview && (
                                        <div className="mt-3 p-2 bg-light rounded border d-inline-flex flex-column align-items-start">
                                            <span className="text-muted small mb-1 fw-semibold">Preview:</span>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="rounded border"
                                                style={{ height: 80, maxWidth: 140, objectFit: "cover" }}
                                                onError={() => {
                                                    if (imageMode === "url") {
                                                        setError((old) => ({ ...old, pic: "Failed to load image from URL. Please check the link." }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">
                                            Products in this Combo <span className="text-danger">*</span>
                                        </label>
                                        <span className={`badge ${selectedItems.length < 2 ? "text-bg-secondary" : "text-bg-primary"}`}>
                                            {selectedItems.length} selected (min. 2)
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm mb-2"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                    <div className="border rounded" style={{ maxHeight: 260, overflowY: "auto" }}>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((p) => (
                                                <label
                                                    key={p._id}
                                                    className="d-flex align-items-center gap-2 px-2 py-2 border-bottom"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input mt-0"
                                                        checked={selectedItems.includes(p._id)}
                                                        onChange={() => toggleItem(p._id)}
                                                    />
                                                    {p.pic && (
                                                        <img src={p.pic} alt={p.name} style={{ width: 32, height: 32, objectFit: "cover" }} className="rounded border" />
                                                    )}
                                                    <span className="flex-grow-1">{p.name}</span>
                                                    <span className="d-flex flex-column align-items-end" style={{ lineHeight: 1.2 }}>
                                                        {p.variants?.length > 0 && (
                                                            <span className="text-muted" style={{ fontSize: "0.7rem", textDecoration: "line-through" }}>
                                                                ₹{Math.min(...p.variants.map((v) => v.price ?? 0))}
                                                            </span>
                                                        )}
                                                        <span className="text-success fw-semibold" style={{ fontSize: "0.8rem" }}>₹{getMinPrice(p)}</span>
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-muted small p-2 mb-0">No products found.</p>
                                        )}
                                    </div>
                                    {show && error.items && <div className="text-danger small mt-1">{error.items}</div>}
                                    {selectedProducts.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {selectedProducts.map((p) => (
                                                <span
                                                    key={p._id}
                                                    className="badge d-inline-flex align-items-center gap-1"
                                                    style={{ background: "var(--admin-primary)", color: "#fff", fontSize: "0.75rem", padding: "4px 8px", borderRadius: 20 }}
                                                >
                                                    {p.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleItem(p._id)}
                                                        style={{ background: "none", border: "none", color: "#fff", lineHeight: 1, cursor: "pointer", padding: "0 0 0 4px", fontSize: "0.8rem" }}
                                                        aria-label={`Remove ${p.name}`}
                                                    >×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {selectedProducts.length > 0 && (
                                        <div className="pe-formula-strip mt-2">
                                            <span className="text-muted">
                                                <i className="bi bi-bag me-1"></i>
                                                {selectedProducts.length} item{selectedProducts.length > 1 ? "s" : ""} selected
                                            </span>
                                            <span className="d-flex align-items-center gap-2">
                                                <span className="text-muted">Items sum:</span>
                                                <span className="fw-bold" style={{ color: "var(--admin-success)" }}>₹{selectedProducts.reduce((s, p) => s + getMinPrice(p), 0)}</span>
                                                {data.price !== "" && Number(data.price) > 0 && (
                                                    <>
                                                        <span className="text-muted">|</span>
                                                        <span className="text-muted">Combo price:</span>
                                                        <span className="fw-bold" style={{ color: "var(--admin-primary)" }}>₹{Number(data.price)}</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Pricing, Discount & Profit Guard ── */}
                                    <div className="mt-4">
                                        <div className="pe-panel">
                                            <div className="pe-header">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="pe-icon-badge">
                                                        <i className="bi bi-shield-check fs-6"></i>
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold" style={{ color: "var(--admin-text)", letterSpacing: "-0.01em" }}>
                                                            Pricing, Discount & Profit Guard
                                                        </h6>
                                                        <small className="text-muted">
                                                            Control discount on main price while safeguarding minimum profit floor.
                                                        </small>
                                                    </div>
                                                </div>

                                                {selectedProducts.length > 0 && (
                                                    Number(data.price) < comboCostFloor ? (
                                                        <span className="pe-badge danger">
                                                            <i className="bi bi-exclamation-triangle-fill"></i> Margin At Risk
                                                        </span>
                                                    ) : (
                                                        <span className="pe-badge success">
                                                            <i className="bi bi-check-circle-fill"></i>
                                                            Profit Protected (+₹{Number(data.price) > 0 ? Number(data.price) - totalCogs : 0})
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                            {selectedProducts.length === 0 ? (
                                                <div className="pe-empty-state">
                                                    <i className="bi bi-bag-check fs-3 d-block mb-2"></i>
                                                    Select products above to activate the pricing and custom discount engine.
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="pe-stat-grid">
                                                        <div className="pe-stat-card main-price">
                                                            <span className="pe-stat-label">Main Price (Items Sum)</span>
                                                            <div className="pe-stat-value">₹{mainPrice}</div>
                                                            <div className="pe-stat-meta">Total retail price of {selectedProducts.length} items</div>
                                                        </div>

                                                        <div className="pe-stat-card cost-floor">
                                                            <span className="pe-stat-label">
                                                                Combo Cost Floor
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0 text-decoration-none"
                                                                    style={{ fontSize: "0.75rem", color: "var(--admin-primary)" }}
                                                                    onClick={applyCostFloorAsPrice}
                                                                    title="Set price to cost floor"
                                                                >
                                                                    Use Floor
                                                                </button>
                                                            </span>
                                                            <div className="pe-stat-value" style={{ color: "var(--admin-primary)" }}>₹{comboCostFloor}</div>
                                                            <div className="pe-stat-meta">COGS (₹{totalCogs}) + Desired Profit (₹{minProfit || 0})</div>
                                                        </div>

                                                        <div className={`pe-stat-card selling-price ${Number(data.price) < comboCostFloor ? "risk" : ""}`}>
                                                            <span className="pe-stat-label">
                                                                Net Combo Price <span className="text-danger">*</span>
                                                            </span>
                                                            <div className="input-group input-group-sm my-1">
                                                                <span className="input-group-text bg-white fw-bold text-muted border-end-0">₹</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    name="price"
                                                                    className="form-control form-control-sm fw-bold border-start-0 fs-5"
                                                                    style={{ color: Number(data.price) < comboCostFloor ? "var(--admin-danger)" : "var(--admin-success)" }}
                                                                    value={data.price}
                                                                    onChange={handlePriceChange}
                                                                />
                                                            </div>
                                                            {show && error.price && <div className="text-danger small">{error.price}</div>}
                                                            <small
                                                                className="fw-medium"
                                                                style={{ color: Number(data.price) >= comboCostFloor ? "var(--admin-success)" : "var(--admin-danger)" }}
                                                            >
                                                                {Number(data.price) > 0 ? (
                                                                    <>Profit: ₹{Number(data.price) - totalCogs} ({Math.round(((Number(data.price) - totalCogs) / Number(data.price)) * 100)}% margin)</>
                                                                ) : (
                                                                    "Enter a valid price"
                                                                )}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    {/* Custom Discount on Main Price Controller */}
                                                    <div className="pe-control-box">
                                                        <div className="row g-2 align-items-center">
                                                            <div className="col-12 col-md-5">
                                                                <label className="form-label small fw-semibold mb-1 d-flex align-items-center justify-content-between" style={{ color: "var(--admin-text)" }}>
                                                                    <span>Custom Discount on Main Price:</span>
                                                                    {maxSafeDiscountPercent > 0 && (
                                                                        <span className="small" style={{ color: "var(--admin-success)", fontSize: "0.72rem" }}>
                                                                            Max Safe: {maxSafeDiscountPercent}%
                                                                        </span>
                                                                    )}
                                                                </label>
                                                                <div className="input-group input-group-sm">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        className="form-control fw-bold text-center"
                                                                        placeholder="0"
                                                                        value={customDiscount}
                                                                        onChange={(e) => applyCustomDiscount(e.target.value)}
                                                                    />
                                                                    <span className="input-group-text fw-bold">% OFF</span>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-md-7">
                                                                <label className="form-label small text-muted mb-1">
                                                                    Quick Discount Presets:
                                                                </label>
                                                                <div className="d-flex align-items-center flex-wrap gap-1">
                                                                    {[0, 5, 10, 15, 20].map((pct) => (
                                                                        <button
                                                                            key={pct}
                                                                            type="button"
                                                                            className={`pe-chip ${Number(customDiscount) === pct ? "active" : ""}`}
                                                                            onClick={() => applyCustomDiscount(pct)}
                                                                        >
                                                                            {pct === 0 ? "No Disc" : `${pct}%`}
                                                                        </button>
                                                                    ))}
                                                                    {maxSafeDiscountPercent > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            className={`pe-chip safe-pill ms-auto ${Number(customDiscount) === maxSafeDiscountPercent ? "active" : ""}`}
                                                                            onClick={() => applyCustomDiscount(maxSafeDiscountPercent)}
                                                                            title="Highest safe discount to maintain profit"
                                                                        >
                                                                            <i className="bi bi-shield-check me-1"></i> Safe Cap ({maxSafeDiscountPercent}%)
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pe-formula-strip">
                                                            <span className="text-muted">
                                                                Breakdown: ₹{mainPrice} main − ₹{Math.round((mainPrice * (Number(customDiscount) || 0)) / 100)} ({customDiscount}% off) = <strong style={{ color: "var(--admin-text)" }}>₹{data.price}</strong>
                                                            </span>
                                                            <span className="text-muted">
                                                                Customer Saves: <strong style={{ color: "var(--admin-success)" }}>₹{Math.round((mainPrice * (Number(customDiscount) || 0)) / 100)}</strong>
                                                            </span>
                                                        </div>

                                                        {/* Alert if Discount is too high */}
                                                        {data.price !== "" && Number(data.price) > 0 && Number(data.price) < comboCostFloor && (
                                                            <div className="pe-alert-risk mt-2 mb-0">
                                                                <div>
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    <strong>Discount is too high!</strong> Combo price (₹{data.price}) falls below Cost Floor (₹{comboCostFloor}) by ₹{comboCostFloor - Number(data.price)}.
                                                                </div>
                                                                {maxSafeDiscountPercent > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm py-0 px-2 rounded-pill"
                                                                        style={{ background: "var(--admin-danger)", color: "#fff", fontSize: "0.74rem", border: "none" }}
                                                                        onClick={() => applyCustomDiscount(maxSafeDiscountPercent)}
                                                                    >
                                                                        Cap to Safe {maxSafeDiscountPercent}%
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Collapsible COGS & Profit Details */}
                                                    <div className="rounded-3 border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
                                                        <button
                                                            type="button"
                                                            className="pe-drawer-btn"
                                                            onClick={() => setShowCogsDetails(!showCogsDetails)}
                                                        >
                                                            <span className="d-flex align-items-center gap-2">
                                                                <i className="bi bi-sliders" style={{ color: "var(--admin-primary)" }}></i>
                                                                Adjust Raw Item Costs (COGS) & Desired Profit Target
                                                            </span>
                                                            <span className="text-muted small">
                                                                {showCogsDetails ? "Hide Details ▲" : `View Raw Costs (₹${totalCogs}) ▼`}
                                                            </span>
                                                        </button>

                                                        {showCogsDetails && (
                                                            <div className="pe-drawer-body">
                                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                                                    <span className="small fw-semibold text-muted">Set Raw Item Costs (COGS):</span>
                                                                    <div className="d-flex align-items-center gap-1 flex-wrap">
                                                                        <span className="small text-muted" style={{ fontSize: "0.72rem" }}>Quick % of Price:</span>
                                                                        {[30, 35, 40, 50].map((pct) => (
                                                                            <button
                                                                                key={pct}
                                                                                type="button"
                                                                                className={`pe-chip ${cogsPercent === pct ? "active" : ""}`}
                                                                                style={{ padding: "0.2rem 0.6rem", fontSize: "0.72rem" }}
                                                                                onClick={() => applyGlobalCogsPercent(pct)}
                                                                            >
                                                                                {pct}%
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-borderless align-middle mb-2 pe-table">
                                                                        <thead style={{ borderBottom: "1px solid var(--admin-border)" }}>
                                                                            <tr>
                                                                                <th className="py-1 px-2">Item</th>
                                                                                <th className="py-1 px-2 text-center" style={{ width: 100 }}>Menu Price</th>
                                                                                <th className="py-1 px-2 text-end" style={{ width: 140 }}>COGS (Cost)</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {selectedProducts.map((p) => {
                                                                                const pPrice = getMinPrice(p);
                                                                                const cogsVal = getItemCogs(p);
                                                                                return (
                                                                                    <tr key={p._id} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                                                                                        <td className="py-1 px-2 fw-medium" style={{ color: "var(--admin-text)" }}>{p.name}</td>
                                                                                        <td className="py-1 px-2 text-center text-muted">₹{pPrice}</td>
                                                                                        <td className="py-1 px-2 text-end">
                                                                                            <div className="input-group input-group-sm ms-auto" style={{ maxWidth: 120 }}>
                                                                                                <span className="input-group-text py-0 px-2">₹</span>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    className="form-control py-0 px-2 text-end"
                                                                                                    value={cogsVal}
                                                                                                    onChange={(e) => updateItemCogs(p._id, e.target.value)}
                                                                                                />
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                        <tfoot>
                                                                            <tr>
                                                                                <td className="py-1 px-2 fw-bold" style={{ color: "var(--admin-text)" }}>Total COGS:</td>
                                                                                <td></td>
                                                                                <td className="py-1 px-2 text-end fw-bold" style={{ color: "var(--admin-text)" }}>₹{totalCogs}</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>

                                                                <div className="row g-2 align-items-center pt-2" style={{ borderTop: "1px solid var(--admin-border)" }}>
                                                                    <div className="col-12 col-sm-6">
                                                                        <label className="form-label small text-muted mb-1">
                                                                            Minimum Desired Profit Target (₹):
                                                                        </label>
                                                                        <div className="input-group input-group-sm">
                                                                            <span className="input-group-text">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                className="form-control"
                                                                                placeholder="50"
                                                                                value={minProfit}
                                                                                onChange={(e) => setMinProfit(e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-12 col-sm-6 text-sm-end">
                                                                        <div className="small text-muted">Formula Result:</div>
                                                                        <div className="small fw-semibold" style={{ color: "var(--admin-primary)" }}>
                                                                            Floor = ₹{totalCogs} (COGS) + ₹{Number(minProfit) || 0} (Profit) = ₹{comboCostFloor}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/combo">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postSubmit} disabled={submitting}>
                                    <i className={`bi ${submitting ? "bi-hourglass-split" : "bi-check-circle"}`} aria-hidden="true"></i>{" "}
                                    {submitting ? "Creating…" : "Create Combo"}
                                </button>
                            </div>
                        </div>
                    </div>
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