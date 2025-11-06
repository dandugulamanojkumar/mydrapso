import React, { useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { UploadModal } from "./components/UploadModal";
import { VideosFeed } from "./components/VideosFeed";
import { InlineVideoPlayer } from "./components/InlineVideoPlayer";
import { SearchResults } from "./components/SearchResults";
import { PageProfile } from "./pages/PageProfile";
import { PageSettings } from "./pages/PageSettings";
import { PageShorts } from "./pages/PageShorts";
import { PageNotifications } from "./pages/PageNotifications";
import { EmptyPage } from "./pages/EmptyPage";
import { PageSignIn } from "./pages/PageSignIn";
import { SignUpFlow } from "./pages/SignUpFlow";
import { shuffleArray } from "./utils/videoUtils";
import {
  supabase,
  getVideosWithUserData,
  getUserLikes,
  getUserFollows,
  likeVideo,
  unlikeVideo,
  followUser,
  unfollowUser,
  uploadVideo,
  subscribeToVideos
} from "./lib/supabase";
import "./styles.css";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [uploads, setUploads] = useState([]);

  /* ===== AUTH STATE ===== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);

  /* ===== USER SYSTEM ===== */
  const [profile, setProfile] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [likedVideoIds, setLikedVideoIds] = useState([]);

  /* ===== UPLOAD STATE ===== */
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [videoMeta, setVideoMeta] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [locationText, setLocationText] = useState("");
  const fileInputRef = useRef(null);

  /* ===== INLINE VIDEO PLAYER STATE ===== */
  const [showInlinePlayer, setShowInlinePlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  /* ===== SEARCH STATE ===== */
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], videos: [] });
  const [searchQuery, setSearchQuery] = useState("");

  /* ===== THEME PERSISTENCE ===== */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ===== LOGOUT FUNCTION ===== */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setProfile(null);
    setUploads([]);
    setLikedVideoIds([]);
    setFollowingList([]);
  };

  /* ===== INLINE VIDEO PLAYER FUNCTIONS ===== */
  const openInlinePlayer = (videoId) => {
    const video = uploads.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      setShowInlinePlayer(true);
    }
  };

  const closeInlinePlayer = () => {
    setShowInlinePlayer(false);
    setSelectedVideo(null);
  };

  /* ===== SEARCH FUNCTION ===== */
  const handleSearch = (query) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    const matchedVideos = uploads.filter(video =>
      video.title.toLowerCase().includes(lowerQuery) ||
      video.desc.toLowerCase().includes(lowerQuery)
    );

    const allUsers = [profile];
    const matchedUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.id.toLowerCase().includes(lowerQuery)
    );

    setSearchResults({ users: matchedUsers, videos: matchedVideos });
    setShowSearchResults(true);
  };

  const handleUserClick = (userId) => {
    if (userId === profile?.id) {
      setActivePage('profile');
    }
  };

  const handleVideoClick = (videoId) => {
    openInlinePlayer(videoId);
  };

  const toggleLike = async (videoId) => {
    if (!profile) return;

    try {
      const isLiked = likedVideoIds.includes(videoId);

      if (isLiked) {
        await unlikeVideo(videoId, profile.id);
        setLikedVideoIds(prev => prev.filter(id => id !== videoId));
        setUploads(prev => prev.map(v =>
          v.id === videoId ? { ...v, likes: v.likes - 1 } : v
        ));
      } else {
        await likeVideo(videoId, profile.id);
        setLikedVideoIds(prev => [...prev, videoId]);
        setUploads(prev => prev.map(v =>
          v.id === videoId ? { ...v, likes: v.likes + 1 } : v
        ));
      }
    } catch (error) {
      console.error("Toggle like error:", error);
    }
  };

  const toggleFollow = async (userId) => {
    if (!profile || userId === profile.id) return;

    try {
      const isFollowing = followingList.includes(userId);

      if (isFollowing) {
        await unfollowUser(profile.id, userId);
        setFollowingList(prev => prev.filter(id => id !== userId));
      } else {
        await followUser(profile.id, userId);
        setFollowingList(prev => [...prev, userId]);
      }
    } catch (error) {
      console.error("Toggle follow error:", error);
    }
  };

  /* ===== PAGES ===== */
  const pages = useMemo(
    () => ({
      home: (
        <VideosFeed
          uploads={shuffleArray(uploads)}
          currentUser={profile}
          likedVideoIds={likedVideoIds}
          followingList={followingList}
          onLike={toggleLike}
          onFollow={toggleFollow}
          onUsernameClick={handleUserClick}
          onVideoClick={openInlinePlayer}
        />
      ),
      shorts: <PageShorts uploads={uploads} currentUser={profile} likedVideoIds={likedVideoIds} followingList={followingList} onLike={toggleLike} onFollow={toggleFollow} onUsernameClick={handleUserClick} />,
      liked: (
        <VideosFeed
          uploads={uploads.filter((v) => likedVideoIds.includes(v.id))}
          currentUser={profile}
          likedVideoIds={likedVideoIds}
          followingList={followingList}
          onLike={toggleLike}
          onFollow={toggleFollow}
          onUsernameClick={handleUserClick}
          onVideoClick={openInlinePlayer}
        />
      ),
      profile: (
        <PageProfile
          profile={profile}
          setProfile={setProfile}
          uploads={uploads}
          setUploads={setUploads}
          followingList={followingList}
          likedVideoIds={likedVideoIds}
          onFollow={toggleFollow}
        />
      ),
      settings: <PageSettings onLogout={handleLogout} />,
      notifications: <PageNotifications currentUser={profile} />,
      videos: (
        <VideosFeed
          uploads={uploads.filter((v) => v.userId === profile?.id)}
          currentUser={profile}
          likedVideoIds={likedVideoIds}
          followingList={followingList}
          onLike={toggleLike}
          onFollow={toggleFollow}
          allowDelete={true}
          setUploads={setUploads}
          onUsernameClick={handleUserClick}
          onVideoClick={openInlinePlayer}
        />
      ),
    }),
    [uploads, likedVideoIds, followingList, profile]
  );

  /* ===== FILE PICKER ===== */
  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = tempUrl;
    v.onloadedmetadata = () => {
      const duration = v.duration;
      if (!isFinite(duration) || duration < 5 || duration > 180) {
        alert("Video must be 5s–3min long.");
        URL.revokeObjectURL(tempUrl);
        setVideoMeta(null);
        return;
      }
      setVideoMeta({ file, url: tempUrl, duration });
    };
    v.onerror = () => {
      alert("Unable to read this video.");
      URL.revokeObjectURL(tempUrl);
      setVideoMeta(null);
    };
  };

  /* ===== AUTH HANDLERS ===== */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setProfile({
            id: user.id,
            name: user.username || user.full_name,
            avatar: user.avatar || "https://i.pravatar.cc/50?img=3",
            bio: user.bio || "",
            followerCount: user.follower_count || 0,
            followingCount: user.following_count || 0,
          });
          await loadInitialData(user.id);
        }
      }
    };

    checkAuth();
  }, []);

  const loadInitialData = async (userId) => {
    setVideosLoading(true);
    try {
      const [videosData, likesData, followsData] = await Promise.all([
        getVideosWithUserData(),
        getUserLikes(userId),
        getUserFollows(userId)
      ]);

      const formattedVideos = videosData.map(video => ({
        id: video.id,
        url: video.video_url,
        name: video.title,
        duration: video.duration,
        title: video.title,
        desc: video.description,
        hasAffiliate: video.has_affiliate,
        affiliateLink: video.affiliate_link,
        hasLocation: video.has_location,
        location: video.location,
        userId: video.user_id,
        likes: video.likes,
        views: video.views,
        user: video.users,
      }));

      setUploads(formattedVideos);
      setLikedVideoIds(likesData);
      setFollowingList(followsData);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !profile) return;

    const unsubscribe = subscribeToVideos(async (payload) => {
      if (payload.eventType === 'INSERT') {
        const newVideo = payload.new;

        const { data: userData } = await supabase
          .from('users')
          .select('id, username, avatar, full_name')
          .eq('id', newVideo.user_id)
          .single();

        const formattedVideo = {
          id: newVideo.id,
          url: newVideo.video_url,
          name: newVideo.title,
          duration: newVideo.duration,
          title: newVideo.title,
          desc: newVideo.description,
          hasAffiliate: newVideo.has_affiliate,
          affiliateLink: newVideo.affiliate_link,
          hasLocation: newVideo.has_location,
          location: newVideo.location,
          userId: newVideo.user_id,
          likes: newVideo.likes || 0,
          views: newVideo.views || 0,
          user: userData,
        };

        setUploads(prev => {
          if (prev.some(v => v.id === formattedVideo.id)) {
            return prev;
          }
          return [formattedVideo, ...prev];
        });
      } else if (payload.eventType === 'DELETE') {
        setUploads(prev => prev.filter(v => v.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        setUploads(prev => prev.map(v => {
          if (v.id === payload.new.id) {
            return {
              ...v,
              likes: payload.new.likes,
              views: payload.new.views,
            };
          }
          return v;
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLoggedIn, profile]);

  const handleSignInSuccess = async (userData) => {
    setIsLoggedIn(true);
    setProfile({
      id: userData.id,
      name: userData.username || userData.full_name,
      avatar: userData.avatar || "https://i.pravatar.cc/50?img=3",
      bio: userData.bio || "",
      followerCount: userData.follower_count || 0,
      followingCount: userData.following_count || 0,
    });
    await loadInitialData(userData.id);
  };

  const handleSignUpComplete = async (userData) => {
    setShowSignUp(false);
    setIsLoggedIn(true);
    setProfile({
      id: userData.id,
      name: userData.username || userData.full_name,
      avatar: userData.avatar || "https://i.pravatar.cc/50?img=3",
      bio: userData.bio || "",
      followerCount: userData.follower_count || 0,
      followingCount: userData.following_count || 0,
    });
    await loadInitialData(userData.id);
  };

  /* ===== UPLOAD ===== */
  const canUpload = title.trim() && desc.trim();
  const submitUpload = async (e) => {
    e.preventDefault();
    if (!videoMeta) {
      alert("Please select a valid video first.");
      return;
    }

    const uploadButton = e.target.querySelector('button[type="submit"]');
    if (uploadButton) {
      uploadButton.disabled = true;
      uploadButton.textContent = 'Uploading...';
    }

    try {
      const metadata = {
        title: title.trim(),
        description: desc.trim(),
        duration: Math.floor(videoMeta.duration),
        hasAffiliate: !!showAffiliate,
        affiliateLink: showAffiliate ? affiliateLink.trim() : null,
        hasLocation: !!showLocation,
        location: showLocation ? locationText.trim() : null,
      };

      const video = await uploadVideo(profile.id, videoMeta.file, metadata);

      const record = {
        id: video.id,
        url: video.video_url,
        name: videoMeta.file.name,
        duration: video.duration,
        title: video.title,
        desc: video.description,
        hasAffiliate: video.has_affiliate,
        affiliateLink: video.affiliate_link,
        hasLocation: video.has_location,
        location: video.location,
        userId: video.user_id,
        user: video.user,
        likes: video.likes || 0,
        views: video.views || 0,
      };

      setUploads((prev) => [record, ...prev]);
      setShowModal(false);
      setStep(1);
      setVideoMeta(null);
      setTitle("");
      setDesc("");
      setShowAffiliate(false);
      setAffiliateLink("");
      setShowLocation(false);
      setLocationText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      URL.revokeObjectURL(videoMeta.url);
      setActivePage("videos");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload video. Please try again.");
      if (uploadButton) {
        uploadButton.disabled = false;
        uploadButton.textContent = 'Upload';
      }
    }
  };

  if (!isLoggedIn || !profile) {
    if (showSignUp) {
      return (
        <SignUpFlow
          onSignUpComplete={handleSignInSuccess}
          onBackToSignIn={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <PageSignIn
        onSignInSuccess={handleSignInSuccess}
        onSignUpClick={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <div className="app-wrapper">
      <Topbar
        theme={theme}
        setTheme={setTheme}
        openModal={() => {
          setShowModal(true);
          setStep(1);
        }}
        onSearch={handleSearch}
      />
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main className={`content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} id="main-content">
        <div className="loaded-page">
          {videosLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading videos...</p>
            </div>
          ) : (
            pages[activePage] || <EmptyPage />
          )}
        </div>
      </main>
      {showInlinePlayer && selectedVideo && (
        <InlineVideoPlayer
          initialVideo={selectedVideo}
          allVideos={uploads}
          onClose={closeInlinePlayer}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
          onUsernameClick={handleUserClick}
        />
      )}
      {showSearchResults && (
        <SearchResults
          searchQuery={searchQuery}
          searchResults={searchResults}
          onUserClick={handleUserClick}
          onVideoClick={handleVideoClick}
          onClose={() => setShowSearchResults(false)}
          currentUser={profile}
          follows={follows}
          toggleFollow={toggleFollow}
        />
      )}
      {showModal && (
        <UploadModal
          step={step}
          setStep={setStep}
          setShowModal={setShowModal}
          videoMeta={videoMeta}
          onPickFile={onPickFile}
          fileInputRef={fileInputRef}
          title={title}
          setTitle={setTitle}
          desc={desc}
          setDesc={setDesc}
          showAffiliate={showAffiliate}
          setShowAffiliate={setShowAffiliate}
          affiliateLink={affiliateLink}
          setAffiliateLink={setAffiliateLink}
          showLocation={showLocation}
          setShowLocation={setShowLocation}
          locationText={locationText}
          setLocationText={setLocationText}
          canUpload={canUpload}
          submitUpload={submitUpload}
        />
      )}
    </div>
  );
}
