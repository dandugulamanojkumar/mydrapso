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
        <div className="search-results-header">
          <h2>Search Results for "{searchQuery}"</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!hasResults ? (
          <div className="no-results">
            <p>No results found</p>
          </div>
        ) : (
          <div className="search-results-content">
            {users && users.length > 0 && (
              <div className="search-section">
                <h3>Users</h3>
                <div className="users-list">
                  {users.map((user) => (
                    <div key={user.id} className="user-result-card">
                      <img src={user.avatar} alt={user.name} className="user-avatar" />
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-username">@{user.name}</div>
                        <div className="user-followers">
                          {follows[user.id]?.length || 0} followers
                        </div>
                      </div>
                      {user.id !== currentUser.id && (
                        <button
                          className={`follow-btn ${follows[user.id]?.includes(currentUser.id) ? 'followed' : ''}`}
                          onClick={() => toggleFollow(user.id)}
                        >
                          {follows[user.id]?.includes(currentUser.id) ? "Following" : "Follow"}
                        </button>
                      )}
                      <button
                        className="view-profile-btn"
                        onClick={() => {
                          onUserClick(user.id);
                          onClose();
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videos && videos.length > 0 && (
              <div className="search-section">
                <h3>Videos</h3>
                <div className="videos-grid">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="video-result-card"
                      onClick={() => {
                        onVideoClick(video.id);
                        onClose();
                      }}
                    >
                      <video src={video.url} />
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
