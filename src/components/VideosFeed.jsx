// src/components/VideosFeed.jsx
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
  if (!uploads || uploads.length === 0) return <p className="no-videos-message">No videos yet.</p>;

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
    // open inline player comments by delegating to onVideoClick (App opens InlinePlayer)
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
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Video link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Video link copied to clipboard!');
      }).catch(() => {
        alert('Copy this link to share: ' + window.location.href);
      });
    }
  };

  return (
    <div className="videos-grid-container">
      {uploads.map((vid) => {
        // normalize owner shape: supabase sometimes returns users as array (users) or single object (user)
        const owner = (vid.user && Array.isArray(vid.user) && vid.user[0]) || vid.user || vid.users?.[0] || { username: 'unknown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', id: vid.userId };

        const isLiked = likedVideoIds.includes(vid.id);
        const isFollowing = followingList.includes(owner?.id || vid.userId);
        const isOwnVideo = currentUser?.id === (owner?.id || vid.userId);

        return (
          <div key={vid.id} className="video-grid-card">
            {/* VIDEO THUMBNAIL */}
            <div
              className="video-thumbnail-wrapper"
              onClick={() => onVideoClick && onVideoClick(vid.id)}
            >
              <video
                src={vid.url}
                className="video-thumbnail"
                preload="metadata"
                muted
              />
              <div className="video-overlay">
                <svg className="play-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="video-duration">
                {Math.floor((vid.duration || 0) / 60)}:
                {((vid.duration || 0) % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* BOTTOM INFO */}
            <div className="video-grid-info">
              {/* USER HEADER */}
              <div
                className="video-grid-user"
                onClick={() => onUsernameClick && onUsernameClick(owner?.id || vid.userId)}
                role="button"
                tabIndex={0}
              >
                <img
                  src={owner?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={owner?.username || 'user'}
                  className="video-grid-avatar"
                />

                <div className="video-grid-user-details">
                  <span className="video-grid-username">@{owner?.username || owner?.full_name || 'unknown'}</span>

                  {/* tiny follow button next to username (not shown for own videos) */}
                  {!isOwnVideo && (
                    <button
                      className={`follow-btn-tiny ${isFollowing ? 'following' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFollow && onFollow(owner?.id || vid.userId);
                      }}
                      title={isFollowing ? 'Unfollow' : 'Follow'}
                    >
                      {isFollowing ? '✓' : '+'}
                    </button>
                  )}
                </div>
              </div>

              <h4 className="video-grid-title">{vid.title}</h4>
              <p className="video-grid-description">{vid.desc}</p>

              {vid.hasLocation && vid.location && (
                <p className="video-grid-location">
                  <svg className="location-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {vid.location}
                </p>
              )}

              <div className="video-grid-stats">
                <span>{vid.likes || 0} likes</span>
                <span>{vid.comments_count || 0} comments</span>
                <span>{vid.views || 0} views</span>
              </div>

              <div className="video-grid-actions">
                <button
                  className={`action-btn-small ${isLiked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike && onLike(vid.id);
                  }}
                  title={isLiked ? "Unlike" : "Like"}
                >
                  <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>

                {vid.hasAffiliate && (
                  <button
                    className="action-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(vid.affiliateLink, "_blank");
                    }}
                    title="Shop"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </button>
                )}

                <button
                  className="action-btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openComments(vid.id);
                  }}
                  title="Comment"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>

                <button
                  className="action-btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareVideo(vid);
                  }}
                  title="Share"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>

                {allowDelete && (
                  <button
                    className="action-btn-small delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideo(vid.id);
                    }}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


