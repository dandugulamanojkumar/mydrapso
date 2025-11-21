import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/videoUtils';
import { CommentsPanel } from './CommentsPanel';
import { ArrowLeft, ShoppingCart, X } from 'lucide-react';
import { getVideoProducts } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { FollowButton } from './FollowButton';

export function InlineVideoPlayer({
  initialVideo,
  allVideos,
  onClose,
  currentUser,
  likedVideoIds,
  followingList,
  onLike,
  onFollow,
  onUsernameClick,
  setUploads
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [videoHistory, setVideoHistory] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const shuffled = shuffleArray(allVideos || []);
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
      const usedIds = videoHistory.map(h => h.id);
      const availableVideos = (allVideos || []).filter(v => !usedIds.includes(v.id));
      if (availableVideos.length > 0) {
        const shuffled = shuffleArray(availableVideos);
        const nextVideo = shuffled[0];
        setVideoList(prev => [...prev, nextVideo]);
        setVideoHistory(prev => [...prev, nextVideo]);
        setCurrentIndex(prev => prev + 1);
      } else {
        // fallback: reshuffle everything
        const shuffled = shuffleArray(allVideos || []);
        const nextVideo = shuffled[0];
        if (nextVideo) {
          setVideoList(prev => [...prev, nextVideo]);
          setVideoHistory(prev => [...prev, nextVideo]);
          setCurrentIndex(prev => prev + 1);
        }
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
        onClose && onClose();
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

  const handleLike = (id) => {
    if (onLike) onLike(id);
  };

  const handleFollow = (uid) => {
    if (onFollow) onFollow(uid);
  };

  const openComments = (videoId) => {
    setShowComments(true);
  };

  const closeComments = () => {
    setShowComments(false);
    if (currentVideo) loadCommentCount(currentVideo.id);
  };

  const loadCommentCount = async (videoId) => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);

      if (!error) {
        setCommentCounts(prev => ({ ...prev, [videoId]: count || 0 }));
      }
    } catch (error) {
      console.error('Load comment count error:', error);
    }
  };

  useEffect(() => {
    if (!currentVideo) return;
    loadCommentCount(currentVideo.id);
    if (currentVideo.hasAffiliate) {
      loadProducts(currentVideo.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* intentionally empty to avoid double calls */ currentIndex, videoList]);

  const loadProducts = async (videoId) => {
    setLoadingProducts(true);
    try {
      const productData = await getVideoProducts(videoId);
      setProducts(productData);
    } catch (error) {
      console.error('Load products error:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openProductCart = () => {
    setShowProducts(true);
  };

  const closeProductCart = () => {
    setShowProducts(false);
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

    const isLiked = (likedVideoIds || []).includes(video.id);
    buttons.push(
      <div key="like" className="inline-action-btn" onClick={() => handleLike(video.id)}>
        <svg className="action-icon" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{video.likes || 0}</span>
      </div>
    );

    if (video.hasAffiliate) {
      buttons.push(
        <div key="cart" className="inline-action-btn" onClick={openProductCart}>
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
        <span>{commentCounts[video.id] || 0}</span>
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

  // derive owner safely (supports array or object or fallbacks)
  const deriveOwner = (video) => {
    if (!video) return null;
    // if video.user is set and is array or object
    if (video.user) {
      const u = Array.isArray(video.user) ? video.user[0] : video.user;
      if (u && (u.id || u.username || u.avatar)) {
        return {
          id: u.id || video.userId,
          username: u.username || u.full_name || u.name,
          avatar: u.avatar || u.avatar_url || ''
        };
      }
    }
    // fallbacks: sometimes fields are userName / userAvatar
    if (video.userName || video.userAvatar) {
      return {
        id: video.userId,
        username: video.userName || video.userId,
        avatar: video.userAvatar || ''
      };
    }
    // minimal fallback
    return {
      id: video.userId,
      username: video.userId || 'unknown',
      avatar: ''
    };
  };

  const owner = deriveOwner(currentVideo);
  const isOwnerCurrentUser = owner && currentUser && owner.id === currentUser.id;
  const isFollowingOwner = owner ? followingList.includes(owner.id) : false;

  return (
    <div className="inline-video-player-overlay">
      <div className="inline-video-player-container" ref={containerRef}>
        <button className="inline-back-btn" onClick={onClose}>
          <ArrowLeft size={28} strokeWidth={2.5} />
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
              <img
                src={owner?.avatar || currentVideo.user?.avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="Profile"
                className="inline-user-avatar"
              />
              <div>
                <div
                  className="inline-username"
                  onClick={() => onUsernameClick && onUsernameClick(owner?.id || currentVideo.userId)}
                  style={{ cursor: 'pointer' }}
                >
                  @{owner?.username || currentVideo.user?.username || currentUser?.name || (owner?.id || '').toString()}
                </div>
                <div className="inline-video-title">{currentVideo.title}</div>
              </div>

              {/* show follow button for owner if not current user */}
              {!isOwnerCurrentUser && (
                // prefer to use FollowButton component if available (it handles check & toggles)
                <div style={{ marginLeft: 'auto' }}>
                  <FollowButton
                    viewerId={currentUser?.id}
                    targetId={owner?.id}
                    onToggle={() => {
                      // notify parent App state to update followingList if they provided onFollow
                      onFollow && onFollow(owner?.id);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="inline-video-desc">{currentVideo.desc}</div>
          </div>

          <div className="inline-video-counter">
            {currentIndex + 1} / {videoList.length}
          </div>
        </div>
      </div>

      {showComments && currentVideo && (
        <CommentsPanel
          videoId={currentVideo.id}
          currentUser={currentUser}
          onClose={closeComments}
          onCommentAdded={(videoId) => {
            setCommentCounts(prev => ({
              ...prev,
              [videoId]: (prev[videoId] || 0) + 1
            }));
            if (setUploads) {
              setUploads(prevUploads =>
                prevUploads.map(v =>
                  v.id === videoId ? { ...v, comments_count: (v.comments_count || 0) + 1 } : v
                )
              );
            }
          }}
        />
      )}

      {showProducts && (
        <div className="products-cart-overlay" onClick={(e) => e.target.classList.contains('products-cart-overlay') && closeProductCart()}>
          <div className="products-cart">
            <div className="products-cart-header">
              <h3>Products</h3>
              <button className="close-cart-btn" onClick={closeProductCart}>
                <X size={24} />
              </button>
            </div>
            <div className="products-cart-content">
              {loadingProducts ? (
                <div className="products-loading">Loading products...</div>
              ) : products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="product-item" onClick={() => window.open(product.product_url, '_blank')}>
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="product-image" />
                    )}
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      {product.description && <p className="product-description">{product.description}</p>}
                      {product.price && <p className="product-price">{product.price}</p>}
                    </div>
                    <div className="product-action">
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>No products available for this video.</p>
                  {currentVideo.affiliateLink && (
                    <button
                      className="btn btn-primary"
                      onClick={() => window.open(currentVideo.affiliateLink, '_blank')}
                    >
                      Visit Affiliate Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

