import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Send } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function CommentsPanel({ videoId, currentUser, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            username,
            avatar,
            full_name
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(commentsData || []);
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          video_id: videoId,
          user_id: currentUser.id,
          comment_text: commentText.trim(),
        }])
        .select(`
          *,
          users:user_id (
            username,
            avatar,
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      setCommentText('');
    } catch (error) {
      console.error('Submit comment error:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffMs = now - commentDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div className="comments-overlay" onClick={onClose}>
      <div className="comments-panel" onClick={(e) => e.stopPropagation()}>
        <div className="comments-header">
          <h3 className="comments-title">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
          <button className="comments-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="comments-list">
          {loading ? (
            <div className="comments-loading">
              <div className="spinner"></div>
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="comments-empty">
              <p>No comments yet</p>
              <p className="comments-empty-subtitle">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={comment.users.avatar || 'https://i.pravatar.cc/40?img=1'}
                  alt={comment.users.username}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-username">
                      {comment.users.username || comment.users.full_name}
                    </span>
                    <span className="comment-time">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="comments-input-section" onSubmit={handleSubmit}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="comment-input-avatar"
          />
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={!commentText.trim() || submitting}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
