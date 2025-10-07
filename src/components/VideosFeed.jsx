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
  onVideoClick
}) {
  if (!uploads.length) return <p>No videos yet.</p>;

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
      <button key="like" className="icon-btn" onClick={() => toggleLike(video.id)}>
        {likes.includes(video.id) ? "❤ Liked" : "🤍 Like"}
      </button>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <button key="cart" className="icon-btn cart-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          🛒 Cart
        </button>
      );
    }

    if (video.hasLocation) {
      buttons.push(
        <button
          key="location"
          className="icon-btn location-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          📍 Location
        </button>
      );
    }

    buttons.push(
      <button key="comment" className="icon-btn" onClick={() => openComments(video.id)}>
        💬 Comment
      </button>
    );

    buttons.push(
      <button key="share" className="icon-btn" onClick={() => shareVideo(video)}>
        🔗 Share
      </button>
    );

    return buttons;
  };

  return (
    <div className="video-grid">
      {uploads.map((v) => (
        <div key={v.id} className="video-card">
          <div className="video-media-wrapper">
            <video
              controls
              onClick={() => onVideoClick && onVideoClick(v.id, uploads)}
              style={{ cursor: onVideoClick ? 'pointer' : 'default' }}
            >
              <source src={v.url} type="video/mp4" />
            </video>
            <div className="video-actions">
              {renderActionButtons(v)}
            </div>
          </div>
          <div className="video-details-content">
            <div className="video-title">{v.title}</div>
            <div className="video-meta">⏱ {Math.round(v.duration)}s</div>
            <div className="video-desc">{v.desc}</div>
          </div>
          <div className="video-meta">
            <img src={currentUser.avatar} alt="avatar" className="video-user-pic" />
            <span>@{currentUser.name}</span>
            {v.userId !== currentUser.id && (
              <button className="follow-btn" onClick={() => toggleFollow(v.userId)}>
                {follows[v.userId]?.includes(currentUser.id) ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          {allowDelete && (
            <button className="icon-btn" onClick={() => deleteVideo(v.id)}>
              🗑 Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
