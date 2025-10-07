import React from 'react';

export function PageSettings({ onLogout }) {
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
