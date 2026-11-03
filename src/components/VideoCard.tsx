import React, { useState } from 'react';
import { VideoItem, ContestStatus } from '../types/contest';
import { Heart, ExternalLink, Share2, Play, Maximize2, Clock, Check } from 'lucide-react';
import { getFacebookShareUrl } from '../utils/facebook';

interface VideoCardProps {
  video: VideoItem;
  rank: number;
  totalVotes: number;
  hasUserVoted: boolean;
  contestStatus: ContestStatus;
  onVote: (video: VideoItem) => void;
  onOpenPlayer: (video: VideoItem) => void;
  onToast: (msg: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  rank,
  totalVotes,
  hasUserVoted,
  contestStatus,
  onVote,
  onOpenPlayer,
  onToast
}) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const votePercentage = totalVotes > 0 ? ((video.votes / totalVotes) * 100).toFixed(1) : '0';

  const isVoteDisabled = contestStatus !== 'active' || hasUserVoted;

  const getVoteButtonLabel = () => {
    if (contestStatus === 'upcoming') {
      return 'Chưa Mở Bình Chọn';
    }
    if (contestStatus === 'ended') {
      return 'Bình Chọn Đã Kết Thúc';
    }
    if (hasUserVoted) {
      return 'Đã Bình Chọn';
    }
    return 'Bình Chọn Cho Video Này';
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = getFacebookShareUrl(
      video.fbUrl,
      `🔥 Hãy cùng bình chọn cho tác phẩm "${video.title}" (${video.code} - ${video.author}) trong Cuộc thi Video Facebook!`
    );
    window.open(shareUrl, '_blank', 'width=600,height=500');
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(video.fbUrl);
      onToast(`Đã sao chép link video (${video.code})!`);
    }
  };

  return (
    <div className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border ${
      rank === 1 && contestStatus === 'ended'
        ? 'border-amber-400 dark:border-amber-500 shadow-amber-500/10'
        : 'border-slate-200 dark:border-slate-800'
    } overflow-hidden shadow-sm hover:shadow-md transition-all duration-200`}>
      
      {/* Video Media Header */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {showEmbed ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={video.thumbnailUrl || '/src/assets/images/contest_stage_banner_1793708279116.jpg'}
              alt={video.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

            {/* Play Button Overlay */}
            <button
              type="button"
              onClick={() => setShowEmbed(true)}
              aria-label="Phát video ngay"
              className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover/btn:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-1 fill-white" />
              </div>
            </button>

            {/* Top Bar on Thumbnail */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="px-2.5 py-1 text-xs font-bold font-mono text-white bg-slate-950/80 backdrop-blur-sm rounded-md border border-white/10">
                {video.code}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPlayer(video);
                  }}
                  title="Xem toàn màn hình"
                  className="p-1.5 rounded-md bg-slate-950/70 text-slate-200 hover:text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <a
                  href={video.fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Mở trực tiếp trên Facebook"
                  className="p-1.5 rounded-md bg-slate-950/70 text-slate-200 hover:text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Rank badge on thumbnail */}
            <div className="absolute bottom-3 left-3 text-xs font-semibold text-white flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full ${
                rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/90 text-white'
              } flex items-center justify-center text-[10px] font-bold font-mono`}>
                #{rank}
              </span>
              <span className="text-slate-200 text-xs font-medium">
                {rank === 1 ? 'Hạng 1 (Dẫn đầu)' : `Hạng ${rank}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Author & Time */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
              {video.author}
            </span>
            <span aria-hidden="true">·</span>
            <span>Hạng #{rank}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{votePercentage}%</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenPlayer(video)}
            className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mb-2 transition-colors leading-snug"
          >
            {video.title}
          </h3>

          {/* Description */}
          {video.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              {video.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Vote Count & Vote CTA Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {contestStatus === 'ended' ? 'Phiếu chung cuộc' : 'Lượt bình chọn'}
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {video.votes.toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLink}
                title="Sao chép link"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShareFacebook}
                title="Chia sẻ lên Facebook"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
              >
                Share FB
              </button>
            </div>
          </div>

          {/* Big Vote Button - Controls enabled/disabled based on contest period and voting state */}
          <button
            type="button"
            onClick={() => onVote(video)}
            disabled={isVoteDisabled}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              contestStatus === 'upcoming'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 cursor-not-allowed'
                : contestStatus === 'ended'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                : hasUserVoted
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-[0.98] cursor-pointer'
            }`}
          >
            {contestStatus === 'upcoming' ? (
              <Clock className="w-4 h-4" />
            ) : hasUserVoted ? (
              <Check className="w-4 h-4" />
            ) : (
              <Heart className={`w-4 h-4 ${hasUserVoted ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
            )}
            <span>{getVoteButtonLabel()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
