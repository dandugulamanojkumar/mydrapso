import React from 'react';

export function SearchResults({
  searchQuery,
  searchResults,
  onUserClick,
  onVideoClick,
  onClose,
  currentUser,
  follows,
  toggleFollow
}) {
  if (!searchQuery) return null;

  const { users, videos } = searchResults;
  const hasResults = (users && users.length > 0) || (videos && videos.length > 0);

  return (
    <div className="search-results-overlay" onClick={onClose}>
      <div className="search-results-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="search-results-header">
          <h2>Search Results for "{searchQuery}"</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* NO RESULTS */}
        {!hasResults ? (
          <div className="no-results">
            <p>No results found</p>
          </div>
        ) : (
          <div className="search-results-content">

            {/* ---------------- USERS SECTION ---------------- */}
            {users && users.length > 0 && (
              <div className="search-section">
                <h3>Users</h3>
                <div className="users-list">
                  
                  {users.map((user) => (
                    <div key={user.id} className="user-result-card">

                      {/* User image */}
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="user-avatar" 
                      />

                      {/* Username and Profile Click */}
                      <div 
                        className="user-info"
                        onClick={() => {
                          onUserClick(user.id);     // ✔ open profile
                          onClose();
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="user-name">{user.name}</div>
                        <div className="user-username">@{user.name}</div>
                      </div>

                      {/* FOLLOW BUTTON */}
                      {user.id !== currentUser.id && (
                        <button
                          className={`follow-btn ${
                            follows[user.id]?.includes(currentUser.id) ? 'followed' : ''
                          }`}
                          onClick={() => toggleFollow(user.id)}
                        >
                          {follows[user.id]?.includes(currentUser.id) ? "Following" : "Follow"}
                        </button>
                      )}

                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* ---------------- VIDEOS SECTION ---------------- */}
            {videos && videos.length > 0 && (
              <div className="search-section">
                <h3>Videos</h3>
                <div className="videos-grid">

                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="video-result-card"
                      onClick={() => {
                        onVideoClick(video.id);  // ✔ open Clickz page
                        onClose();
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* video thumbnail */}
                      <video src={video.url} muted />

                      <div className="video-result-info">
                        <div className="video-result-title">{video.title}</div>
                        <div className="video-result-desc">{video.desc}</div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
