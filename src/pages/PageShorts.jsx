import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/videoUtils';

export function PageShorts({
  uploads,
  currentUser,
  likes,
  setLikes,
  follows,
  setFollows
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoHistory, setVideoHistory] = useState([]);
  const [randomVideos, setRandomVideos] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (uploads.length > 0 && randomVideos.length === 0) {
      const shuffled = shuffleArray(uploads);
      setRandomVideos([shuffled[0]]);
      setVideoHistory([shuffled[0]]);
    }
  }, [uploads]);

  const loadNextVideo = () => {
    const availableVideos = uploads.filter(v => !videoHistory.map(h => h.id).includes(v.id));
    if (availableVideos.length > 0) {
      const shuffled = shuffleArray(availableVideos);
      const nextVideo = shuffled[0];
      setRandomVideos(prev => [...prev, nextVideo]);
      setVideoHistory(prev => [...prev, nextVideo]);
      setCurrentIndex(prev => prev + 1);
    } else {
      const shuffled = shuffleArray(uploads);
      const nextVideo = shuffled[0];
      setRandomVideos(prev => [...prev, nextVideo]);
      setVideoHistory(prev => [...prev, nextVideo]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    let touchStartY = 0;
    let isScrolling = false;

    const handleWheel = (e) => {
      if (isScrolling) return;
      e.preventDefault();
      isScrolling = true;

      if (e.deltaY > 50) {
        loadNextVideo();
      } else if (e.deltaY < -50) {
        goToPrevious();
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
          loadNextVideo();
        } else {
          goToPrevious();
        }
        setTimeout(() => {
          isScrolling = false;
        }, 500);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        loadNextVideo();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
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
  }, [currentIndex, videoHistory, uploads]);

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
      <div key="like" className="clickz-action-btn" onClick={() => toggleLike(video.id)}>
        {likes.includes(video.id) ? "❤️" : "🤍"}
        <span>{likes.filter(id => id === video.id).length}</span>
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="clickz-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          🛒
          <span>Shop</span>
        </div>
      );
    }

    if (video.hasLocation) {
      buttons.push(
        <div
          key="location"
          className="clickz-action-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          📍
          <span>Location</span>
        </div>
      );
    }

    buttons.push(
      <div key="comment" className="clickz-action-btn" onClick={() => openComments(video.id)}>
        💬
        <span>0</span>
      </div>
    );

    buttons.push(
      <div key="share" className="clickz-action-btn" onClick={() => shareVideo(video)}>
        📤
        <span>Share</span>
      </div>
    );

    return buttons;
  };

  if (!uploads.length || randomVideos.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>🎬 Clickz</h2>
        <p>No videos available for Clickz yet.</p>
      </div>
    );
  }

  const currentVideo = randomVideos[currentIndex];

  return (
    <div className="clickz-feed-fullscreen" ref={containerRef}>
      <div className="clickz-container-fullscreen">
        <video
          key={currentVideo.id}
          className="clickz-video-fullscreen"
          src={currentVideo.url}
          controls
          loop
          autoPlay
          muted={false}
        />

        <div className="clickz-actions">
          {renderActionButtons(currentVideo)}
        </div>

        <div className="clickz-profile">
          <img src={currentUser.avatar} alt="Profile" />
          <div>
            <div className="clickz-username">@{currentUser.name}</div>
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>
              {currentVideo.title}
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.6 }}>
              {currentVideo.desc}
            </div>
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
  );
}
