import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/videoUtils';

export function PageShorts({
  uploads,
  currentUser,
  likedVideoIds = [],
  followingList = [],
  onLike,
  onFollow,
  onUsernameClick
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
    const isLiked = likedVideoIds.includes(video.id);

    buttons.push(
      <div key="like" className="shorts-action-btn" onClick={() => onLike && onLike(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{video.likes || 0}</span>
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="shorts-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
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
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Location</span>
        </div>
      );
    }

    buttons.push(
      <div key="comment" className="shorts-action-btn" onClick={() => openComments(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>0</span>
      </div>
    );

    buttons.push(
      <div key="share" className="shorts-action-btn" onClick={() => shareVideo(video)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span>Share</span>
      </div>
    );

    return buttons;
  };

  if (!uploads.length || randomVideos.length === 0) {
    return (
      <div className="no-videos-message" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Clickz</h2>
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

        <div className="shorts-profile">
          <img src={currentVideo.user?.avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="Profile" />
          <div>
            <div
              className="shorts-username shorts-username-clickable"
              onClick={() => onUsernameClick && onUsernameClick(currentVideo.userId)}
            >
              @{currentVideo.user?.username || currentUser?.name || 'Unknown'}
            </div>
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>
              {currentVideo.title}
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.6 }}>
              {currentVideo.desc}
            </div>
          </div>
          {currentVideo.userId !== currentUser?.id && (
            <button
              className={`follow-btn ${followingList.includes(currentVideo.userId) ? 'followed' : ''}`}
              onClick={() => onFollow && onFollow(currentVideo.userId)}
            >
              {followingList.includes(currentVideo.userId) ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="clickz-scroll-hint">
          Scroll to see more videos
        </div>
      </div>
    </div>
  );
}
