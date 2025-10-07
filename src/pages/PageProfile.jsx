import React, { useState } from 'react';

export function PageProfile({
  uploads = [],
  profile,
  setProfile,
  setUploads,
  follows,
  likes
}) {
  const followers = follows[profile.id]?.length || 0;
  const following = Object.values(follows).filter((arr) => arr.includes(profile.id)).length;

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempPic, setTempPic] = useState(profile.avatar);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setTempPic(URL.createObjectURL(file));
  };

  const handleSave = () => {
    setProfile({ ...profile, name: tempName, avatar: tempPic });
    setUploads((prev) => prev.map((vid) =>
      vid.userId === profile.id ? { ...vid, updatedName: tempName, updatedAvatar: tempPic } : vid
    ));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(profile.name);
    setTempPic(profile.avatar);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-pic-wrapper">
          <img src={profile.avatar} alt="Profile" className="profile-pic" />
        </div>
        <h2 className="profile-name">{profile.name}</h2>
        <button className="edit-icon" onClick={() => setIsEditing(true)} title="Edit Profile">✏</button>
      </div>

      <div className="profile-stats">
        <div><strong>{followers}</strong><span>Followers</span></div>
        <div><strong>{following}</strong><span>Following</span></div>
      </div>

      <div className="profile-videos">
        <h3>My Videos</h3>
        <div className="video-grid">
          {uploads.filter((vid) => vid.userId === profile.id).map((vid) => (
            <div key={vid.id} className="video-card">
              <video src={vid.url} controls />
              <p>❤ {likes.filter((id) => id === vid.id).length} Likes</p>
              <div className="video-meta">
                <img src={vid.updatedAvatar || profile.avatar} alt="avatar" className="video-user-pic" />
                <span>@{vid.updatedName || profile.name}</span>
              </div>
            </div>
          ))}
          {uploads.filter((vid) => vid.userId === profile.id).length === 0 && <p>No videos uploaded yet.</p>}
        </div>
      </div>

      {isEditing && (
        <div className="edit-modal">
          <div className="edit-content">
            <h3>Edit Profile</h3>
            <div className="edit-field">
              <label>Profile Picture:</label>
              <input type="file" accept="image/*" onChange={handlePicChange} />
              <img src={tempPic} alt="Preview" className="preview-pic" />
            </div>
            <div className="edit-field">
              <label>Name:</label>
              <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} />
            </div>
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
