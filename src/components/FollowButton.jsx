import React, { useEffect, useState } from 'react';
import { checkIfFollowing, followUser, unfollowUser } from '../lib/supabase';

export function FollowButton({ viewerId, targetId, onToggle }) {
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!viewerId || !targetId) {
        setIsFollowing(false);
        return;
      }
      try {
        const res = await checkIfFollowing(viewerId, targetId);
        if (mounted) setIsFollowing(res);
      } catch (e) {
        console.error('FollowButton: checkIfFollowing error', e);
      }
    };
    init();
    return () => { mounted = false; };
  }, [viewerId, targetId]);

  const toggle = async (e) => {
    e.stopPropagation();
    if (!viewerId || !targetId || viewerId === targetId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(viewerId, targetId);
        setIsFollowing(false);
        onToggle && onToggle(false);
      } else {
        await followUser(viewerId, targetId);
        setIsFollowing(true);
        onToggle && onToggle(true);
      }
    } catch (err) {
      console.error('FollowButton toggle error', err);
      alert('Could not update follow status. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (viewerId === targetId) return null;

  return (
    <button
      className={`follow-btn ${isFollowing ? 'followed' : ''}`}
      onClick={toggle}
      disabled={loading}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isFollowing ? (loading ? '...' : 'Following') : (loading ? '...' : 'Follow')}
    </button>
  );
}
