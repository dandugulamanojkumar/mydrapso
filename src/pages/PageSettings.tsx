import React from 'react';

interface PageSettingsProps {
  onLogout: () => void;
}

export function PageSettings({ onLogout }: PageSettingsProps) {
  return (
    <div className="settings-page">
      <h2>⚙ Settings</h2>
      <ul className="settings-list">
        <li>Change Account</li>
        <li>Help</li>
        <li>Feedback</li>
        <li>About</li>
        <li className="logout" onClick={onLogout}>Logout</li>
      </ul>
    </div>
  );
}