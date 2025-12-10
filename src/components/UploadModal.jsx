import React from 'react';

export function UploadModal(props) {
  const {
    step, setStep, setShowModal, videoMeta, onPickFile, fileInputRef,
    title, setTitle, desc, setDesc,
    showAffiliate, setShowAffiliate, affiliateLink, setAffiliateLink,
    showLocation, setShowLocation, locationText, setLocationText,
    canUpload, submitUpload,
    // 🔹 NEW props for progress
    uploading,
    uploadProgress,
    uploadBytes,
    uploadEta,
    onCancelUpload,
  } = props;

  const handleOuterClick = (e) => {
    if (e.target.classList.contains('modal')) {
      if (!uploading) {
        setShowModal(false);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatEta = (seconds) => {
    if (seconds == null) return '';
    const s = Math.max(Math.round(seconds), 1);
    if (s < 60) return `${s}s left`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return `${h}h ${rm}m left`;
    }
    return `${m}m ${rem}s left`;
  };

  return (
    <div className="modal" onClick={handleOuterClick}>
      <div className="modal-content">
        {step > 1 && !uploading && (
          <button className="back-btn" onClick={() => setStep(1)}>←</button>
        )}

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

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canUpload || uploading}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>

              {/* 🔹 Progress UI */}
              {uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-bar-fill"
                      style={{ width: `${uploadProgress || 0}%` }}
                    />
                  </div>

                  <div className="upload-progress-stats">
                    <span>
                      {Math.round(uploadProgress || 0)}% •{' '}
                      {formatBytes(uploadBytes?.uploaded)} /{' '}
                      {formatBytes(uploadBytes?.total)}
                    </span>

                    <span>{formatEta(uploadEta)}</span>

                    <button
                      type="button"
                      className="upload-cancel-btn"
                      onClick={onCancelUpload}
                    >
                      Cancel upload
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


