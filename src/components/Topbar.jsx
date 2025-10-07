import React from 'react';

export function Topbar({ theme, setTheme, openModal }) {
  return (
    <header className="topbar fixed">
      <h1 className="brand-text">Drapso</h1>
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="top-actions">
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌙" : "☀"}
        </button>
        <button className="icon-link" onClick={openModal}>
          ➕
        </button>
      </div>
    </header>
  );
}
