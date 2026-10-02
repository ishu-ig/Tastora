import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCombo, deleteCombo } from "../../Redux/ActionCreators/ComboActionCreators";

export default function AdminCombo() {
    const ComboStateData = useSelector((state) => state.ComboStateData);
    const dispatch = useDispatch();
    const [flag, setFlag] = useState(false);
    const [search, setSearch] = useState("");

    const totalCount = ComboStateData?.length ?? 0;
    const totalProductsBundled =
        ComboStateData?.reduce((sum, c) => sum + (c.items?.length ?? c.products?.length ?? 0), 0) ?? 0;
    const avgPrice = totalCount
        ? Math.round(ComboStateData.reduce((sum, c) => sum + (c.price || 0), 0) / totalCount)
        : 0;

    async function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to delete this combo?")) {
            // Await the delete before refetching, otherwise the list refresh
            // can race ahead of the server-side deletion and briefly show
            // (or fail to remove) the deleted row.
            try {
                await dispatch(deleteCombo({ _id }));
            } finally {
                dispatch(getCombo());
            }
        }
    }

    useEffect(() => { dispatch(getCombo()); }, [dispatch, flag]);

    const filteredData = ComboStateData?.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <>
            <style>{`
        .act-strip {
          display: inline-flex; align-items: center; gap: 2px;
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 8px; padding: 3px;
        }
        .act-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 6px;
          border: none; background: transparent; cursor: pointer;
          font-size: 0.88rem; color: #6c757d;
          transition: background .13s, color .13s, transform .1s;
          text-decoration: none; position: relative;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn-edit:hover  { background: #cfe2ff; color: #0d6efd; }
        .act-btn-del:hover   { background: #f8d7da; color: #dc3545; }
        .act-sep { width: 1px; height: 16px; background: var(--bs-border-color, #dee2e6); flex-shrink: 0; }
        .act-btn::after {
          content: attr(data-tip);
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: #212529; color: #fff;
          font-size: 0.67rem; font-weight: 600;
          padding: 3px 7px; border-radius: 4px; white-space: nowrap;
          pointer-events: none; z-index: 20;
          opacity: 0; transition: opacity .12s;
        }
        .act-btn:hover::after { opacity: 1; }
        .combo-thumb {
          width: 64px; height: 42px; object-fit: cover;
          border-radius: 6px; border: 1px solid var(--bs-border-color, #dee2e6);
        }
        .items-pill {
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 999px; padding: 1px 8px; font-size: .78rem;
        }
      `}</style>

            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">

                    <div className="page-heading">
                        <div className="page-heading-copy">
                            <span className="page-icon">
                                <i className="bi bi-box-seam" aria-hidden="true"></i>
                            </span>
                            <div>
                                <p className="eyebrow mb-1">Management</p>
                                <h1 className="h3 mb-1">Combos</h1>
                                <p className="text-muted mb-0">Manage product bundles and combo offers.</p>
                            </div>
                        </div>
                        <div className="heading-actions">
                            <Link className="btn btn-primary btn-sm" to="/combo/create">
                                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add Combo
                            </Link>
                        </div>
                    </div>

                    <section className="row g-3 mt-2 mb-1" aria-label="Combo summary">
                        <div className="col-12 col-sm-6 col-xl-4">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Total</span>
                                    <span className="metric-icon"><i className="bi bi-box-seam-fill"></i></span>
                                </div>
                                <div className="metric-value">{totalCount}</div>
                                <div className="metric-meta"><span>all</span><span>combos</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Bundled Products</span>
                                    <span className="metric-icon"><i className="bi bi-grid-fill"></i></span>
                                </div>
                                <div className="metric-value">{totalProductsBundled}</div>
                                <div className="metric-meta"><span>across</span><span>all combos</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                            <article className="metric-card">
                                <div className="metric-top">
                                    <span className="metric-label">Avg Price</span>
                                    <span className="metric-icon"><i className="bi bi-currency-rupee"></i></span>
                                </div>
                                <div className="metric-value">₹{avgPrice}</div>
                                <div className="metric-meta"><span>per</span><span>combo</span></div>
                            </article>
                        </div>
                    </section>

                    <section className="panel mt-3">
                        <div className="panel-header">
                            <div>
                                <h2 className="h5 mb-1 section-title">
                                    <i className="bi bi-table" aria-hidden="true"></i>
                                    <span>Combo List</span>
                                </h2>
                                <p className="text-muted mb-0">Search, review, and manage combos.</p>
                            </div>
                            <div className="ms-auto" style={{ minWidth: 220 }}>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input type="text" className="form-control border-start-0"
                                        placeholder="Search combos..." value={search}
                                        onChange={(e) => setSearch(e.target.value)} />
                                    {search && (
                                        <button className="btn btn-outline-secondary" type="button"
                                            onClick={() => setSearch("")}>
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
                                        <th>#</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Items</th>
                                        <th>Price</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => {
                                            // Prefer the live `items` reference (matches the count below);
                                            // fall back to the `products` price/name snapshot only if
                                            // `items` wasn't populated. Never surface a raw product ID
                                            // as if it were a name.
                                            const names = (item.items?.length ? item.items : item.products)
                                                ?.map((p) => (typeof p === "string" ? null : p.name))
                                                .filter(Boolean) ?? [];
                                            return (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {item.image ? (
                                                            <a href={item.image} target="_blank" rel="noreferrer">
                                                                <img src={item.image} className="combo-thumb" alt={item.name} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted small">—</span>
                                                        )}
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {item.name}
                                                        <div className="text-muted small fw-normal" style={{ maxWidth: 260 }}>
                                                            {item.description?.length > 70
                                                                ? `${item.description.slice(0, 70)}…`
                                                                : item.description}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="items-pill">
                                                            {item.items?.length ?? item.products?.length ?? 0} products
                                                        </span>
                                                        {names.length > 0 && (
                                                            <div className="text-muted small mt-1" style={{ maxWidth: 220 }}>
                                                                {names.slice(0, 3).join(", ")}
                                                                {names.length > 3 ? ` +${names.length - 3} more` : ""}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold text-primary">₹{item.price}</div>
                                                        {item.products?.length > 0 && (() => {
                                                            const sum = item.products.reduce((s, p) => s + (p.price || 0), 0);
                                                            if (!sum) return null;
                                                            return (
                                                                <div className="small mt-0" style={{ fontSize: "0.75rem" }}>
                                                                    {sum > item.price ? (
                                                                        <>
                                                                            <span className="text-muted text-decoration-line-through me-1">₹{sum}</span>
                                                                            <span className="text-success fw-semibold">Save ₹{sum - item.price}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-muted">Items: ₹{sum}</span>
                                                                    )}
                                                                    {item.costFloor > 0 && (
                                                                        <span className="text-muted ms-1">· Floor: ₹{item.costFloor}</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="act-strip">
                                                            <Link className="act-btn act-btn-edit"
                                                                to={`/combo/update/${item._id}`} data-tip="Edit">
                                                                <i className="bi bi-pencil-square"></i>
                                                            </Link>
                                                            {["Super Admin", "Admin"].includes(localStorage.getItem("role")) && (
                                                                <>
                                                                    <span className="act-sep"></span>
                                                                    <button className="act-btn act-btn-del"
                                                                        onClick={() => deleteRecord(item._id)} data-tip="Delete">
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
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                {search ? `No combos found for "${search}"` : "No combos available."}
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