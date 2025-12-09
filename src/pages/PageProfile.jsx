import React, { useEffect, useState } from "react";
import {
  updateUserProfile,
  uploadProfilePicture,
  getUserProfile
} from "../lib/supabase";
import { FollowButton } from "../components/FollowButton";

export function PageProfile({
  uploads = [],
  profile,           // profile being viewed (current user or another)
  currentUser,       // logged-in user
  setProfile,
  setUploads,
  followingList = [],
  likedVideoIds = [],
  onFollow,
  onUsernameClick,
  onVideoOpen,
  onBack              // optional back handler for other users
}) {
  // local copy for viewing
  const [viewProfile, setViewProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile?.name || "");
  const [tempBio, setTempBio] = useState(profile?.bio || "");
  const [tempAvatar, setTempAvatar] = useState(profile?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setViewProfile(profile);
    setTempName(profile?.name || "");
    setTempBio(profile?.bio || "");
    setTempAvatar(profile?.avatar || "");
  }, [profile]);

  // If parent passes a minimal profile for other users, try to fetch full
  useEffect(() => {
    let mounted = true;
    const fetchFull = async () => {
      if (!viewProfile || !viewProfile.id) return;
      // if it already looks complete (has followerCount field) skip
      if (viewProfile.followerCount !== undefined) return;
      try {
        const full = await getUserProfile(viewProfile.id);
        if (full && mounted) {
          const normalized = {
            id: full.id,
            name: full.username || full.full_name || full.name,
            avatar: full.avatar,
            bio: full.bio,
            followerCount: full.follower_count || viewProfile.followerCount || 0,
            followingCount: full.following_count || viewProfile.followingCount || 0,
            isCurrentUser: viewProfile.isCurrentUser || false
          };
          setViewProfile(normalized);
        }
      } catch (err) {
        console.error("PageProfile: failed to fetch full profile", err);
      }
    };
    fetchFull();
    return () => {
      mounted = false;
    };
  }, [viewProfile?.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setTempAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!viewProfile || !viewProfile.isCurrentUser) return;
    setSaving(true);
    try {
      let newAvatarUrl = viewProfile.avatar;

      if (avatarFile) {
        setUploading(true);
        try {
          newAvatarUrl = await uploadProfilePicture(viewProfile.id, avatarFile);
        } catch (uploadError) {
          console.error("Upload avatar error:", uploadError);
          alert(
            uploadError.message ||
              "Failed to upload profile picture. Please try again."
          );
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const updates = {
        full_name: tempName,
        bio: tempBio
      };

      if (avatarFile) updates.avatar = newAvatarUrl;

      await updateUserProfile(viewProfile.id, updates);

      const updated = {
        ...viewProfile,
        name: tempName,
        bio: tempBio,
        avatar: newAvatarUrl
      };

      setViewProfile(updated);
      setProfile && setProfile(updated);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("userData") || "{}"),
          full_name: tempName,
          bio: tempBio,
          avatar: newAvatarUrl
        })
      );

      setAvatarFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempName(viewProfile?.name || "");
    setTempBio(viewProfile?.bio || "");
    setTempAvatar(viewProfile?.avatar || "");
    setAvatarFile(null);
    setIsEditing(false);
  };

  // user's videos (ownerId may be viewProfile.id)
  const myVideos = uploads.filter((vid) => vid.userId === viewProfile?.id);

  // update local follower counts after follow toggle
  const handleFollowToggle = (isNowFollowing) => {
    setViewProfile((prev) => {
      if (!prev) return prev;
      const current = prev.followerCount || 0;
      const next = isNowFollowing ? current + 1 : Math.max(current - 1, 0);
      return { ...prev, followerCount: next };
    });
  };

  if (!viewProfile) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  const isOwnProfile = !!viewProfile.isCurrentUser;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {/* Back button only for other users' profiles */}
        {!isOwnProfile && onBack && (
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        )}

        <div className="profile-pic-wrapper">
          <img src={viewProfile.avatar} alt="Profile" className="profile-pic" />
        </div>

        <h2 className="profile-name">{viewProfile.name}</h2>

        {viewProfile.bio && <p className="profile-bio">{viewProfile.bio}</p>}

        {/* Edit for own profile */}
        {isOwnProfile && (
          <button
            className="edit-icon"
            onClick={() => setIsEditing(true)}
            title="Edit Profile"
          >
            ✏
          </button>
        )}

        {/* Follow button for other user's profile */}
        {!isOwnProfile && (
          <FollowButton
            viewerId={currentUser?.id} // logged-in user
            targetId={viewProfile.id}   // profile being viewed
            onToggle={handleFollowToggle}
          />
        )}
      </div>

      <div className="profile-stats">
        <div>
          <strong>{viewProfile.followerCount || 0}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{viewProfile.followingCount || 0}</strong>
          <span>Following</span>
        </div>
        <div>
          <strong>{myVideos.length}</strong>
          <span>Videos</span>
        </div>
      </div>

      <div className="profile-videos">
        <h3>Videos</h3>

        <div className="video-grid">
          {myVideos.map((vid) => (
            <div
              key={vid.id}
              className="video-card-grid"
              onClick={() => onVideoOpen && onVideoOpen(vid.id)}
              style={{ cursor: "pointer" }}
            >
              <video src={vid.url} className="grid-video" />
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
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                Upload your first video!
              </p>
            </div>
          )}
        </div>
      </div>

      {isEditing && isOwnProfile && (
        <div className="edit-modal">
          <div className="edit-content">
            <h3>Edit Profile</h3>

            <div className="edit-field">
              <label>Profile Picture:</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <img src={tempAvatar} alt="Preview" className="preview-pic" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <small>Max size 5MB</small>
            </div>

            <div className="edit-field">
              <label>Display Name:</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>Bio:</label>
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                rows={4}
                maxLength={150}
              />
              <small>{tempBio.length}/150</small>
            </div>

            <div className="edit-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || uploading}
              >
                {uploading ? "Uploading..." : saving ? "Saving..." : "Save"}
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


