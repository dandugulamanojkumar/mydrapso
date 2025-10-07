import React, { useEffect, useRef } from 'react';

export function ShortsPlayer({
  videos,
  currentIndex,
  currentUser,
  likes,
  setLikes,
  follows,
  setFollows,
  onClose,
  onNavigate
}) {
  const containerRef = useRef(null);
  const currentVideo = videos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('next');
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        onNavigate('next');
      } else if (e.deltaY < 0 && currentIndex > 0) {
        onNavigate('prev');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', handleWheel);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, videos.length, onClose, onNavigate]);

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
      <div key="like" className="shorts-action-btn" onClick={() => toggleLike(video.id)}>
        {likes.includes(video.id) ? "❤️" : "🤍"}
        <span>{likes.filter(id => id === video.id).length}</span>
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="shorts-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          🛒
          <span>Shop</span>
        </div>
      );
    }

    if (video.hasLocation) {
      buttons.push(
        <div
          key="location"
          className="shorts-action-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          📍
          <span>Map</span>
        </div>
      );
    }

    buttons.push(
      <div key="comment" className="shorts-action-btn" onClick={() => openComments(video.id)}>
        💬
        <span>0</span>
      </div>
    );

    buttons.push(
      <div key="share" className="shorts-action-btn" onClick={() => shareVideo(video)}>
        📤
        <span>Share</span>
      </div>
    );

    return buttons;
  };

  if (!currentVideo) return null;

  return (
    <div className="shorts-player-overlay" ref={containerRef}>
      <div className="shorts-player-container">
        <button className="shorts-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="shorts-video-container">
          <video
            className="shorts-video"
            src={currentVideo.url}
            controls
            autoPlay
            loop
            muted={false}
          />

          <div className="shorts-actions">
            {renderActionButtons(currentVideo)}
          </div>

          <div className="shorts-info">
            <div className="shorts-profile">
              <img src={currentUser.avatar} alt="Profile" />
              <div>
                <div className="shorts-username">@{currentUser.name}</div>
                <div className="shorts-title">{currentVideo.title}</div>
                <div className="shorts-desc">{currentVideo.desc}</div>
              </div>
              {currentVideo.userId !== currentUser.id && (
                <button
                  className={`follow-btn ${follows[currentVideo.userId]?.includes(currentUser.id) ? 'followed' : ''}`}
                  onClick={() => toggleFollow(currentVideo.userId)}
                >
                  {follows[currentVideo.userId]?.includes(currentUser.id) ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="shorts-navigation">
          {currentIndex > 0 && (
            <button className="shorts-nav-btn shorts-nav-up" onClick={() => onNavigate('prev')}>
              ↑
            </button>
          )}
          {currentIndex < videos.length - 1 && (
            <button className="shorts-nav-btn shorts-nav-down" onClick={() => onNavigate('next')}>
              ↓
            </button>
          )}
        </div>

        <div className="shorts-counter">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>
    </div>
  );
}
