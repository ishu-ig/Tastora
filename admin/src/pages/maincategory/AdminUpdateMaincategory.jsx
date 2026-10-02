// ─── AdminUpdateMaincategory.jsx ────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { getMaincategory, updateMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";

const checklist = [
  { dot: "bg-success", title: "Review Name", body: "Ensure the category name is correct." },
  { dot: "bg-primary", title: "Update Image", body: "Replace the image via file upload or URL." },
  { dot: "bg-warning", title: "Save Changes", body: "Changes take effect immediately on the site." },
];

export default function AdminUpdateMaincategory() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const dispatch = useDispatch();

  const [data, setData] = useState({ name: "", pic: "", active: true });
  const [error, setError] = useState({ name: "", pic: "" });
  const [imageMode, setImageMode] = useState("file"); // "file" | "url"
  const [newFile, setNewFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow] = useState(false);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.value;
    if (name !== "active") {
      setError((old) => ({ ...old, [name]: formValidator(e) }));
    }
    setData((old) => ({ ...old, [name]: name === "active" ? (value === "1") : value }));
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
      setImagePreview(data.pic || null);
    }
  }

  function handleUrlChange(e) {
    const url = e.target.value;
    setImageUrl(url);
    if (!url.trim()) {
      setImagePreview(data.pic || null);
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
      if (newFile) {
        setImagePreview(URL.createObjectURL(newFile));
      } else if (data.pic) {
        setImagePreview(data.pic);
      } else {
        setImagePreview(null);
      }
    } else {
      if (imageUrl.trim() && /^https?:\/\//i.test(imageUrl.trim())) {
        setImagePreview(imageUrl.trim());
      } else if (data.pic) {
        setImagePreview(data.pic);
      } else {
        setImagePreview(null);
      }
    }
  }

  function postSubmit(e) {
    e.preventDefault();

    let picErr = "";
    if (imageMode === "url" && imageUrl.trim()) {
      if (!/^https?:\/\//i.test(imageUrl.trim())) {
        picErr = "Please enter a valid HTTP or HTTPS image URL.";
      }
    }

    const nameErr = data.name.trim() === "" ? "Category Name is Mandatory" : "";

    if (nameErr || picErr) {
      setError((old) => ({
        ...old,
        ...(nameErr ? { name: nameErr } : {}),
        ...(picErr ? { pic: picErr } : {}),
      }));
      setShow(true);
      return;
    }

    const duplicate = MaincategoryStateData.find(
      (x) => x._id !== _id && x.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, name: "Category Already Exists" }));
      return;
    }

    const formData = new FormData();
    formData.append("_id", data._id);
    formData.append("name", data.name.trim());
    formData.append("active", data.active);

    if (imageMode === "file" && newFile) {
      formData.append("pic", newFile);
    } else if (imageMode === "url" && imageUrl.trim()) {
      formData.append("pic", imageUrl.trim());
      formData.append("picUrl", imageUrl.trim());
    } else {
      formData.append("pic", data.pic);
    }

    dispatch(updateMaincategory(formData));
    navigate("/maincategory");
  }

  useEffect(() => {
    dispatch(getMaincategory());
    if (MaincategoryStateData.length) {
      const item = MaincategoryStateData.find((x) => x._id === _id);
      if (item) {
        setData({ ...item });
        if (item.pic) {
          setImagePreview(item.pic);
          if (/^https?:\/\//i.test(item.pic)) {
            setImageUrl(item.pic);
          }
        }
      }
    }
  }, [dispatch, _id, MaincategoryStateData]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon"><i className="bi bi-pencil-square" aria-hidden="true"></i></span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Main Category</h1>
              <p className="text-muted mb-0">Edit the category details below.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/maincategory">
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
                    <i className="bi bi-grid" aria-hidden="true"></i>
                    <span>Category Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the details for this main category.</p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="name">
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Electronics, Clothing"
                    value={data.name}
                    onChange={getInputData}
                  />
                  {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">
                      Category Image <span className="text-muted fw-normal">(upload file or paste URL)</span>
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
                          placeholder="https://example.com/images/category.jpg"
                          value={imageUrl}
                          onChange={handleUrlChange}
                        />
                      </div>
                      <div className="form-text">Paste a direct image link (e.g. https://images.unsplash.com/...).</div>
                    </div>
                  )}

                  {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}

                  {imagePreview && (
                    <div className="mt-3 p-2 bg-light rounded border d-inline-flex flex-column align-items-start">
                      <span className="text-muted small mb-1 fw-semibold">Current / Preview:</span>
                      <img
                        src={imagePreview}
                        alt="Category Preview"
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
                <Link className="btn btn-outline-secondary" to="/maincategory">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                  <i className="bi bi-check-circle" aria-hidden="true"></i> Update Category
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