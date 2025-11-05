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
import "./styles.css";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [uploads, setUploads] = useState([]);

  /* ===== AUTH STATE ===== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  /* ===== USER SYSTEM ===== */
  const [profile, setProfile] = useState({
    id: "user123",
    name: "Manoj",
    avatar: "https://i.pravatar.cc/50?img=3",
  });
  const [follows, setFollows] = useState({});
  const [likes, setLikes] = useState([]);

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
  const handleLogout = () => {
    alert("Logging out...");
    // Add actual logout logic here if needed
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
    if (userId === profile.id) {
      setActivePage('profile');
    }
  };

  const handleVideoClick = (videoId) => {
    openInlinePlayer(videoId);
  };

  const toggleFollow = (uid) => {
    setFollows((prev) => {
      const copy = { ...prev };
      if (!copy[uid]) copy[uid] = [];
      if (copy[uid].includes(profile.id)) {
        copy[uid] = copy[uid].filter((id) => id !== profile.id);
      } else {
        copy[uid].push(profile.id);
      }
      return copy;
    });
  };

  /* ===== PAGES ===== */
  const pages = useMemo(
    () => ({
      home: (
        <VideosFeed
          uploads={shuffleArray(uploads)}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
          onUsernameClick={handleUserClick}
          onVideoClick={openInlinePlayer}
        />
      ),
      shorts: <PageShorts uploads={uploads} currentUser={profile} likes={likes} setLikes={setLikes} follows={follows} setFollows={setFollows} onUsernameClick={handleUserClick} />,
      liked: (
        <VideosFeed
          uploads={uploads.filter((v) => likes.includes(v.id))}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
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
          follows={follows}
          likes={likes}
        />
      ),
      settings: <PageSettings onLogout={handleLogout} />,
      notifications: <PageNotifications />,
      videos: (
        <VideosFeed
          uploads={uploads.filter((v) => v.userId === profile.id)}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
          allowDelete={true}
          setUploads={setUploads}
          onUsernameClick={handleUserClick}
          onVideoClick={openInlinePlayer}
        />
      ),
    }),
    [uploads, likes, follows, profile]
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
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setProfile({
        id: user.id,
        name: user.full_name,
        avatar: user.avatar || "https://i.pravatar.cc/50?img=3",
      });
    }
  }, []);

  const handleSignInSuccess = (userData) => {
    setIsLoggedIn(true);
    setProfile({
      id: userData.id,
      name: userData.full_name,
      avatar: userData.avatar || "https://i.pravatar.cc/50?img=3",
    });
  };

  const handleSignUpComplete = (userData) => {
    setShowSignUp(false);
    setIsLoggedIn(true);
    setProfile({
      id: userData.id,
      name: userData.full_name,
      avatar: userData.avatar || "https://i.pravatar.cc/50?img=3",
    });
  };

  /* ===== UPLOAD ===== */
  const canUpload = title.trim() && desc.trim();
  const submitUpload = (e) => {
    e.preventDefault();
    if (!videoMeta) {
      alert("Please select a valid video first.");
      return;
    }
    const record = {
      id: Date.now().toString(),
      url: videoMeta.url,
      name: videoMeta.file.name,
      duration: videoMeta.duration,
      title: title.trim(),
      desc: desc.trim(),
      hasAffiliate: !!showAffiliate,
      affiliateLink: affiliateLink.trim(),
      hasLocation: !!showLocation,
      location: locationText.trim(),
      userId: profile.id,
      likes: 0,
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
    setActivePage("videos");
  };

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUpFlow
          onSignUpComplete={handleSignUpComplete}
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
        <div className="loaded-page">{pages[activePage] || <EmptyPage />}</div>
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
