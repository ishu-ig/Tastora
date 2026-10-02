import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMembership, updateMembership } from "../../Redux/ActionCreators/MembershipActionCreators";

const STATUS_BADGE = {
    active: "text-bg-success",
    pending: "text-bg-warning",
    expired: "text-bg-secondary",
    canceled: "text-bg-danger",
};

function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// A membership marked "active" but past its end date is shown as expired
function getStatus(item) {
    if (item.status === "active" && item.endDate && new Date(item.endDate) < new Date()) return "expired";
    return item.status;
}

function daysLeft(item) {
    if (!item.endDate) return null;
    return Math.ceil((new Date(item.endDate) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function AdminMembership() {
    const MembershipStateData = useSelector((state) => state.MembershipStateData);
    const dispatch = useDispatch();
    const [flag, setFlag] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const list = MembershipStateData ?? [];
    const totalCount = list.length;
    const activeCount = list.filter((i) => getStatus(i) === "active").length;
    const expiredCount = list.filter((i) => getStatus(i) === "expired").length;
    const revenue = list
        .filter((i) => i.status !== "pending")
        .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

    function cancelRecord(_id) {
        if (window.confirm("Cancel this membership? The customer will lose the plan benefits.")) {
            dispatch(updateMembership({ _id, status: "canceled" }));
            setFlag((f) => !f);
        }
    }

    useEffect(() => { dispatch(getMembership()); }, [flag]);

    const filteredData = list.filter((item) => {
        const q = search.toLowerCase();
        const matchesSearch =
            item.user?.name?.toLowerCase().includes(q) ||
            item.user?.email?.toLowerCase().includes(q) ||
            String(item.user?.phoneNo ?? "").includes(q) ||
            item.plan?.name?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || getStatus(item) === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
          position: relative;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn-del:hover { background: #f8d7da; color: #dc3545; }
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
      `}</style>

            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">

                    <div className="page-heading">
                        <div className="page-heading-copy">
                            <span className="page-icon">
                                <i className="bi bi-people" aria-hidden="true"></i>
                            </span>
                            <div>
                                <p className="eyebrow mb-1">Management</p>
                                <h1 className="h3 mb-1">Member Customers</h1>
                                <p className="text-muted mb-0">See which customers bought a membership and when it ends.</p>
                            </div>
                        </div>
                    </div>

                    <section className="row g-3 mt-2 mb-1" aria-label="Member summary">
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Total</span>
                                    <span className="metric-icon"><i className="bi bi-people-fill"></i></span>
                                </div>
                                <div className="metric-value">{totalCount}</div>
                                <div className="metric-meta"><span>all</span><span>memberships</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Active</span>
                                    <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                                </div>
                                <div className="metric-value">{activeCount}</div>
                                <div className="metric-meta"><span>current</span><span>members</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card">
                                <div className="metric-top">
                                    <span className="metric-label">Expired</span>
                                    <span className="metric-icon"><i className="bi bi-hourglass-bottom"></i></span>
                                </div>
                                <div className="metric-value">{expiredCount}</div>
                                <div className="metric-meta"><span>need</span><span>renewal</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card">
                                <div className="metric-top">
                                    <span className="metric-label">Revenue</span>
                                    <span className="metric-icon"><i className="bi bi-currency-rupee"></i></span>
                                </div>
                                <div className="metric-value">₹{revenue}</div>
                                <div className="metric-meta"><span>from paid</span><span>plans</span></div>
                            </article>
                        </div>
                    </section>

                    <section className="panel mt-3">
                        <div className="panel-header">
                            <div>
                                <h2 className="h5 mb-1 section-title">
                                    <i className="bi bi-table" aria-hidden="true"></i>
                                    <span>Customer Memberships</span>
                                </h2>
                                <p className="text-muted mb-0">Search by name, email, phone or plan.</p>
                            </div>
                            <div className="ms-auto d-flex flex-wrap gap-2">
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: 140 }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="expired">Expired</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                                <div className="input-group input-group-sm" style={{ minWidth: 220, width: "auto" }}>
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input type="text" className="form-control border-start-0"
                                        placeholder="Search customers..." value={search}
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
                                        <th>Customer</th>
                                        <th>Plan</th>
                                        <th>Paid</th>
                                        <th>Starts</th>
                                        <th>Ends</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => {
                                            const status = getStatus(item);
                                            const left = daysLeft(item);
                                            return (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="fw-semibold">{item.user?.name ?? "Deleted user"}</div>
                                                        <div className="text-muted small">
                                                            {item.user?.phoneNo ?? ""}{item.user?.phoneNo && item.user?.email ? " | " : ""}{item.user?.email ?? ""}
                                                        </div>
                                                    </td>
                                                    <td className="fw-semibold">{item.plan?.name ?? "—"}</td>
                                                    <td>
                                                        <div>₹{item.amountPaid ?? 0}</div>
                                                        {item.razorpayPaymentId && (
                                                            <div className="text-muted small">{item.razorpayPaymentId}</div>
                                                        )}
                                                    </td>
                                                    <td>{formatDate(item.startDate)}</td>
                                                    <td>
                                                        <div>{formatDate(item.endDate)}</div>
                                                        {status === "active" && left !== null && (
                                                            <div className={`small ${left <= 7 ? "text-danger fw-semibold" : "text-muted"}`}>
                                                                {left} {left === 1 ? "day" : "days"} left
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${STATUS_BADGE[status] ?? "text-bg-secondary"}`}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        {(status === "active" || status === "pending") ? (
                                                            <div className="act-strip">
                                                                <button className="act-btn act-btn-del"
                                                                    onClick={() => cancelRecord(item._id)} data-tip="Cancel membership">
                                                                    <i className="bi bi-x-circle-fill"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted py-4">
                                                {search || statusFilter !== "all"
                                                    ? "No memberships match your search."
                                                    : "No customer has bought a membership yet."}
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