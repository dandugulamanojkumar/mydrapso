import React, { useState } from 'react';

export function Topbar({ theme, setTheme, openModal, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="topbar fixed">
      <h1 className="brand-text">Drapso</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search users or videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>
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
