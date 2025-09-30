import React, { useEffect, useRef } from 'react';

interface Video {
  id: string;
  url: string;
  title: string;
  desc: string;
  userId: string;
  hasAffiliate: boolean;
  affiliateLink?: string;
  hasLocation: boolean;
  location?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface ShortsPlayerProps {
  videos: Video[];
  currentIndex: number;
  currentUser: User;
  likes: string[];
  setLikes: React.Dispatch<React.SetStateAction<string[]>>;
  follows: Record<string, string[]>;
  setFollows: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
}

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
}: ShortsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentVideo = videos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    const handleWheel = (e: WheelEvent) => {
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

  const toggleLike = (id: string) => {
    setLikes((prev) => prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]);
  };

  const toggleFollow = (uid: string) => {
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

  const openComments = (videoId: string) => {
    alert(`Comments for video ${videoId} - Feature coming soon!`);
  };

  const shareVideo = (video: Video) => {
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

  const renderActionButtons = (video: Video) => {
    const buttons = [];
    
    // Always start with Like button
    buttons.push(
      <div key="like" className="shorts-action-btn" onClick={() => toggleLike(video.id)}>
        {likes.includes(video.id) ? "❤️" : "🤍"}
        <span>{likes.filter(id => id === video.id).length}</span>
      </div>
    );
    
    // Add Cart button right after Like if affiliate is enabled
    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="shorts-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
          🛒
          <span>Shop</span>
        </div>
      );
    }
    
    // Add Location button after Like (or after Cart if both are enabled)
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
    
    // Add Comment button
    buttons.push(
      <div key="comment" className="shorts-action-btn" onClick={() => openComments(video.id)}>
        💬
        <span>0</span>
      </div>
    );
    
    // Always end with Share button
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
        
        {/* Navigation indicators */}
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