import React from 'react';
import { VoterProfile } from '../types/contest';
import { Trophy, Moon, Sun, Shield, LogOut, CheckCircle2, User } from 'lucide-react';

interface NavbarProps {
  currentVoter: VoterProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenShareModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentVoter,
  onOpenAuth,
  onLogout,
  onOpenAddModal,
  onOpenRules,
  onOpenSettings,
  onOpenShareModal,
  isDarkMode,
  onToggleDarkMode,
  activeSection,
  setActiveSection
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a 
          href="#top" 
          onClick={() => setActiveSection('all')}
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <span>VĂN HÓA TỪ MỖI HÀNH ĐỘNG</span>
        </a>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#videos"
            onClick={() => setActiveSection('all')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
              activeSection === 'all' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Danh sách Video
          </a>
          <a
            href="#leaderboard"
            onClick={() => setActiveSection('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
              activeSection === 'leaderboard' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Bảng Xếp Hạng
          </a>
          <button
            onClick={onOpenAddModal}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            + Thêm Video
          </button>
          <button
            onClick={onOpenShareModal}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Xuất & Chia sẻ
          </button>
          <button
            onClick={onOpenRules}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Thể lệ
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Đổi chế độ sáng tối"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Quản lý cuộc thi"
            aria-label="Quản lý cuộc thi"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* User Facebook Account Status or Login Button */}
          {currentVoter ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <img
                src={currentVoter.avatarUrl || '/src/assets/images/creator_avatar_female_1793708279614.jpg'}
                alt={currentVoter.name}
                className="w-6 h-6 rounded-full object-cover border border-blue-500"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block leading-tight max-w-[120px] truncate">
                  {currentVoter.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 inline" /> Đã kết nối
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="ml-1 text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập Facebook</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
