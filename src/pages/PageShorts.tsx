import React from 'react';

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

interface PageShortsProps {
  uploads: Video[];
  currentUser: User;
  likes: string[];
  setLikes: React.Dispatch<React.SetStateAction<string[]>>;
  follows: Record<string, string[]>;
  setFollows: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

export function PageShorts({ 
  uploads, 
  currentUser, 
  likes, 
  setLikes, 
  follows, 
  setFollows 
}: PageShortsProps) {
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
    // TODO: Implement comment section
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
      // Fallback: copy to clipboard
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
      <div key="like" className="clickz-action-btn" onClick={() => toggleLike(video.id)}>
        {likes.includes(video.id) ? "❤️" : "🤍"}
        <span>{likes.filter(id => id === video.id).length}</span>
      </div>
    );
    
    // Add Cart button right after Like if affiliate is enabled
    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="clickz-action-btn" onClick={() => window.open(video.affiliateLink, "_blank")}>
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
          className="clickz-action-btn" 
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location || '')}`, "_blank")}
        >
          📍
          <span>Location</span>
        </div>
      );
    }
    
    // Add Comment button
    buttons.push(
      <div key="comment" className="clickz-action-btn" onClick={() => openComments(video.id)}>
        💬
        <span>0</span>
      </div>
    );
    
    // Always end with Share button
    buttons.push(
      <div key="share" className="clickz-action-btn" onClick={() => shareVideo(video)}>
        📤
        <span>Share</span>
      </div>
    );
    
    return buttons;
  };

  if (!uploads.length) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>🎬 Clickz</h2>
        <p>No videos available for Clickz yet.</p>
      </div>
    );
  }

  return (
    <div className="clickz-feed">
      {uploads.map((video) => (
        <div key={video.id} className="clickz-container">
          <video 
            className="clickz-video"
            src={video.url}
            controls
            loop
            muted
            autoPlay={false}
          />
          
          <div className="clickz-actions">
            {renderActionButtons(video)}
          </div>
          
          <div className="clickz-profile">
            <img src={currentUser.avatar} alt="Profile" />
            <div>
              <div className="clickz-username">@{currentUser.name}</div>
              <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>
                {video.title}
              </div>
              <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.6 }}>
                {video.desc}
              </div>
            </div>
            {video.userId !== currentUser.id && (
              <button 
                className={`follow-btn ${follows[video.userId]?.includes(currentUser.id) ? 'followed' : ''}`}
                onClick={() => toggleFollow(video.userId)}
              >
                {follows[video.userId]?.includes(currentUser.id) ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}