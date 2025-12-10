import React from "react";

export function UploadModal(props) {
  const {
    step,
    setStep,
    setShowModal,
    videoMeta,
    onPickFile,
    fileInputRef,
    title,
    setTitle,
    desc,
    setDesc,
    showAffiliate,
    setShowAffiliate,
    affiliateLink,
    setAffiliateLink,
    showLocation,
    setShowLocation,
    locationText,
    setLocationText,
    canUpload,
    submitUpload,
    // NEW
    uploading,
    onCancelUpload,
  } = props;

  const handleOuterClick = (e) => {
    if (e.target.classList.contains("modal")) {
      // don’t close if uploading, make user explicitly cancel
      if (!uploading) {
        setShowModal(false);
      }
    }
  };

  return (
    <div className="modal" onClick={handleOuterClick}>
      <div className="modal-content">
        {/* Back button only when NOT uploading */}
        {step > 1 && !uploading && (
          <button className="back-btn" onClick={() => setStep(1)}>
            ←
          </button>
        )}

        {/* Close button disabled while uploading (use Cancel instead) */}
        <span
          className="close-btn"
          onClick={() => {
            if (!uploading) setShowModal(false);
          }}
        >
          ×
        </span>

        {step === 1 && (
          <div className="step">
            <h2>Upload Video</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={onPickFile}
              disabled={uploading}
            />
            <button
              className="btn btn-primary"
              disabled={!videoMeta || uploading}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Video Details</h2>
            <form onSubmit={submitUpload}>
              <label>
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={uploading}
                />
              </label>

              <label>
                Description:
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  disabled={uploading}
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={showAffiliate}
                  onChange={(e) => setShowAffiliate(e.target.checked)}
                  disabled={uploading}
                />
                Add Affiliate Link
              </label>

              {showAffiliate && (
                <input
                  type="text"
                  placeholder="Affiliate link URL"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  disabled={uploading}
                />
              )}

              <label>
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                  disabled={uploading}
                />
                Add Location
              </label>

              {showLocation && (
                <input
                  type="text"
                  placeholder="Location"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  disabled={uploading}
                />
              )}

              {/* Buttons / uploading state */}
              {!uploading && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!canUpload}
                >
                  Upload
                </button>
              )}

              {uploading && (
                <div style={{ marginTop: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancelUpload}
                  >
                    Cancel upload
                  </button>
                  <span style={{ fontSize: "14px", opacity: 0.8 }}>
                    Uploading… please wait
                  </span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

