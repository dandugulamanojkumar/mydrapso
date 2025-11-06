import React, { useState } from 'react';
import { updateUserProfile } from '../lib/supabase';

export function PageProfile({
  uploads = [],
  profile,
  setProfile,
  setUploads,
  followingList = [],
  likedVideoIds = [],
  onFollow
}) {
  if (!profile) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempBio, setTempBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        full_name: tempName,
        bio: tempBio
      };

      const updatedUser = await updateUserProfile(profile.id, updates);

      setProfile({
        ...profile,
        name: tempName,
        bio: tempBio
      });

      localStorage.setItem("userData", JSON.stringify({
        ...JSON.parse(localStorage.getItem("userData") || "{}"),
        full_name: tempName,
        bio: tempBio
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempName(profile.name);
    setTempBio(profile.bio || '');
    setIsEditing(false);
  };

  const myVideos = uploads.filter((vid) => vid.userId === profile.id);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-pic-wrapper">
          <img src={profile.avatar} alt="Profile" className="profile-pic" />
        </div>
        <h2 className="profile-name">{profile.name}</h2>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <button className="edit-icon" onClick={() => setIsEditing(true)} title="Edit Profile">✏</button>
      </div>

      <div className="profile-stats">
        <div><strong>{profile.followerCount || 0}</strong><span>Followers</span></div>
        <div><strong>{profile.followingCount || 0}</strong><span>Following</span></div>
        <div><strong>{myVideos.length}</strong><span>Videos</span></div>
      </div>

      <div className="profile-videos">
        <h3>My Videos</h3>
        <div className="video-grid">
          {myVideos.map((vid) => (
            <div key={vid.id} className="video-card-grid">
              <video src={vid.url} controls className="grid-video" />
              <div className="grid-video-info">
                <p className="grid-video-title">{vid.title}</p>
                <div className="grid-video-stats">
                  <span>❤ {vid.likes || 0}</span>
                  <span>👁 {vid.views || 0}</span>
                </div>
              </div>
            </div>
          ))}
          {myVideos.length === 0 && (
            <div className="no-videos-message">
              <p>No videos uploaded yet.</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>Upload your first video to get started!</p>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="edit-modal">
          <div className="edit-content">
            <h3>Edit Profile</h3>
            <div className="edit-field">
              <label>Display Name:</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="edit-field">
              <label>Bio:</label>
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={150}
              />
              <small>{tempBio.length}/150 characters</small>
            </div>
            <div className="edit-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
