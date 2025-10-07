import React, { useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { UploadModal } from "./components/UploadModal";
import { VideosFeed } from "./components/VideosFeed";
import { ShortsPlayer } from "./components/ShortsPlayer";
import { PageProfile } from "./pages/PageProfile";
import { PageSettings } from "./pages/PageSettings";
import { PageShorts } from "./pages/PageShorts";
import { PageNotifications } from "./pages/PageNotifications";
import { EmptyPage } from "./pages/EmptyPage";
import "./styles.css";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [uploads, setUploads] = useState([]);

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

  /* ===== SHORTS MODE STATE ===== */
  const [shortsMode, setShortsMode] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [shortsVideos, setShortsVideos] = useState([]);

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

  /* ===== SHORTS MODE FUNCTIONS ===== */
  const openShortsMode = (videoId, allVideos) => {
    const videoIndex = allVideos.findIndex(v => v.id === videoId);
    setShortsVideos(allVideos);
    setCurrentVideoIndex(videoIndex);
    setShortsMode(true);
  };

  const closeShortsMode = () => {
    setShortsMode(false);
    setShortsVideos([]);
    setCurrentVideoIndex(0);
  };

  const navigateShorts = (direction) => {
    if (direction === 'next' && currentVideoIndex < shortsVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
  };

  /* ===== PAGES ===== */
  const pages = useMemo(
    () => ({
      home: (
        <VideosFeed
          uploads={uploads}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
          onVideoClick={openShortsMode}
        />
      ),
      shorts: <PageShorts uploads={uploads} currentUser={profile} likes={likes} setLikes={setLikes} follows={follows} setFollows={setFollows} />,
      liked: (
        <VideosFeed
          uploads={uploads.filter((v) => likes.includes(v.id))}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
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

  return (
    <div className="app-wrapper">
      <Topbar
        theme={theme}
        setTheme={setTheme}
        openModal={() => {
          setShowModal(true);
          setStep(1);
        }}
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
      {shortsMode && (
        <ShortsPlayer
          videos={shortsVideos}
          currentIndex={currentVideoIndex}
          currentUser={profile}
          likes={likes}
          setLikes={setLikes}
          follows={follows}
          setFollows={setFollows}
          onClose={closeShortsMode}
          onNavigate={navigateShorts}
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
