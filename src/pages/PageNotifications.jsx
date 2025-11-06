import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../lib/supabase';

export function PageNotifications({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(currentUser.id);
      setNotifications(data);
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const getNotificationText = (notification) => {
    const actorName = notification.actor?.username || 'Someone';

    switch (notification.type) {
      case 'like':
        return `${actorName} liked your video`;
      case 'comment':
        return `${actorName} commented on your video`;
      case 'follow':
        return `${actorName} started following you`;
      default:
        return 'New notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <p>Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>🔔 Notifications</h2>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet.</p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            When someone likes, comments, or follows you, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-user">
                  <img
                    src={notification.actor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={notification.actor?.username}
                    className="notification-avatar"
                  />
                  <span className="notification-text">
                    {getNotificationText(notification)}
                  </span>
                </div>
                {notification.video && (
                  <div className="notification-video-preview">
                    <img
                      src={notification.video.thumbnail_url || '/placeholder-video.png'}
                      alt={notification.video.title}
                      className="notification-thumbnail"
                    />
                  </div>
                )}
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleDateString()} at{' '}
                  {new Date(notification.created_at).toLocaleTimeString()}
                </span>
              </div>
              {!notification.is_read && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
