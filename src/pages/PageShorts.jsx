// src/pages/PageShorts.jsx
import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/videoUtils';
import { ShortsPlayer } from '../components/ShortsPlayer'; // assume path
import { CommentsPanel } from '../components/CommentsPanel';

export function PageShorts({
  uploads = [],
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
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (uploads.length > 0) {
      const shuffled = shuffleArray(uploads);
      // If we already had randomVideos, preserve it; otherwise seed with first item.
      if (randomVideos.length === 0) {
        setRandomVideos([shuffled[0]]);
        setVideoHistory([shuffled[0]]);
        setCurrentIndex(0);
      }
    }
    // only run when uploads change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads]);

  const openPlayerAt = (index) => {
    // Ensure index exists in randomVideos; if not, add it.
    const vid = randomVideos[index] || uploads.find(v => v.id === (randomVideos[index]?.id)) || uploads[index];
    if (!vid) return;

    // If clicked video isn't already in randomVideos, insert it at currentIndex.
    if (!randomVideos.find(v => v.id === vid.id)) {
      setRandomVideos(prev => {
        const copy = [...prev];
        copy[index] = vid;
        return copy;
      });
      setVideoHistory(prev => [...prev, vid]);
    }

    setCurrentIndex(index);
    setShowPlayer(true);
  };

  const loadNextVideo = () => {
    const usedIds = videoHistory.map(h => h.id);
    const availableVideos = uploads.filter(v => !usedIds.includes(v.id));
    if (availableVideos.length > 0) {
      const shuffled = shuffleArray(availableVideos);
      const next = shuffled[0];
      setRandomVideos(prev => [...prev, next]);
      setVideoHistory(prev => [...prev, next]);
      setCurrentIndex(prev => prev + 1);
    } else if (uploads.length > 0) {
      // fall back to reshuffle all uploads
      const shuffled = shuffleArray(uploads);
      const next = shuffled[0];
      setRandomVideos(prev => [...prev, next]);
      setVideoHistory(prev => [...prev, next]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
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
      setTimeout(() => (isScrolling = false), 400);
    };

    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      if (isScrolling) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        isScrolling = true;
        if (diff > 0) loadNextVideo();
        else goToPrevious();
        setTimeout(() => (isScrolling = false), 400);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, videoHistory, uploads, randomVideos]);

  const openComments = (videoId) => {
    // open player and open its comments — simplified: open player then it can open CommentsPanel
    const idx = randomVideos.findIndex(v => v.id === videoId);
    if (idx >= 0) {
      setCurrentIndex(idx);
      setShowPlayer(true);
      // ShortsPlayer has its own comments toggling; we don't force it here
    } else {
      // ensure the clicked video is added and opened
      const foundIndex = uploads.findIndex(v => v.id === videoId);
      if (foundIndex >= 0) {
        // append the clicked video then open it
        const vid = uploads[foundIndex];
        setRandomVideos(prev => [...prev, vid]);
        setVideoHistory(prev => [...prev, vid]);
        setCurrentIndex(randomVideos.length);
        setShowPlayer(true);
      }
    }
  };

  const shareVideo = (video) => {
    const shareData = { title: video.title, text: video.desc, url: window.location.href };
    if (navigator.share) navigator.share(shareData).catch(() => navigator.clipboard.writeText(window.location.href));
    else navigator.clipboard.writeText(window.location.href).then(() => alert('Video link copied to clipboard!'));
  };

  const openProfile = (userId) => {
    onUsernameClick && onUsernameClick(userId);
  };

  if (!uploads || uploads.length === 0) {
    return (
      <div className="no-videos-message" style={{ textAlign: 'center', marginTop: 100 }}>
        <h2>Clickz</h2>
        <p>No videos available for Clickz yet.</p>
      </div>
    );
  }

  // render a simple stacked list for small thumbnails — clicking opens ShortsPlayer at that index
  return (
    <div className="clickz-feed-fullscreen" ref={containerRef}>
      <div className="clickz-container-fullscreen" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {uploads.map((v, idx) => (
            <div key={v.id} className="video-grid-card" style={{ cursor: 'pointer' }}
              onClick={() => {
                // ensure the clicked video is present in randomVideos at currentIndex
                const inListIndex = randomVideos.findIndex(rv => rv.id === v.id);
                if (inListIndex >= 0) {
                  setCurrentIndex(inListIndex);
                } else {
                  setRandomVideos(prev => [...prev, v]);
                  setVideoHistory(prev => [...prev, v]);
                  setCurrentIndex(randomVideos.length);
                }
                setShowPlayer(true);
              }}
            >
              <div className="video-thumbnail-wrapper">
                <video src={v.url} className="video-thumbnail" preload="metadata" muted />
                <div className="video-overlay">
                  <svg className="play-icon" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div className="video-grid-info">
                <div className="video-grid-user" onClick={(e) => { e.stopPropagation(); openProfile(v.userId); }}>
                  <img src={(v.user && (v.user.avatar || v.user[0]?.avatar)) || currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} className="video-grid-avatar" alt="u" />
                  <div className="video-grid-user-details">
                    <span className="video-grid-username">@{(v.user && (v.user.username || v.user[0]?.username)) || v.user?.username || 'unknown'}</span>
                  </div>
                </div>
                <h4 className="video-grid-title">{v.title}</h4>
                <div className="video-grid-stats">
                  <span>{v.likes || 0} likes</span>
                  <span>{v.views || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPlayer && (
        <ShortsPlayer
          videos={randomVideos.length ? randomVideos : uploads}
          currentIndex={currentIndex}
          currentUser={currentUser}
          likes={likedVideoIds}
          setLikes={() => {}}
          follows={{}} // ShortsPlayer will call onFollow instead of using this prop
          setFollows={() => {}}
          onClose={() => setShowPlayer(false)}
          onNavigate={(dir) => {
            if (dir === 'next') loadNextVideo();
            else if (dir === 'prev') goToPrevious();
          }}
          onLike={(id) => onLike && onLike(id)}
          onFollow={(uid) => onFollow && onFollow(uid)}
          onUsernameClick={(uid) => onUsernameClick && onUsernameClick(uid)}
        />
      )}
    </div>
  );
}

