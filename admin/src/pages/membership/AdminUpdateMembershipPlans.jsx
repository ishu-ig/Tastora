// ─── AdminUpdateMembershipPlans.jsx ──────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateMembershipPlan, getMembershipPlan } from "../../Redux/ActionCreators/MembershipPlanActionCreators";

const checklist = [
    { dot: "bg-success", title: "Review Name", body: "Make sure the plan name is still correct." },
    { dot: "bg-primary", title: "Check Price & Benefits", body: "Changes apply to new buyers. Current members keep what they paid for." },
    { dot: "bg-warning", title: "Save Changes", body: "Updated details show to customers straight away." },
];

function validateField(name, value) {
    const v = String(value ?? "").trim();
    switch (name) {
        case "name":
            return v === "" ? "Plan name is mandatory" : "";
        case "price":
            if (v === "") return "Price is mandatory";
            return Number(v) < 0 || isNaN(Number(v)) ? "Price must be 0 or more" : "";
        case "durationInMonths":
            if (v === "") return "Duration is mandatory";
            return !Number.isInteger(Number(v)) || Number(v) < 1 ? "Duration must be at least 1 month" : "";
        case "discountPercent":
            return v !== "" && (isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)
                ? "Discount must be between 0 and 100" : "";
        case "bonusCoins":
            return v !== "" && (!Number.isInteger(Number(v)) || Number(v) < 0)
                ? "Bonus coins must be a whole number, 0 or more" : "";
        default:
            return "";
    }
}

export default function AdminUpdateMembershipPlans() {
    const { _id } = useParams();
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        durationInMonths: 1,
        discountPercent: 0,
        freeDelivery: false,
        bonusCoins: 0,
        active: true,
    });
    const [error, setError] = useState({ name: "", price: "", durationInMonths: "", discountPercent: "", bonusCoins: "" });
    const [show, setShow] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();
    const MembershipPlanStateData = useSelector((state) => state.MembershipPlanStateData);
    const dispatch = useDispatch();

    function getInputData(e) {
        const { name, value } = e.target;
        if (name in error) {
            setError((old) => ({ ...old, [name]: validateField(name, value) }));
        }
        const isBool = name === "active" || name === "freeDelivery";
        setData((old) => ({ ...old, [name]: isBool ? value === "1" : value }));
    }

    function postSubmit(e) {
        e.preventDefault();

        const newError = {
            name: validateField("name", data.name),
            price: validateField("price", data.price),
            durationInMonths: validateField("durationInMonths", data.durationInMonths),
            discountPercent: validateField("discountPercent", data.discountPercent),
            bonusCoins: validateField("bonusCoins", data.bonusCoins),
        };

        if (Object.values(newError).some((x) => x !== "")) {
            setError(newError);
            setShow(true);
            return;
        }

        const duplicate = MembershipPlanStateData.find(
            (x) => x._id !== _id && x.name.toLowerCase() === data.name.trim().toLowerCase()
        );
        if (duplicate) {
            setError((old) => ({ ...old, name: "A plan with this name already exists" }));
            setShow(true);
            return;
        }

        dispatch(
            updateMembershipPlan({
                _id,
                name: data.name.trim(),
                description: data.description.trim(),
                price: Number(data.price),
                durationInMonths: Number(data.durationInMonths),
                discountPercent: Number(data.discountPercent) || 0,
                freeDelivery: data.freeDelivery,
                bonusCoins: Number(data.bonusCoins) || 0,
                active: data.active,
            })
        );
        navigate("/membershipplan");
    }

    useEffect(() => {
        dispatch(getMembershipPlan());
    }, [dispatch]);

    useEffect(() => {
        if (loaded) return;
        const item = MembershipPlanStateData.find((x) => x._id === _id);
        if (item) {
            setData({
                name: item.name ?? "",
                description: item.description ?? "",
                price: item.price ?? "",
                durationInMonths: item.durationInMonths ?? 1,
                discountPercent: item.discountPercent ?? 0,
                freeDelivery: !!item.freeDelivery,
                bonusCoins: item.bonusCoins ?? 0,
                active: item.active !== false,
            });
            setLoaded(true);
        }
    }, [MembershipPlanStateData, _id, loaded]);

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon"><i className="bi bi-pencil-square" aria-hidden="true"></i></span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Update Membership Plan</h1>
                            <p className="text-muted mb-0">Edit the plan details below.</p>
                        </div>
                    </div>
                    <div className="heading-actions">
                        <Link className="btn btn-outline-secondary btn-sm" to="/membershipplan">
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
                                        <i className="bi bi-award" aria-hidden="true"></i>
                                        <span>Plan Information</span>
                                    </h2>
                                    <p className="text-muted mb-0">Update the details for this membership plan.</p>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="name">
                                        Plan Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="e.g. Silver, Gold"
                                        value={data.name}
                                        onChange={getInputData}
                                    />
                                    {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                                </div>

                                <div className="col-12">
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="2"
                                        className="form-control"
                                        placeholder="Short line shown to customers"
                                        value={data.description}
                                        onChange={getInputData}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="price">
                                        Price <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            name="price"
                                            className="form-control"
                                            placeholder="499"
                                            value={data.price}
                                            onChange={getInputData}
                                        />
                                    </div>
                                    {show && error.price && <div className="text-danger small mt-1">{error.price}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="durationInMonths">
                                        Duration <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            id="durationInMonths"
                                            type="number"
                                            min="1"
                                            step="1"
                                            name="durationInMonths"
                                            className="form-control"
                                            value={data.durationInMonths}
                                            onChange={getInputData}
                                        />
                                        <span className="input-group-text">months</span>
                                    </div>
                                    {show && error.durationInMonths && <div className="text-danger small mt-1">{error.durationInMonths}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="discountPercent">Discount on orders</label>
                                    <div className="input-group">
                                        <input
                                            id="discountPercent"
                                            type="number"
                                            min="0"
                                            max="100"
                                            name="discountPercent"
                                            className="form-control"
                                            value={data.discountPercent}
                                            onChange={getInputData}
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
                                    {show && error.discountPercent && <div className="text-danger small mt-1">{error.discountPercent}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="bonusCoins">Bonus coins</label>
                                    <input
                                        id="bonusCoins"
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="bonusCoins"
                                        className="form-control"
                                        value={data.bonusCoins}
                                        onChange={getInputData}
                                    />
                                    <div className="form-text">Credited to the member when the plan starts.</div>
                                    {show && error.bonusCoins && <div className="text-danger small mt-1">{error.bonusCoins}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="freeDelivery">Free delivery</label>
                                    <select
                                        id="freeDelivery"
                                        name="freeDelivery"
                                        className="form-select"
                                        value={data.freeDelivery ? "1" : "0"}
                                        onChange={getInputData}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label" htmlFor="active">Status</label>
                                    <select
                                        id="active"
                                        name="active"
                                        className="form-select"
                                        value={data.active ? "1" : "0"}
                                        onChange={getInputData}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/membershipplan">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                                    <i className="bi bi-check-circle" aria-hidden="true"></i> Update Plan
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