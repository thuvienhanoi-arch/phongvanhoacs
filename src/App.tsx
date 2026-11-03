import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { VideoItem, ContestConfig, VoterProfile, SortMode, getContestStatus } from './types/contest';
import {
  loadContestConfig,
  saveContestConfig,
  loadVideos,
  saveVideos,
  loadCurrentVoter,
  saveCurrentVoter,
  castVote,
  subscribeToRealtimeUpdates
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FinalResultsBanner } from './components/FinalResultsBanner';
import { LeaderboardPodium } from './components/LeaderboardPodium';
import { VideoCard } from './components/VideoCard';
import { AuthModal } from './components/AuthModal';
import { AddVideoModal } from './components/AddVideoModal';
import { ShareExportModal } from './components/ShareExportModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { RulesModal } from './components/RulesModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { Search, Flame, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ContestConfig>(loadContestConfig);
  const [videos, setVideos] = useState<VideoItem[]>(loadVideos);
  const [currentVoter, setCurrentVoter] = useState<VoterProfile | null>(loadCurrentVoter);

  // Sorting & Filtering
  const [sortMode, setSortMode] = useState<SortMode>('votes'); // Default: most votes first
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoItem | null>(null);
  const [pendingVoteVideo, setPendingVoteVideo] = useState<VideoItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync dark mode class on HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Subscribe to real-time updates across tabs / clients
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeUpdates(() => {
      setVideos(loadVideos());
      setConfig(loadContestConfig());
    });
    return () => unsubscribe();
  }, []);

  // Compute contest status
  const contestStatus = useMemo(() => {
    return getContestStatus(config.startDate, config.endDate);
  }, [config.startDate, config.endDate]);

  const totalVotes = useMemo(() => {
    return videos.reduce((acc, v) => acc + v.votes, 0);
  }, [videos]);

  // Sorted and filtered videos
  const displayedVideos = useMemo(() => {
    let result = [...videos];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.code.toLowerCase().includes(q) ||
          v.author.toLowerCase().includes(q) ||
          (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortMode === 'votes') {
        // Most votes first (Live Leaderboard)
        return b.votes - a.votes;
      }
      if (sortMode === 'code') {
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      }
      if (sortMode === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (sortMode === 'author') {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });

    return result;
  }, [videos, searchQuery, sortMode]);

  const hasUserVotedFor = (videoId: string): boolean => {
    if (!currentVoter || !currentVoter.votedVideoIds) return false;
    return currentVoter.votedVideoIds.includes(videoId);
  };

  // Trigger vote action
  const handleVote = (video: VideoItem) => {
    // Check timing period first
    if (contestStatus === 'upcoming') {
      const startFmt = new Date(config.startDate).toLocaleString('vi-VN');
      showToast(`Chưa mở bình chọn! Cổng bình chọn sẽ bắt đầu vào: ${startFmt}`);
      return;
    }

    if (contestStatus === 'ended') {
      showToast('Thời gian bình chọn đã kết thúc! Kết quả đã được chốt và công bố chính thức.');
      return;
    }

    // Check if voter is logged in and followed
    if (!currentVoter) {
      setPendingVoteVideo(video);
      setIsAuthOpen(true);
      return;
    }

    if (config.requireFanpageFollow && !currentVoter.hasFollowedFanpage) {
      setPendingVoteVideo(video);
      setIsAuthOpen(true);
      return;
    }

    const res = castVote(video.id, currentVoter, config);
    if (res.success) {
      if (res.updatedVideos) setVideos(res.updatedVideos);
      if (res.updatedVoter) setCurrentVoter(res.updatedVoter);
      showToast(res.message);

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      showToast(res.message);
    }
  };

  const handleLogout = () => {
    saveCurrentVoter(null);
    setCurrentVoter(null);
    showToast('Đã đăng xuất tài khoản bình chọn.');
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-300 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentVoter={currentVoter}
        onOpenAuth={() => {
          setPendingVoteVideo(null);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Hero Section with Start/End Countdown & Key Stats */}
        <HeroSection
          config={config}
          totalVideos={videos.length}
          totalVotes={totalVotes}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenShareModal={() => setIsShareOpen(true)}
        />

        {/* Finalized Results Banner (Prominently displayed after contest ends) */}
        {contestStatus === 'ended' && (
          <FinalResultsBanner
            config={config}
            videos={videos}
            onOpenShareModal={() => setIsShareOpen(true)}
            onSelectVideo={(v) => setActivePlayerVideo(v)}
            onToast={showToast}
          />
        )}

        {/* Live Top 3 Podium (Live Real-Time Leaderboard or Finalists) */}
        <LeaderboardPodium
          videos={videos}
          contestStatus={contestStatus}
          onSelectVideo={(v) => setActivePlayerVideo(v)}
          onVote={handleVote}
          hasUserVotedFor={hasUserVotedFor}
        />

        {/* Video Contest Section Header & Filter Bar */}
        <section id="videos" className="mb-8 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>
                  {contestStatus === 'ended'
                    ? 'Bảng Kết Quả Xếp Hạng Toàn Bộ Tác Phẩm'
                    : 'Danh Sách Tác Phẩm Bình Chọn'}
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{displayedVideos.length} video</span>
                <span aria-hidden="true">·</span>
                <span>
                  {contestStatus === 'ended'
                    ? 'Kết quả chung cuộc đã được chốt'
                    : 'Tự động sắp xếp video nhiều vote lên đầu theo thời gian thực'}
                </span>
              </div>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm tác phẩm, SBD..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 pl-2">Sắp xếp:</span>
                <button
                  type="button"
                  onClick={() => setSortMode('votes')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sortMode === 'votes'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Nhiều Vote Nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('code')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sortMode === 'code'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Theo SBD
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('newest')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sortMode === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Mới Nhất
                </button>
              </div>

              {/* Quick Add Video CTA */}
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Video / Tải Danh Sách</span>
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          {displayedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVideos.map((video) => {
                const globalRank =
                  [...videos].sort((a, b) => b.votes - a.votes).findIndex((v) => v.id === video.id) + 1;
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    rank={globalRank}
                    totalVotes={totalVotes}
                    hasUserVoted={hasUserVotedFor(video.id)}
                    contestStatus={contestStatus}
                    onVote={handleVote}
                    onOpenPlayer={(v) => setActivePlayerVideo(v)}
                    onToast={showToast}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                Không tìm thấy video phù hợp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Thử tìm với từ khóa khác hoặc dán link video mới vào cuộc thi.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </section>

        {/* Quick Social Share Bottom Strip */}
        <section className="rounded-2xl p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="text-lg font-bold">
              {contestStatus === 'ended'
                ? 'Chia sẻ kết quả chung cuộc lên Facebook'
                : 'Bạn là thí sinh hoặc người hâm mộ?'}
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              {contestStatus === 'ended'
                ? 'Đăng tải kết quả chính thức và bảng vinh danh về trang Facebook cá nhân hoặc Fanpage!'
                : 'Chia sẻ kết quả hoặc sao chép link bình chọn để kêu gọi bạn bè ủng hộ video yêu thích!'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            Xuất & Chia Sẻ Lên Facebook
          </button>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2026 Cuộc thi trực tuyến “Văn hóa từ mỗi hành động” · Xây dựng Người Hà Nội thanh lịch, văn minh
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Thể Lệ Bình Chọn
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Báo Cáo Kết Quả
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cài Đặt Cuộc Thi
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingVoteVideo(null);
        }}
        config={config}
        currentVoter={currentVoter}
        onSaveVoter={(voter) => {
          saveCurrentVoter(voter);
          setCurrentVoter(voter);
          if (pendingVoteVideo) {
            handleVote(pendingVoteVideo);
            setPendingVoteVideo(null);
          }
        }}
        onToast={showToast}
        pendingVoteVideoTitle={pendingVoteVideo?.title}
      />

      <AddVideoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => {
          setVideos(loadVideos());
        }}
        onToast={showToast}
      />

      <ShareExportModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        config={config}
        videos={videos}
        onToast={showToast}
      />

      <VideoPlayerModal
        video={activePlayerVideo}
        contestStatus={contestStatus}
        onClose={() => setActivePlayerVideo(null)}
        onVote={handleVote}
        hasUserVoted={activePlayerVideo ? hasUserVotedFor(activePlayerVideo.id) : false}
        onToast={showToast}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        config={config}
      />

      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          saveContestConfig(newConfig);
          setConfig(newConfig);
        }}
        videos={videos}
        onUpdateVideos={(vids) => setVideos(vids)}
        onToast={showToast}
      />
    </div>
  );
}
