import React from "react";

/**
 * Shared "are you sure about this role?" confirmation dialog.
 * Used before both password-login submit and Google sign-in, so a
 * mis-clicked role tab gets caught before any network/OAuth round trip.
 *
 * Props:
 *  - show:       boolean, whether the modal is visible
 *  - roleLabel:  display label of the currently selected role (e.g. "Admin")
 *  - mode:       "login" | "signup" — only changes the wording
 *  - onConfirm:  called when the user clicks "Continue as {role}"
 *  - onCancel:   called on backdrop click, X, or "Change role"
 */
export default function ConfirmRoleModal({
  show,
  roleLabel,
  mode = "login",
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const actionWord = mode === "signup" ? "sign up" : "sign in";

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmRoleModalTitle"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirmRoleModalTitle">
                Confirm account type
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">
                You've selected <strong>{roleLabel}</strong>. Continue to{" "}
                {actionWord} as {roleLabel}?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Change role
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConfirm}
              >
                Continue as {roleLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}