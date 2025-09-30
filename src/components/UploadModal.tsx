import React from 'react';

interface UploadModalProps {
  step: number;
  setStep: (step: number) => void;
  setShowModal: (show: boolean) => void;
  videoMeta: any;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  title: string;
  setTitle: (title: string) => void;
  desc: string;
  setDesc: (desc: string) => void;
  showAffiliate: boolean;
  setShowAffiliate: (show: boolean) => void;
  affiliateLink: string;
  setAffiliateLink: (link: string) => void;
  showLocation: boolean;
  setShowLocation: (show: boolean) => void;
  locationText: string;
  setLocationText: (text: string) => void;
  canUpload: boolean;
  submitUpload: (e: React.FormEvent) => void;
}

export function UploadModal(props: UploadModalProps) {
  const {
    step, setStep, setShowModal, videoMeta, onPickFile, fileInputRef,
    title, setTitle, desc, setDesc,
    showAffiliate, setShowAffiliate, affiliateLink, setAffiliateLink,
    showLocation, setShowLocation, locationText, setLocationText,
    canUpload, submitUpload,
  } = props;

  return (
    <div className="modal" onClick={(e) => (e.target as Element).classList.contains("modal") && setShowModal(false)}>
      <div className="modal-content">
        {step > 1 && <button className="back-btn" onClick={() => setStep(1)}>←</button>}
        <span className="close-btn" onClick={() => setShowModal(false)}>×</span>
        {step === 1 && (
          <div className="step">
            <h2>Upload Video</h2>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={onPickFile} />
            <button className="btn btn-primary" disabled={!videoMeta} onClick={() => setStep(2)}>Next</button>
          </div>
        )}
        {step === 2 && (
          <div className="step">
            <h2>Video Details</h2>
            <form onSubmit={submitUpload}>
              <label>
                Title:
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Description:
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required />
              </label>
              <label>
                <input type="checkbox" checked={showAffiliate} onChange={(e) => setShowAffiliate(e.target.checked)} />
                Add Affiliate Link
              </label>
              {showAffiliate && (
                <input 
                  type="text" 
                  placeholder="Affiliate link URL"
                  value={affiliateLink} 
                  onChange={(e) => setAffiliateLink(e.target.value)} 
                />
              )}
              <label>
                <input type="checkbox" checked={showLocation} onChange={(e) => setShowLocation(e.target.checked)} />
                Add Location
              </label>
              {showLocation && (
                <input 
                  type="text" 
                  placeholder="Location"
                  value={locationText} 
                  onChange={(e) => setLocationText(e.target.value)} 
                />
              )}
              <button type="submit" className="btn btn-primary" disabled={!canUpload}>Upload</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}