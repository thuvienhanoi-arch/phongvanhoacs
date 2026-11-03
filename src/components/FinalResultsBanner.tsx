import React from 'react';
import { ContestConfig, VideoItem } from '../types/contest';
import { Award, Share2, Download, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { exportLeaderboardImage, exportContestCSV } from '../utils/exportImage';

interface FinalResultsBannerProps {
  config: ContestConfig;
  videos: VideoItem[];
  onOpenShareModal: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onToast: (msg: string) => void;
}

export const FinalResultsBanner: React.FC<FinalResultsBannerProps> = ({
  config,
  videos,
  onOpenShareModal,
  onSelectVideo,
  onToast
}) => {
  const sorted = [...videos].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, v) => sum + v.votes, 0) || 1;
  const champion = sorted[0];
  const runnerUp1 = sorted[1];
  const runnerUp2 = sorted[2];

  if (!champion) return null;

  const endDateStr = new Date(config.endDate).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadImage = async () => {
    try {
      await exportLeaderboardImage(config, videos);
      onToast('Đã tải ảnh Bảng Vinh Danh Chung Cuộc thành công!');
    } catch {
      onToast('Lỗi khi tải ảnh');
    }
  };

  const handleDownloadCSV = () => {
    try {
      exportContestCSV(config, videos);
      onToast('Đã tải báo cáo kết quả chi tiết (CSV)!');
    } catch {
      onToast('Lỗi khi tải báo cáo');
    }
  };

  return (
    <div id="final-results" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/40 p-6 sm:p-8 text-white shadow-2xl mb-12">
      {/* Decorative Golden Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Stamp */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>BẢNG VINH DANH CHUNG CUỘC · KẾT QUẢ ĐÃ CHỐT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Công Bố Kết Quả Bình Chọn Chính Thức
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          <div>Thời điểm chốt kết quả: <span className="font-mono text-slate-200">{endDateStr}</span></div>
          <div className="text-amber-400/90 font-medium">Tổng số phiếu hợp lệ: {totalVotes.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {/* Podium Spotlight - Champion and Runner-ups */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-stretch">
        
        {/* Champion / Top 1 Grand Card (Cols 7) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-950/70 border border-amber-500/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 shadow-md">
                🥇 QUÁN QUÂN CHUNG CUỘC
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">{champion.code}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <img
                src={champion.authorAvatar || '/src/assets/images/creator_avatar_female_1793708279614.jpg'}
                alt={champion.author}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shrink-0"
              />
              <div>
                <h3 
                  onClick={() => onSelectVideo(champion)}
                  className="text-lg sm:text-xl font-extrabold text-white line-clamp-2 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {champion.title}
                </h3>
                <div className="text-xs text-slate-300 mt-1">
                  Tác giả / Nhóm: <span className="font-semibold text-white">{champion.author}</span>
                </div>
              </div>
            </div>

            {champion.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {champion.description}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Số phiếu chung cuộc:</div>
              <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                {champion.votes.toLocaleString('vi-VN')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Tỷ lệ bình chọn:</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {((champion.votes / totalVotes) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Runner-ups: Top 2 and Top 3 (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Runner Up 1 */}
          {runnerUp1 && (
            <div className="flex-1 rounded-2xl bg-slate-950/60 border border-slate-700 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  🥈 Á QUÂN 1
                </span>
                <span className="font-mono text-xs text-slate-400">{runnerUp1.code}</span>
              </div>
              <h4 
                onClick={() => onSelectVideo(runnerUp1)}
                className="text-sm font-bold text-white line-clamp-1 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {runnerUp1.title}
              </h4>
              <div className="text-xs text-slate-400 truncate mb-2">
                {runnerUp1.author}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Số phiếu:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {runnerUp1.votes.toLocaleString('vi-VN')} ({((runnerUp1.votes / totalVotes) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {/* Runner Up 2 */}
          {runnerUp2 && (
            <div className="flex-1 rounded-2xl bg-slate-950/60 border border-slate-700 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  🥉 Á QUÂN 2
                </span>
                <span className="font-mono text-xs text-slate-400">{runnerUp2.code}</span>
              </div>
              <h4 
                onClick={() => onSelectVideo(runnerUp2)}
                className="text-sm font-bold text-white line-clamp-1 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {runnerUp2.title}
              </h4>
              <div className="text-xs text-slate-400 truncate mb-2">
                {runnerUp2.author}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Số phiếu:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {runnerUp2.votes.toLocaleString('vi-VN')} ({((runnerUp2.votes / totalVotes) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Strip */}
      <div className="relative z-10 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Kết quả đã được xác thực an toàn, chống gian lận và lưu trữ vĩnh viễn trên hệ thống.
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Báo Cáo Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Tải Ảnh Bảng Vinh Danh (PNG)</span>
          </button>

          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia Sẻ Lên Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};
