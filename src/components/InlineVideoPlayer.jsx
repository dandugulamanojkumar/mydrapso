import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/videoUtils';

export function InlineVideoPlayer({
  initialVideo,
  allVideos,
  onClose,
  currentUser,
  likes,
  setLikes,
  follows,
  setFollows,
  onUsernameClick
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [videoHistory, setVideoHistory] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const shuffled = shuffleArray(allVideos);
    const startIndex = shuffled.findIndex(v => v.id === initialVideo.id);
    if (startIndex >= 0) {
      setVideoList(shuffled);
      setCurrentIndex(startIndex);
      setVideoHistory([shuffled[startIndex]]);
    } else {
      setVideoList([initialVideo, ...shuffled]);
      setCurrentIndex(0);
      setVideoHistory([initialVideo]);
    }
  }, [initialVideo, allVideos]);

  const loadNextVideo = () => {
    if (currentIndex < videoList.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (!videoHistory.find(v => v.id === videoList[nextIndex].id)) {
        setVideoHistory(prev => [...prev, videoList[nextIndex]]);
      }
    } else {
      const availableVideos = allVideos.filter(v => !videoHistory.map(h => h.id).includes(v.id));
      if (availableVideos.length > 0) {
        const shuffled = shuffleArray(availableVideos);
        const nextVideo = shuffled[0];
        setVideoList(prev => [...prev, nextVideo]);
        setVideoHistory(prev => [...prev, nextVideo]);
        setCurrentIndex(prev => prev + 1);
      } else {
        const shuffled = shuffleArray(allVideos);
        const nextVideo = shuffled[0];
        setVideoList(prev => [...prev, nextVideo]);
        setVideoHistory(prev => [...prev, nextVideo]);
        setCurrentIndex(prev => prev + 1);
      }
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
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
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
  }, [currentIndex, videoList, videoHistory, allVideos]);

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
      });
    }
  };

  const renderActionButtons = (video) => {
    const buttons = [];

    buttons.push(
      <div key="like" className="inline-action-btn" onClick={() => toggleLike(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill={likes.includes(video.id) ? "currentColor" : "none"} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{likes.filter(id => id === video.id).length}</span>
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="inline-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
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
          className="inline-action-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Map</span>
        </div>
      );
    }

    buttons.push(
      <div key="comment" className="inline-action-btn" onClick={() => openComments(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>0</span>
      </div>
    );

    buttons.push(
      <div key="share" className="inline-action-btn" onClick={() => shareVideo(video)}>
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

  if (videoList.length === 0) return null;

  const currentVideo = videoList[currentIndex];

  return (
    <div className="inline-video-player-overlay">
      <div className="inline-video-player-container" ref={containerRef}>
        <button className="inline-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="inline-video-content">
          <video
            key={currentVideo.id}
            className="inline-video"
            src={currentVideo.url}
            controls
            autoPlay
            loop
          />

          <div className="inline-video-actions">
            {renderActionButtons(currentVideo)}
          </div>

          <div className="inline-video-info">
            <div className="inline-video-header">
              <img src={currentUser.avatar} alt="Profile" className="inline-user-avatar" />
              <div>
                <div
                  className="inline-username"
                  onClick={() => onUsernameClick && onUsernameClick(currentVideo.userId)}
                >
                  @{currentUser.name}
                </div>
                <div className="inline-video-title">{currentVideo.title}</div>
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
            <div className="inline-video-desc">{currentVideo.desc}</div>
          </div>

          <div className="inline-video-counter">
            {currentIndex + 1} / {videoList.length}
          </div>
        </div>
      </div>
    </div>
  );
}
