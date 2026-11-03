import React, { useState, useEffect } from 'react';
import { ContestConfig, ContestStatus, getContestStatus } from '../types/contest';
import { Share2, Clock, PlusCircle, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeroSectionProps {
  config: ContestConfig;
  totalVideos: number;
  totalVotes: number;
  onOpenAddModal: () => void;
  onOpenShareModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  totalVideos,
  totalVotes,
  onOpenAddModal,
  onOpenShareModal
}) => {
  const [status, setStatus] = useState<ContestStatus>(() =>
    getContestStatus(config.startDate, config.endDate)
  );

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const currentStatus = getContestStatus(config.startDate, config.endDate);
      setStatus(currentStatus);

      const now = Date.now();
      let targetTime = 0;

      if (currentStatus === 'upcoming') {
        targetTime = new Date(config.startDate).getTime();
      } else if (currentStatus === 'active') {
        targetTime = new Date(config.endDate).getTime();
      } else {
        // Ended
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = Math.max(0, targetTime - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config.startDate, config.endDate]);

  const startDateFormatted = new Date(config.startDate).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const endDateFormatted = new Date(config.endDate).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl mb-10">
      {/* Background Graphic / Banner with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/contest_stage_banner_1793708279116.jpg"
          alt="Contest Banner"
          className="w-full h-full object-cover object-center opacity-25 filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl">
          {/* Metadata line without pill box */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-3">
            <span className="text-blue-400">CỔNG BÌNH CHỌN TRỰC TUYẾN</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">FACEBOOK VIDEO AWARDS</span>
            <span aria-hidden="true">·</span>
            {status === 'active' && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ĐANG MỞ BÌNH CHỌN
              </span>
            )}
            {status === 'upcoming' && (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> SẮP DIỄN RA
              </span>
            )}
            {status === 'ended' && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> ĐÃ KẾT THÚC BÌNH CHỌN
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight text-balance">
            {config.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-6 max-w-2xl leading-relaxed">
            {config.subtitle}
          </p>

          {/* Voting Period Display */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-8 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 w-fit">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Thời gian bình chọn:</span>
            </div>
            <div className="font-mono text-white">
              <span>{startDateFormatted}</span>
              <span className="mx-2 text-slate-500">➜</span>
              <span>{endDateFormatted}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {status === 'active' ? (
              <a
                href="#videos"
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                Bình Chọn Ngay
              </a>
            ) : status === 'upcoming' ? (
              <a
                href="#videos"
                className="px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Xem Trước Tác Phẩm
              </a>
            ) : (
              <a
                href="#final-results"
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Xem Bảng Kết Quả Chung Cuộc
              </a>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Thêm Video / Tải Danh Sách</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Chia Sẻ Lên Facebook</span>
            </button>
          </div>
        </div>

        {/* 4-Column KPI / Countdown Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          {/* KPI 1: Total Videos */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Tổng tác phẩm</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {totalVideos.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-slate-400 mt-1">video tham gia</div>
          </div>

          {/* KPI 2: Total Votes */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Lượt bình chọn</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono tabular-nums">
              {totalVotes.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-emerald-400 mt-1">
              {status === 'ended' ? 'Đã chốt chính thức' : 'Thời gian thực'}
            </div>
          </div>

          {/* KPI 3: Dynamic Countdown Timer */}
          <div className="col-span-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {status === 'upcoming'
                    ? 'Thời gian mở cổng bình chọn'
                    : status === 'active'
                    ? 'Thời gian bình chọn còn lại'
                    : 'Thời gian bình chọn đã khép lại'}
                </span>
              </span>

              {status === 'upcoming' && (
                <span className="text-amber-400 font-bold">CHƯA BẮT ĐẦU</span>
              )}
              {status === 'active' && (
                <span className="text-emerald-400 font-bold">ĐANG MỞ</span>
              )}
              {status === 'ended' && (
                <span className="text-rose-400 font-bold">ĐÃ KẾT THÚC</span>
              )}
            </div>

            {status !== 'ended' ? (
              <div className="flex items-center gap-2 sm:gap-4 my-auto">
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Ngày</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Giờ</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Phút</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Giây</span>
                </div>
              </div>
            ) : (
              <div className="my-auto py-1">
                <div className="text-sm font-bold text-slate-200">
                  Cổng bình chọn đã chính thức đóng lại
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Kết quả chung cuộc đã được hoàn thiện và xác lập
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
