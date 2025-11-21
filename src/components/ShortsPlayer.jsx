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
    let touchStartY = 0;
    let isScrolling = false;

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
      if (isScrolling) return;

      e.preventDefault();
      isScrolling = true;

      if (e.deltaY > 50) {
        onNavigate('next');
      } else if (e.deltaY < -50) {
        onNavigate('prev');
      }

      setTimeout(() => {
        isScrolling = false;
      }, 500);
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        isScrolling = true;
        if (diff > 0) {
          onNavigate('next');
        } else {
          onNavigate('prev');
        }
        setTimeout(() => {
          isScrolling = false;
        }, 500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
      containerRef.current.addEventListener('touchstart', handleTouchStart);
      containerRef.current.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, videos.length, onClose, onNavigate]);

  const toggleLike = (id) => {
    setLikes((prev) => prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]);
  };

  const toggleFollowUser = (uid) => {
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
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="shorts-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          🛒
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
        </div>
      );
    }

    buttons.push(
      <div key="comment" className="shorts-action-btn" onClick={() => openComments(video.id)}>
        💬
      </div>
    );

    buttons.push(
      <div key="share" className="shorts-action-btn" onClick={() => shareVideo(video)}>
        📤
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
          />

          <div className="shorts-actions">
            {renderActionButtons(currentVideo)}
          </div>

          <div className="shorts-info">
            <div className="shorts-profile">

              {/* SHOW THE VIDEO OWNER, NOT CURRENT USER */}
              <img src={currentVideo.userAvatar} alt="Profile" />

              <div>
                <div className="shorts-username">@{currentVideo.userName}</div>
                <div className="shorts-title">{currentVideo.title}</div>
                <div className="shorts-desc">{currentVideo.desc}</div>
              </div>

              {/* FOLLOW BUTTON FOR VIDEO OWNER */}
              {currentVideo.userId !== currentUser.id && (
                <button
                  className={`follow-btn ${follows[currentVideo.userId]?.includes(currentUser.id) ? 'followed' : ''}`}
                  onClick={() => toggleFollowUser(currentVideo.userId)}
                >
                  {follows[currentVideo.userId]?.includes(currentUser.id) ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="shorts-counter">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>
    </div>
  );
}

