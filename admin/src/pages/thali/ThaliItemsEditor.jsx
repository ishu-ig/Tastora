// ─── ThaliItemsEditor.jsx ────────────────────────────────────────────────────
// Shared by AdminCreateThali.jsx and AdminUpdateThali.jsx
import React, { useState } from "react";

export const THALI_TYPES = [
  "North Indian", "South Indian", "Punjabi", "Gujarati",
  "Rajasthani", "Bengali", "Maharashtrian", "Special",
];

// One-click extras that are usually NOT in the Product collection
export const POPULAR_CUSTOM_ITEMS = [
  "Papad", "Pickle", "Green Salad", "Chaas", "Raita", "Green Chutney", "Sweet", "Lemon",
];

const uid = () => Math.random().toString(36).slice(2);

export const newItem = (type = "product", customName = "") => ({
  key: uid(),
  type, // "product" | "custom"
  product: "",
  customName,
  quantity: 1,
  isOptional: false,
  note: "",
});

// Server → form state (handles populated and non-populated `items.product`)
export function itemsFromServer(items) {
  return (Array.isArray(items) ? items : []).map((it) => {
    const productId =
      it.product && typeof it.product === "object" ? it.product._id : it.product;
    return {
      key: uid(),
      type: productId ? "product" : "custom",
      product: productId || "",
      customName: it.customName || "",
      quantity: it.quantity ?? 1,
      isOptional: Boolean(it.isOptional),
      note: it.note || "",
    };
  });
}

// Form state → API payload (matches ThaliItemSchema)
export function serializeItems(items) {
  return items.map((it) => ({
    product: it.type === "product" ? it.product : null,
    customName: it.type === "custom" ? it.customName.trim() : "",
    quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
    isOptional: Boolean(it.isOptional),
    note: (it.note || "").trim(),
  }));
}

export function validateItems(items) {
  if (!items.length) return "Add at least one item to the thali";
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.type === "product" && !it.product) return `Item ${i + 1}: select a menu product`;
    if (it.type === "custom" && !it.customName.trim()) return `Item ${i + 1}: enter an item name`;
    if (!(parseInt(it.quantity, 10) >= 1)) return `Item ${i + 1}: quantity must be at least 1`;
  }
  return "";
}

export function priceErrors(price, originalPrice) {
  const p = parseFloat(price);
  const o = originalPrice === "" ? 0 : parseFloat(originalPrice);
  return {
    price: p >= 0 ? "" : "Selling price is mandatory (0 or more)",
    originalPrice:
      o > 0 && p >= 0 && o < p ? "Original price cannot be less than the selling price" : "",
  };
}

