// src/components/ShortsPlayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CommentsPanel } from './CommentsPanel';
import { ShoppingCart, X } from 'lucide-react';
import { getVideoProducts } from '../lib/supabase';

export function ShortsPlayer({
  videos = [],
  currentIndex: initialIndex = 0,
  currentUser,
  likes = [],
  setLikes, // not used locally; parent manages likes via onLike
  follows = {},
  setFollows,
  onClose,
  onNavigate,
  onLike,      // function(videoId)
  onFollow,    // function(userId)
  onUsernameClick
}) {
  const containerRef = useRef(null);
  const [currentIdx, setCurrentIdx] = useState(initialIndex || 0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setCurrentIdx(initialIndex || 0);
  }, [initialIndex, videos]);

  useEffect(() => {
    let touchStartY = 0;
    const handleWheel = (e) => {
      if (isScrolling) return;
      e.preventDefault();
      setIsScrolling(true);
      if (e.deltaY > 50) {
        handleNavigate('next');
      } else if (e.deltaY < -50) {
        handleNavigate('prev');
      }
      setTimeout(() => setIsScrolling(false), 400);
    };

    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      if (isScrolling) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        setIsScrolling(true);
        if (diff > 0) handleNavigate('next');
        else handleNavigate('prev');
        setTimeout(() => setIsScrolling(false), 400);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      else if (e.key === 'ArrowDown') handleNavigate('next');
      else if (e.key === 'ArrowUp') handleNavigate('prev');
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
  }, [isScrolling, currentIdx, videos]);

  useEffect(() => {
    // when video changes, load products and comment count
    const cv = videos[currentIdx];
    if (cv) {
      if (cv.hasAffiliate) loadProducts(cv.id);
      // loading comment count could use a backend route or supabase lib; omitted here to keep code safe
      // optionally set commentCounts[cv.id] from cv.comments_count if present
      if (typeof cv.comments_count !== 'undefined') {
        setCommentCounts(prev => ({ ...prev, [cv.id]: cv.comments_count }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, videos]);

  const handleNavigate = (dir) => {
    if (dir === 'next') {
      if (currentIdx < videos.length - 1) setCurrentIdx(currentIdx + 1);
      else {
        // if parent provided onNavigate, call it for loading next
        onNavigate && onNavigate('next');
      }
    } else if (dir === 'prev') {
      if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
      else onNavigate && onNavigate('prev');
    }
  };

  const handleLike = (videoId, e) => {
    e && e.stopPropagation();
    onLike && onLike(videoId);
  };

  const handleFollow = (userId, e) => {
    e && e.stopPropagation();
    onFollow && onFollow(userId);
  };

  const openComments = (videoId) => {
    setShowComments(true);
  };

  const closeComments = () => {
    setShowComments(false);
  };

  const loadProducts = async (videoId) => {
    setLoadingProducts(true);
    try {
      const items = await getVideoProducts(videoId);
      setProducts(items || []);
    } catch (err) {
      console.error('Load products error', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openProductCart = () => setShowProducts(true);
  const closeProductCart = () => setShowProducts(false);

  const shareVideo = (video) => {
    const shareData = { title: video.title, text: video.desc, url: window.location.href };
    if (navigator.share) navigator.share(shareData).catch(() => navigator.clipboard.writeText(window.location.href));
    else navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied'));
  };

  if (!videos || videos.length === 0) return null;
  const currentVideo = videos[currentIdx] || videos[0];
  const owner = (currentVideo.user && Array.isArray(currentVideo.user) && currentVideo.user[0]) || currentVideo.user || { id: currentVideo.userId, username: 'unknown', avatar: null };
  const isOwnerCurrentUser = owner?.id === currentUser?.id;
  const isLiked = likes.includes(currentVideo.id);
  const isFollowing = followingListIncludes(follows, owner?.id);

  function followingListIncludes(followsMapOrArray, id) {
    // parent may pass followingList as array; ShortsPlayer originally expected object map — support both
    if (!id) return false;
    if (Array.isArray(followsMapOrArray)) return followsMapOrArray.includes(id);
    if (typeof followsMapOrArray === 'object') {
      // if map keyed by user id contains array of follower ids
      return followsMapOrArray[id] ? followsMapOrArray[id].includes(currentUser?.id) : false;
    }
    return false;
  }

  return (
    <div className="clickz-feed-fullscreen" style={{ position: 'fixed', top: 60, left: 240, right: 0, bottom: 0, zIndex: 2000 }} ref={containerRef}>
      <div className="clickz-container-fullscreen">
        <video
          key={currentVideo.id}
          className="clickz-video-fullscreen"
          src={currentVideo.url}
          controls
          autoPlay
          loop
          muted={false}
        />

        {/* Action buttons (right side) */}
        <div className="clickz-actions">
          <div className="clickz-action-btn" onClick={(e) => handleLike(currentVideo.id, e)} title="Like">
            {isLiked ? "❤️" : "🤍"}
            <span>{currentVideo.likes || 0}</span>
          </div>

          {currentVideo.hasAffiliate && (
            <div className="clickz-action-btn" onClick={(e) => { e.stopPropagation(); openProductCart(); }} title="Shop">
              <ShoppingCart size={20} />
              <span>Shop</span>
            </div>
          )}

          {currentVideo.hasLocation && (
            <div className="clickz-action-btn" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentVideo.location || '')}`, '_blank')} title="Location">
              📍
              <span>Map</span>
            </div>
          )}

          <div className="clickz-action-btn" onClick={() => openComments(currentVideo.id)} title="Comments">
            💬
            <span>{commentCounts[currentVideo.id] || 0}</span>
          </div>

          <div className="clickz-action-btn" onClick={() => shareVideo(currentVideo)} title="Share">
            📤
            <span>Share</span>
          </div>
        </div>

        {/* Profile / info (left bottom) */}
        <div className="clickz-profile" style={{ left: 16, bottom: 20 }}>
          <img src={owner?.avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="Profile" />
          <div>
            <div className="clickz-username clickz-username-clickable" onClick={() => onUsernameClick && onUsernameClick(owner?.id)}>
              @{owner?.username || currentUser?.name || 'Unknown'}
            </div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.8 }}>{currentVideo.title}</div>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.6 }}>{currentVideo.desc}</div>
          </div>
          {!isOwnerCurrentUser && (
            <button
              className={`follow-btn ${isFollowing ? 'followed' : ''}`}
              onClick={(e) => handleFollow(owner?.id, e)}
              style={{ marginLeft: 12 }}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="clickz-scroll-hint">Scroll to see more videos</div>
      </div>

      {/* Comments Panel */}
      {showComments && currentVideo && (
        <CommentsPanel
          videoId={currentVideo.id}
          currentUser={currentUser}
          onClose={() => setShowComments(false)}
          onCommentAdded={(videoId) => {
            setCommentCounts(prev => ({ ...prev, [videoId]: (prev[videoId] || 0) + 1 }));
          }}
        />
      )}

      {/* Products Cart */}
      {showProducts && (
        <div className="products-cart-overlay" onClick={(e) => e.target.classList.contains('products-cart-overlay') && closeProductCart()}>
          <div className="products-cart">
            <div className="products-cart-header">
              <h3>Products</h3>
              <button className="close-cart-btn" onClick={closeProductCart}><X size={20} /></button>
            </div>
            <div className="products-cart-content">
              {loadingProducts ? (
                <div className="products-loading">Loading products...</div>
              ) : products.length ? (
                products.map(p => (
                  <div key={p.id} className="product-item" onClick={() => window.open(p.product_url, '_blank')}>
                    {p.image_url && <img src={p.image_url} className="product-image" alt={p.name} />}
                    <div className="product-info">
                      <h4 className="product-name">{p.name}</h4>
                      {p.description && <p className="product-description">{p.description}</p>}
                      {p.price && <p className="product-price">{p.price}</p>}
                    </div>
                    <div className="product-action"><ShoppingCart size={18} /></div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>No products available for this video.</p>
                  {currentVideo.affiliateLink && <button className="btn btn-primary" onClick={() => window.open(currentVideo.affiliateLink, '_blank')}>Visit Affiliate Link</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


