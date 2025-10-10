import React, { useState } from 'react';

export function PageSettings({ onLogout }) {
  const [activeModal, setActiveModal] = useState(null);

  const handleChangeAccount = () => {
    setActiveModal('changeAccount');
  };

  const handleHelp = () => {
    setActiveModal('help');
  };

  const handleFeedback = () => {
    setActiveModal('feedback');
  };

  const handleAbout = () => {
    setActiveModal('about');
  };

  const settingsItems = [
    {
      id: 'changeAccount',
      label: 'Change Account',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      onClick: handleChangeAccount
    },
    {
      id: 'help',
      label: 'Help',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      onClick: handleHelp
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      onClick: handleFeedback
    },
    {
      id: 'about',
      label: 'About',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      onClick: handleAbout
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      onClick: onLogout,
      danger: true
    }
  ];

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <svg className="settings-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
        <h2>Settings</h2>
      </div>

      <div className="settings-list">
        {settingsItems.map((item) => (
          <div
            key={item.id}
            className={`settings-item ${item.danger ? 'danger' : ''}`}
            onClick={item.onClick}
          >
            <div className="settings-item-icon">{item.icon}</div>
            <span className="settings-item-label">{item.label}</span>
            <svg className="settings-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        ))}
      </div>

      {activeModal === 'changeAccount' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Change Account</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-content">
              <p>Account switching feature coming soon!</p>
              <p>You'll be able to switch between multiple accounts seamlessly.</p>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'help' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Help & Support</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-content">
              <div className="help-section">
                <h4>Getting Started</h4>
                <p>• Upload videos from the home page using the + button</p>
                <p>• Browse random videos in the Clickz section</p>
                <p>• Like and follow your favorite creators</p>
              </div>
              <div className="help-section">
                <h4>Need More Help?</h4>
                <p>Contact us at: support@drapso.com</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'feedback' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Send Feedback</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-content">
              <form className="feedback-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for your feedback!'); closeModal(); }}>
                <label>
                  Your Feedback:
                  <textarea
                    placeholder="Tell us what you think..."
                    rows="6"
                    required
                  />
                </label>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'about' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>About Drapso</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-content">
              <div className="about-section">
                <h4>Drapso</h4>
                <p>Version 1.0.0</p>
                <p className="about-description">
                  A modern video sharing platform where creativity meets community.
                  Share your moments, discover amazing content, and connect with creators worldwide.
                </p>
              </div>
              <div className="about-section">
                <h4>Features</h4>
                <p>• Short-form video sharing</p>
                <p>• Random video discovery</p>
                <p>• Affiliate link integration</p>
                <p>• Location tagging</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