// Same rule as the schema's `discount` virtual
export function discountPercent(price, originalPrice) {
  const p = parseFloat(price);
  const o = parseFloat(originalPrice);
  if (!(o > 0) || !(p >= 0) || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

export function itemLabel(it, products) {
  if (it.type === "custom") return it.customName.trim();
  return products.find((p) => p._id === it.product)?.name || "";
}

export default function ThaliItemsEditor({ items, onChange, products, showError, error }) {
  const [productSearch, setProductSearch] = useState({});
  const [openProductPicker, setOpenProductPicker] = useState(null);
  const update = (key, patch) =>
    onChange(items.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const remove = (key) => onChange(items.filter((it) => it.key !== key));
  const add = (type) => onChange([...items, newItem(type)]);
  const setType = (key, type) =>
    update(key, type === "product" ? { type, customName: "" } : { type, product: "" });

  const addQuick = (name) => {
    const exists = items.some(
      (it) => it.type === "custom" && it.customName.trim().toLowerCase() === name.toLowerCase()
    );
    if (!exists) onChange([...items, newItem("custom", name)]);
  };

  return (
    <div>
      <style>{`
        .thali-item-row {
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          padding: 0.75rem;
          background: var(--admin-surface);
        }
        .thali-item-row.is-custom {
          border-style: dashed;
          background: var(--admin-surface-soft);
        }
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
          color: #fff;
          border-color: var(--admin-primary);
        }
      `}</style>

      <div className="d-flex flex-column gap-2 mb-3">
        {items.length === 0 && (
          <div className="text-center text-muted small py-4 border rounded-3" style={{ borderStyle: "dashed" }}>
            <i className="bi bi-inboxes fs-3 d-block mb-1"></i>
            No items yet. Add a menu product or a custom item below.
          </div>
        )}

        {items.map((it, index) => (
          <div key={it.key} className={`thali-item-row ${it.type === "custom" ? "is-custom" : ""}`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary-subtle text-secondary">#{index + 1}</span>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${it.type === "product" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setType(it.key, "product")}
                  >
                    <i className="bi bi-egg-fried me-1"></i> Menu product
                  </button>
                  <button
                    type="button"
                    className={`btn ${it.type === "custom" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setType(it.key, "custom")}
                  >
                    <i className="bi bi-pencil me-1"></i> Custom item
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm text-danger p-0"
                onClick={() => remove(it.key)}
                title="Remove item"
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>

            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                {it.type === "product" ? (
                  <div className="position-relative">
                    <button
                      type="button"
                      className={`form-select form-select-sm text-start ${showError && !it.product ? "is-invalid" : ""}`}
                      aria-haspopup="listbox"
                      aria-expanded={openProductPicker === it.key}
                      onClick={() => setOpenProductPicker((current) => current === it.key ? null : it.key)}
                    >
                      {products.find((product) => product._id === it.product)?.name || "Select a menu product"}
                    </button>
                    {openProductPicker === it.key && (
                      <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-2 shadow z-3 mt-1 p-2">
                        <input
                          type="search"
                          autoFocus
                          className="form-control form-control-sm mb-2"
                          value={productSearch[it.key] || ""}
                          onChange={(e) => setProductSearch((current) => ({ ...current, [it.key]: e.target.value }))}
                          placeholder="Search menu products..."
                          aria-label={`Search menu products for item ${index + 1}`}
                        />
                        <div role="listbox" aria-label="Menu products" className="overflow-auto" style={{ maxHeight: 220 }}>
                          {products
                            .filter((product) =>
                              (product.active !== false || product._id === it.product) &&
                              product.name?.toLowerCase().includes((productSearch[it.key] || "").trim().toLowerCase())
                            )
                            .map((product) => (
                              <button
                                key={product._id}
                                type="button"
                                role="option"
                                aria-selected={product._id === it.product}
                                className="btn btn-sm btn-light w-100 text-start mb-1"
                                onClick={() => {
                                  update(it.key, { product: product._id });
                                  setProductSearch((current) => ({ ...current, [it.key]: "" }));
                                  setOpenProductPicker(null);
                                }}
                              >
                                {product.name}
                              </button>
                            ))}
                          {!products.some((product) =>
                            (product.active !== false || product._id === it.product) &&
                            product.name?.toLowerCase().includes((productSearch[it.key] || "").trim().toLowerCase())
                          ) && <div className="small text-muted text-center py-2">No matching menu products.</div>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={`form-control form-control-sm ${showError && !it.customName.trim() ? "is-invalid" : ""}`}
                    placeholder="e.g. Papad, Pickle, Chaas"
                    maxLength={80}
                    value={it.customName}
                    onChange={(e) => update(it.key, { customName: e.target.value })}
                  />
                )}
              </div>

              <div className="col-5 col-md-2">
                <div className="input-group input-group-sm">
                  <span className="input-group-text">Qty</span>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={it.quantity}
                    onChange={(e) => update(it.key, { quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-7 col-md-4">
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={`optional-${it.key}`}
                    checked={it.isOptional}
                    onChange={(e) => update(it.key, { isOptional: e.target.checked })}
                  />
                  <label className="form-check-label small" htmlFor={`optional-${it.key}`}>
                    Optional item
                  </label>
                </div>
              </div>

              <div className="col-12">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Note (optional), e.g. extra ghee, 2 rotis instead of 3"
                  maxLength={100}
                  value={it.note}
                  onChange={(e) => update(it.key, { note: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showError && error && (
        <div className="alert alert-danger py-2 px-3 small">
          <i className="bi bi-exclamation-circle me-1"></i>{error}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => add("product")}>
          <i className="bi bi-plus-circle me-1"></i> Add menu product
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => add("custom")}>
          <i className="bi bi-plus-circle me-1"></i> Add custom item
        </button>
      </div>

      <div className="d-flex align-items-center flex-wrap gap-1">
        <span className="text-muted small me-1">
          <i className="bi bi-lightning-charge me-1"></i>Quick add custom:
        </span>
        {POPULAR_CUSTOM_ITEMS.map((name) => (
          <button key={name} type="button" className="chip-btn" onClick={() => addQuick(name)}>
            + {name}
          </button>
        ))}
      </div>
    </div>
  );
}
