import React from 'react';

export function VideosFeed({
  uploads,
  currentUser,
  likes,
  setLikes,
  follows,
  setFollows,
  allowDelete = false,
  setUploads,
  onVideoClick,
  onUsernameClick
}) {
  if (!uploads.length) return <p className="no-videos-message">No videos yet.</p>;

  const toggleLike = (id) => {
    setLikes((prev) => prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]);
  };

  const toggleFollow = (uid) => {
    setFollows((prev) => {
      const copy = { ...prev };
      if (!copy[uid]) copy[uid] = [];
      if (copy[uid].includes(currentUser.id)) {
        copy[uid] = copy[uid].filter((id) => id !== currentUser.id);
      } else {
        copy[uid].push(currentUser.id);
      }
      return copy;
    });
  };

  const deleteVideo = (id) => setUploads && setUploads((prev) => prev.filter((v) => v.id !== id));

  const openComments = (videoId) => {
    alert(`Comments for video ${videoId} - Feature coming soon!`);
  };

  const shareVideo = (video) => {
    const shareData = {
      title: video.title,
      text: video.desc,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Video link copied to clipboard!');
      }).catch(() => {
        alert('Copy this link to share: ' + window.location.href);
      });
    }
  };

  const renderActionButtons = (video) => {
    const buttons = [];

    buttons.push(
      <button key="like" className="video-action-btn" onClick={() => toggleLike(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill={likes.includes(video.id) ? "currentColor" : "none"} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {likes.includes(video.id) ? "Liked" : "Like"}
      </button>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <button key="cart" className="video-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Shop
        </button>
      );
    }

    if (video.hasLocation) {
      buttons.push(
        <button
          key="location"
          className="video-action-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Location
        </button>
      );
    }

    buttons.push(
      <button key="comment" className="video-action-btn" onClick={() => openComments(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Comment
      </button>
    );

    buttons.push(
      <button key="share" className="video-action-btn" onClick={() => shareVideo(video)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share
      </button>
    );

    return buttons;
  };

  return (
    <div className="video-grid">
      {uploads.map((v, index) => (
        <div key={v.id} className="video-card" style={{ animationDelay: `${index * 0.05}s` }}>
          <div className="video-media-wrapper" onClick={() => onVideoClick && onVideoClick(v.id)}>
            <video controls onClick={(e) => e.stopPropagation()}>
              <source src={v.url} type="video/mp4" />
            </video>
          </div>
          <div className="video-details-content">
            <div className="video-title">{v.title}</div>
            <div className="video-meta-info">
              <span className="video-duration">⏱ {Math.round(v.duration)}s</span>
            </div>
            <div className="video-desc">{v.desc}</div>
          </div>
          <div className="video-actions">
            {renderActionButtons(v)}
          </div>
          <div className="video-user-info">
            <img src={currentUser.avatar} alt="avatar" className="video-user-pic" />
            <span
              className="video-username"
              onClick={() => onUsernameClick && onUsernameClick(v.userId)}
            >
              @{currentUser.name}
            </span>
            {v.userId !== currentUser.id && (
              <button className="follow-btn" onClick={() => toggleFollow(v.userId)}>
                {follows[v.userId]?.includes(currentUser.id) ? "Following" : "Follow"}
              </button>
            )}
          </div>
          {allowDelete && (
            <button className="delete-video-btn" onClick={() => deleteVideo(v.id)}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
