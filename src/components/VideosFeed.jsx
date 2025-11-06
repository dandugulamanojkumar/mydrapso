import React from 'react';
import { supabase } from '../lib/supabase';

export function VideosFeed({
  uploads,
  currentUser,
  likedVideoIds = [],
  followingList = [],
  onLike,
  onFollow,
  allowDelete = false,
  setUploads,
  onVideoClick,
  onUsernameClick
}) {
  if (!uploads.length) return <p className="no-videos-message">No videos yet.</p>;

  const deleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUploads && setUploads((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const openComments = (videoId) => {
    if (onVideoClick) {
      onVideoClick(videoId);
    }
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
      <button key="like" className="video-action-btn" onClick={() => onLike && onLike(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {isLiked ? "Liked" : "Like"}
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
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share
      </button>
    );

    if (allowDelete) {
      buttons.push(
        <button key="delete" className="video-action-btn video-delete-btn" onClick={() => deleteVideo(video.id)}>
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="videos-feed">
      {uploads.map((vid) => {
        const videoUser = vid.user || { username: 'Unknown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' };
        const isFollowing = followingList.includes(vid.userId);
        const isOwnVideo = currentUser?.id === vid.userId;

        return (
          <div key={vid.id} className="video-card">
            <div className="video-card-header">
              <div
                className="video-user-info"
                onClick={() => onUsernameClick && onUsernameClick(vid.userId)}
                style={{ cursor: 'pointer' }}
              >
                <img src={videoUser.avatar} alt={videoUser.username} className="user-avatar-small" />
                <span className="video-username">{videoUser.username}</span>
              </div>
              {!isOwnVideo && (
                <button
                  className={`follow-btn-small ${isFollowing ? 'following' : ''}`}
                  onClick={() => onFollow && onFollow(vid.userId)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <video
              src={vid.url}
              controls
              className="video-player"
              onClick={() => onVideoClick && onVideoClick(vid.id)}
            />

            <div className="video-info">
              <h3 className="video-title">{vid.title}</h3>
              <p className="video-description">{vid.desc}</p>
              {vid.hasLocation && vid.location && (
                <p className="video-location">
                  <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {vid.location}
                </p>
              )}
              <div className="video-stats">
                <span>{vid.likes || 0} likes</span>
                <span>{vid.views || 0} views</span>
              </div>
            </div>

            <div className="video-actions">
              {renderActionButtons(vid)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
