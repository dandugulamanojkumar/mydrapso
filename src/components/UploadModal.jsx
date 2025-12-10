import React from 'react';

export function UploadModal(props) {
  const {
    step, setStep, setShowModal, videoMeta, onPickFile, fileInputRef,
    title, setTitle, desc, setDesc,
    showAffiliate, setShowAffiliate, affiliateLink, setAffiliateLink,
    showLocation, setShowLocation, locationText, setLocationText,
    canUpload, submitUpload,

    // NEW props for progress UI
    uploading,
    uploadProgress,
    uploadBytesSent,
    uploadBytesTotal,
    uploadEtaSeconds,
    onCancelUpload,
  } = props;

  const formatMb = (bytes) => ((bytes || 0) / (1024 * 1024)).toFixed(2);

  const closeIfNotUploading = () => {
    if (uploading) return;
    setShowModal(false);
  };

  return (
    <div
      className="modal"
      onClick={(e) =>
        e.target.classList.contains("modal") && !uploading && setShowModal(false)
      }
    >
      <div className="modal-content">
        {step > 1 && !uploading && (
          <button className="back-btn" onClick={() => setStep(1)}>←</button>
        )}
        <span className="close-btn" onClick={closeIfNotUploading}>×</span>

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

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canUpload || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              {/* PROGRESS UI */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress || 0}%` }}
                    />
                  </div>
                  <p className="progress-text">
                    {formatMb(uploadBytesSent)} MB /{" "}
                    {formatMb(
                      uploadBytesTotal || (videoMeta?.file?.size || 0)
                    )}{" "}
                    MB ({Math.round(uploadProgress || 0)}%)
                  </p>
                  {uploadEtaSeconds != null && (
                    <p className="progress-eta">
                      ~{uploadEtaSeconds}s remaining
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancelUpload}
                  >
                    Cancel upload
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

