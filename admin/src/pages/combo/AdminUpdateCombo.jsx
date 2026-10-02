// ─── AdminUpdateCombo.jsx ────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { getCombo, updateCombo } from "../../Redux/ActionCreators/ComboActionCreators";
import { getProduct } from "../../Redux/ActionCreators/ProductActionCreators"; // assumed to exist

const checklist = [
    { dot: "bg-success", title: "Review Name", body: "Make sure the combo name still matches its contents." },
    { dot: "bg-primary", title: "Adjust Products", body: "Add or remove products from the bundle." },
    { dot: "bg-info", title: "Cost Floor Formula", body: "Combo Cost Floor = Total COGS + Desired Profit to avoid selling at a loss." },
    { dot: "bg-warning", title: "Update Image", body: "Replace the image via file upload or URL." },
];

export default function AdminUpdateCombo() {
    const { _id } = useParams();
    const navigate = useNavigate();
    const ComboStateData = useSelector((state) => state.ComboStateData);
    const ProductStateData = useSelector((state) => state.ProductStateData);
    const dispatch = useDispatch();

    const [data, setData] = useState(null);
    const [error, setError] = useState({ name: "", description: "", price: "", pic: "", items: "" });
    const [imageMode, setImageMode] = useState("file");
    const [newFile, setNewFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [show, setShow] = useState(false);

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
            setNewFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setNewFile(null);
            setImagePreview(data?.image || null);
        }
    }

    function handleUrlChange(e) {
        const url = e.target.value;
        setImageUrl(url);
        if (!url.trim()) {
            setImagePreview(data?.image || null);
            setError((old) => ({ ...old, pic: "" }));
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
            setImagePreview(newFile ? URL.createObjectURL(newFile) : data?.image || null);
        } else if (imageUrl.trim() && /^https?:\/\//i.test(imageUrl.trim())) {
            setImagePreview(imageUrl.trim());
        } else {
            setImagePreview(data?.image || null);
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
        // formValidator is built for generic required-text inputs and doesn't
        // understand "> 0" numbers, so validate numerically here (matches
        // AdminCreateCombo.jsx) rather than relying on it for this field.
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
        if (!data) return;

        let picErr = "";
        if (imageMode === "url" && imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim())) {
            picErr = "Please enter a valid HTTP or HTTPS image URL.";
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
            (x) => x._id !== _id && x.name.toLowerCase() === data.name.trim().toLowerCase()
        );
        if (duplicate) {
            setShow(true);
            setError((old) => ({ ...old, name: "Combo Already Exists" }));
            return;
        }

        // Profit Guard: the UI warns when price < cost floor, but nothing
        // previously stopped the save itself here (Create already had this
        // guard). Require explicit confirmation before saving a loss-making
        // price so edits get the same protection as new combos.
        if (Number(data.price) < comboCostFloor) {
            const proceed = window.confirm(
                `This combo price (₹${data.price}) is below the calculated cost floor (₹${comboCostFloor}). ` +
                `You may be selling at a loss. Continue anyway?`
            );
            if (!proceed) return;
        }

        const formData = new FormData();
        formData.append("_id", data._id);
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

        if (imageMode === "file" && newFile) {
            // Only append as "pic" — multer expects exactly this field name
            formData.append("pic", newFile);
        } else if (imageMode === "url" && imageUrl.trim()) {
            formData.append("image", imageUrl.trim());
            formData.append("imageUrl", imageUrl.trim());
        } else {
            formData.append("image", data.image);
        }

        try {
            setSubmitting(true);
            // Await so a failed request surfaces an error here instead of
            // silently navigating away as if the combo had been saved.
            await dispatch(updateCombo(formData));
            navigate("/combo");
        } catch (err) {
            setShow(true);
            setError((old) => ({
                ...old,
                name: old.name || err?.message || "Could not update combo. Please try again.",
            }));
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        dispatch(getCombo());
        dispatch(getProduct());
    }, [dispatch]);

    useEffect(() => {
        if (ComboStateData.length && !data) {
            const item = ComboStateData.find((x) => x._id === _id);
            if (item) {
                setData({ ...item });
                setSelectedItems((item.items ?? []).map((it) => (typeof it === "string" ? it : it._id)));
                if (item.minProfit !== undefined && item.minProfit !== 0) {
                    setMinProfit(item.minProfit);
                }
                if (item.discount !== undefined) {
                    setCustomDiscount(item.discount);
                } else if (item.originalPrice > 0 && item.price < item.originalPrice) {
                    setCustomDiscount(Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100));
                }
                if (Array.isArray(item.products)) {
                    const loadedOverrides = {};
                    item.products.forEach((prod) => {
                        if (prod._id && prod.cogs !== undefined) {
                            loadedOverrides[prod._id] = prod.cogs;
                        }
                    });
                    if (Object.keys(loadedOverrides).length > 0) {
                        setCogsOverrides(loadedOverrides);
                    }
                }
                if (item.image) {
                    setImagePreview(item.image);
                    if (/^https?:\/\//i.test(item.image)) setImageUrl(item.image);
                }
            }
        }
    }, [_id, ComboStateData, data]);

    if (!data) {
        return (
            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">
                    <p className="text-muted">Loading combo…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon"><i className="bi bi-pencil-square" aria-hidden="true"></i></span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Update Combo</h1>
                            <p className="text-muted mb-0">Edit the combo details below.</p>
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
                                    <p className="text-muted mb-0">Update the details for this combo.</p>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-md-8">
                                    <label className="form-label" htmlFor="name">
                                        Combo Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={data.name}
                                        onChange={getInputData}
                                    />
                                    {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label mb-0" htmlFor="price">
                                            Combo Price <span className="text-danger">*</span>
                                        </label>
                                        {mainPrice > 0 && (
                                            <span className="badge bg-light text-dark border" style={{ fontSize: "0.72rem" }}>
                                                Main: ₹{mainPrice} {Number(customDiscount) > 0 ? `(-${customDiscount}%)` : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            name="price"
                                            className="form-control fw-bold"
                                            placeholder={comboCostFloor > 0 ? `Floor: ₹${comboCostFloor}` : `Sum: ₹${mainPrice}`}
                                            value={data.price}
                                            onChange={handlePriceChange}
                                        />
                                        {comboCostFloor > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm"
                                                onClick={applyCostFloorAsPrice}
                                                title="Set price to calculated Cost Floor"
                                            >
                                                Floor
                                            </button>
                                        )}
                                    </div>
                                    {show && error.price && <div className="text-danger small mt-1">{error.price}</div>}
                                    {data.price !== "" && comboCostFloor > 0 && (
                                        Number(data.price) < comboCostFloor ? (
                                            <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                Below cost floor by ₹{comboCostFloor - Number(data.price)}
                                            </div>
                                        ) : (
                                            <div className="text-success small mt-1 d-flex align-items-center gap-1">
                                                <i className="bi bi-check-circle-fill"></i>
                                                Healthy margin (+₹{Number(data.price) - totalCogs} profit)
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="col-12">
                                    <label className="form-label" htmlFor="description">
                                        Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="2"
                                        className="form-control"
                                        value={data.description}
                                        onChange={getInputData}
                                    />
                                    {show && error.description && <div className="text-danger small mt-1">{error.description}</div>}
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">
                                            Combo Image <span className="text-muted fw-normal">(upload file or paste URL)</span>
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
                                            <div className="form-text">Choose a new image file to replace current image (leave blank to keep current).</div>
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
                                            <span className="text-muted small mb-1 fw-semibold">Current / Preview:</span>
                                            <img
                                                src={imagePreview}
                                                alt="Combo Preview"
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
                                                    style={{ background: "var(--primary, #4f46e5)", color: "#fff", fontSize: "0.75rem", padding: "4px 8px", borderRadius: 20 }}
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
                                        <div
                                            className="d-flex align-items-center justify-content-between rounded px-3 py-2 mt-2"
                                            style={{ background: "var(--bs-body-bg, #f8f9fa)", border: "1px solid var(--bs-border-color, #dee2e6)", fontSize: "0.85rem" }}
                                        >
                                            <span className="text-muted">
                                                <i className="bi bi-bag me-1"></i>
                                                {selectedProducts.length} item{selectedProducts.length > 1 ? "s" : ""} selected
                                            </span>
                                            <span className="d-flex align-items-center gap-2">
                                                <span className="text-muted">Items sum:</span>
                                                <span className="fw-bold text-success">₹{selectedProducts.reduce((s, p) => s + getMinPrice(p), 0)}</span>
                                                {data.price !== "" && Number(data.price) > 0 && (
                                                    <>
                                                        <span className="text-muted">|</span>
                                                        <span className="text-muted">Combo price:</span>
                                                        <span className="fw-bold" style={{ color: "var(--primary, #4f46e5)" }}>₹{Number(data.price)}</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Combo Cost Floor Pricing Calculator ── */}
                                    {selectedProducts.length > 0 && (
                                        <div className="border rounded-3 p-3 mt-3 bg-light-subtle">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                                <div>
                                                    <span className="badge text-bg-primary me-2">Pricing Engine</span>
                                                    <span className="fw-bold text-dark">Combo Cost Floor Formula</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                                    onClick={applyCostFloorAsPrice}
                                                    disabled={comboCostFloor <= 0}
                                                >
                                                    <i className="bi bi-lightning-charge-fill"></i>
                                                    Set Price to Cost Floor (₹{comboCostFloor})
                                                </button>
                                            </div>

                                            {/* ── Custom Discount on Main Price Controller ── */}
                                            <div className="p-3 mb-3 rounded-3 border bg-white shadow-sm">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge text-bg-warning px-2 py-1">
                                                            <i className="bi bi-percent me-1"></i> Custom Discount
                                                        </span>
                                                        <span className="fw-semibold text-dark">Enter Custom Discount on Main Price</span>
                                                    </div>
                                                    <div className="small text-muted">
                                                        Main Price (Items Sum): <strong className="text-dark">₹{mainPrice}</strong>
                                                    </div>
                                                </div>

                                                <div className="row g-2 align-items-center">
                                                    <div className="col-12 col-sm-6">
                                                        <label className="form-label small text-muted mb-1">
                                                            Discount (% off Main Price ₹{mainPrice}):
                                                        </label>
                                                        <div className="input-group input-group-sm">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="form-control text-center fw-bold"
                                                                placeholder="e.g. 10"
                                                                value={customDiscount}
                                                                onChange={(e) => applyCustomDiscount(e.target.value)}
                                                            />
                                                            <span className="input-group-text fw-semibold bg-light">% OFF</span>
                                                        </div>
                                                        <div className="small text-muted mt-1">
                                                            Discount Savings: <span className="text-danger fw-semibold">-₹{Math.round((mainPrice * (Number(customDiscount) || 0)) / 100)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 col-sm-6">
                                                        <label className="form-label small text-muted mb-1">
                                                            Net Combo Price:
                                                        </label>
                                                        <div className="input-group input-group-sm">
                                                            <span className="input-group-text bg-success text-white fw-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                name="price"
                                                                className="form-control fw-bold text-success"
                                                                value={data.price}
                                                                onChange={handlePriceChange}
                                                            />
                                                        </div>
                                                        <div className="small text-muted mt-1">
                                                            Projected Profit: <strong className={Number(data.price) >= comboCostFloor ? "text-success" : "text-danger"}>
                                                                ₹{Number(data.price) > 0 ? Number(data.price) - totalCogs : 0}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Preset Buttons */}
                                                <div className="d-flex align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
                                                    <span className="small text-muted fw-semibold">Quick Presets:</span>
                                                    {[5, 10, 15, 20].map((pct) => (
                                                        <button
                                                            key={pct}
                                                            type="button"
                                                            className={`btn btn-sm py-0 px-2 rounded-pill ${Number(customDiscount) === pct ? "btn-primary" : "btn-outline-secondary"}`}
                                                            style={{ fontSize: "0.78rem" }}
                                                            onClick={() => applyCustomDiscount(pct)}
                                                        >
                                                            {pct}% OFF
                                                        </button>
                                                    ))}
                                                    {maxSafeDiscountPercent > 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-success py-0 px-2 rounded-pill ms-auto"
                                                            style={{ fontSize: "0.78rem" }}
                                                            onClick={() => applyCustomDiscount(maxSafeDiscountPercent)}
                                                            title="Maximum discount that keeps your desired profit intact"
                                                        >
                                                            <i className="bi bi-shield-check me-1"></i> Max Safe ({maxSafeDiscountPercent}%)
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Profit Alert if discount is too high */}
                                                {data.price !== "" && Number(data.price) > 0 && (
                                                    <div className="mt-2 pt-2 border-top">
                                                        {Number(data.price) < comboCostFloor ? (
                                                            <div className="alert alert-danger py-2 px-3 mb-0 small rounded-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                                <div>
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    <strong>Discount is too high!</strong> Combo price (₹{data.price}) is below your Cost Floor of ₹{comboCostFloor}. Profit margin is eroded by ₹{comboCostFloor - Number(data.price)}.
                                                                </div>
                                                                {maxSafeDiscountPercent > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger py-0 px-2"
                                                                        style={{ fontSize: "0.75rem" }}
                                                                        onClick={() => applyCustomDiscount(maxSafeDiscountPercent)}
                                                                    >
                                                                        Cap to Safe {maxSafeDiscountPercent}%
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="alert alert-success py-1 px-3 mb-0 small rounded-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                                <div>
                                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                                    <strong>Profit Protected!</strong> Combo profit of ₹{Number(data.price) - totalCogs} is safe and above your minimum profit target.
                                                                </div>
                                                                <span className="badge text-bg-success">Margin: {Math.round(((Number(data.price) - totalCogs) / Number(data.price)) * 100)}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Formula Display Box */}
                                            <div className="p-2 mb-3 rounded bg-white border font-monospace small">
                                                <div className="text-secondary fw-semibold mb-1">
                                                    Combo Cost Floor = (COGS<sub>Item A</sub> + COGS<sub>Item B</sub> + ...) + Minimum Desired Profit
                                                </div>
                                                <div className="text-primary fw-bold">
                                                    = ({selectedProducts.map((p) => `₹${getItemCogs(p)}`).join(" + ") || "₹0"}) + ₹{Number(minProfit) || 0} = <span className="text-success fs-6">₹{comboCostFloor}</span>
                                                </div>
                                            </div>

                                            {/* Item COGS breakdown table */}
                                            <div className="mb-2">
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <span className="small fw-semibold text-muted">Item COGS (Cost of Goods Sold) Breakdown:</span>
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <span className="btn btn-sm btn-outline-secondary disabled py-0 px-2" style={{ fontSize: "0.75rem" }}>Quick %:</span>
                                                        {[30, 35, 40, 50].map((pct) => (
                                                            <button
                                                                key={pct}
                                                                type="button"
                                                                className={`btn btn-sm py-0 px-2 ${cogsPercent === pct ? "btn-primary" : "btn-outline-secondary"}`}
                                                                style={{ fontSize: "0.75rem" }}
                                                                onClick={() => applyGlobalCogsPercent(pct)}
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="table-responsive bg-white rounded border">
                                                    <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: "0.82rem" }}>
                                                        <thead className="table-light border-bottom">
                                                            <tr>
                                                                <th className="py-1 px-2">Item</th>
                                                                <th className="py-1 px-2 text-center" style={{ width: 100 }}>Menu Price</th>
                                                                <th className="py-1 px-2 text-end" style={{ width: 150 }}>COGS (Cost)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedProducts.map((p) => {
                                                                const pPrice = getMinPrice(p);
                                                                const cogsVal = getItemCogs(p);
                                                                return (
                                                                    <tr key={p._id} className="border-bottom">
                                                                        <td className="py-1 px-2 fw-medium">{p.name}</td>
                                                                        <td className="py-1 px-2 text-center text-muted">₹{pPrice}</td>
                                                                        <td className="py-1 px-2 text-end">
                                                                            <div className="input-group input-group-sm ms-auto" style={{ maxWidth: 130 }}>
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
                                                        <tfoot className="table-light">
                                                            <tr>
                                                                <td className="py-1 px-2 fw-bold">Total COGS (Sum of Costs):</td>
                                                                <td></td>
                                                                <td className="py-1 px-2 text-end fw-bold text-dark">₹{totalCogs}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Minimum Desired Profit input & Result */}
                                            <div className="row g-2 align-items-center mt-2 pt-2 border-top">
                                                <div className="col-12 col-sm-6">
                                                    <label className="form-label small fw-semibold text-muted mb-1">
                                                        Minimum Desired Profit:
                                                    </label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="e.g. 50"
                                                            value={minProfit}
                                                            onChange={(e) => setMinProfit(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 text-sm-end">
                                                    <div className="small text-muted">Calculated Combo Cost Floor:</div>
                                                    <div className="h5 fw-bold text-success mb-0">₹{comboCostFloor}</div>
                                                </div>
                                            </div>

                                            {/* Real-time Pricing Comparison */}
                                            {data.price !== "" && Number(data.price) > 0 && (
                                                <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 small">
                                                    <span>
                                                        Entered Price: <strong className="text-primary">₹{data.price}</strong>
                                                    </span>
                                                    {Number(data.price) < comboCostFloor ? (
                                                        <span className="badge text-bg-danger d-inline-flex align-items-center gap-1">
                                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                                            Below Cost Floor by ₹{comboCostFloor - Number(data.price)} (Risk of loss)
                                                        </span>
                                                    ) : (
                                                        <span className="badge text-bg-success d-inline-flex align-items-center gap-1">
                                                            <i className="bi bi-check-circle-fill"></i>
                                                            Profitable! Margin: ₹{Number(data.price) - totalCogs} ({Math.round(((Number(data.price) - totalCogs) / Number(data.price)) * 100)}%)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/combo">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postSubmit} disabled={submitting}>
                                    <i className={`bi ${submitting ? "bi-hourglass-split" : "bi-check-circle"}`} aria-hidden="true"></i>{" "}
                                    {submitting ? "Saving…" : "Update Combo"}
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